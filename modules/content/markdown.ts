import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import remarkExtractFrontmatter from "remark-extract-frontmatter";
import yaml from "yaml";
import assert from "node:assert";
import { visit, SKIP } from "unist-util-visit";
import * as mdast from "mdast";
import type { VFile } from "vfile";
import * as hast from "hast";
import { useLogger } from "@nuxt/kit";
import { globby } from "globby";
import { readFile, writeFile } from "node:fs/promises";
import { isEqual } from "lodash";
import * as shiki from "shiki";
import { fromHtml } from "hast-util-from-html";
import { toString } from "hast-util-to-string";
import { validateDateString } from "./date";
import { asyncCached, sortInplace, stripSuffix } from "./utils";

export interface MarkdownOutput {
    filePath: string;
    urlPath: string;

    meta: {
        title?: string;
        postDate?: string;
        editDate?: string;
        [key: string]: unknown;
    };

    vue: string;
}

export function toUrlPath(filePath: string): string {
    const path = stripSuffix(filePath, ".md");
    if (path === null) {
        throw new Error("Not Implemented");
    }

    if (path == "/index") {
        return "/";
    }

    const stripped = stripSuffix(path, "/index");
    return stripped ?? path;
}

const remarkExtractTitle = () => (tree: mdast.Root, file: VFile) => {
    let first: mdast.Content | undefined;
    visit(tree, (node) => {
        if (node.type === "root") return;
        if (node.type === "yaml") return SKIP;

        if (first) {
            assert(node.type !== "heading" || node.depth > 1, "Expected single h1 node");
        } else {
            first = node;
        }
    });

    assert(first !== undefined, "Expected a h1 node");
    assert(first.type === "heading" && first.depth === 1, "Expected h1 as the first node");
    assert(first.children.length === 1, "Expected a single child in h1");

    const firstChild = first.children[0];
    assert(firstChild.type === "text", "Expected a text node");

    const title = firstChild.value;

    const frontmatter = ((file.data.frontmatter as Record<string, unknown>) ??= {});
    frontmatter.title ??= title;
};

interface RehypeShikiOptions {
    hl: shiki.Highlighter;
}

const rehypeShiki = ({ hl }: RehypeShikiOptions) => {
    const loadedLanguages = new Set<string>(hl.getLoadedLanguages());

    const findLanguage = (node: hast.Element) => {
        const dataLanguage = node.properties?.dataLanguage;
        if (typeof dataLanguage === "string" && dataLanguage !== "") {
            return dataLanguage;
        }
        const classNames = node.properties?.className ?? [];
        assert(Array.isArray(classNames));
        for (const className of classNames) {
            assert(typeof className === "string");
            if (className.startsWith("language-")) {
                return className.slice("language-".length);
            }
        }
        return null;
    };

    return (tree: hast.Root) => {
        visit(tree, "element", (node, _index, parent) => {
            if (node.tagName !== "code") return;
            if (!parent || parent.type === "root" || parent.tagName !== "pre") return;

            const lang = findLanguage(node);
            assert(typeof lang === "string" && lang !== "" && loadedLanguages.has(lang));

            const html = hl.codeToHtml(toString(node), { lang: lang as shiki.Lang });
            const ast = fromHtml(html, { fragment: true });

            const pre = ast.children[0] as hast.Element;
            delete pre.properties?.style; // hack: remove style attribute

            const code = pre.children[0] as hast.Element;
            code.properties ??= {};
            code.properties["v-pre"] = ""; // hack: prevent vue from interpreting the code

            Object.assign(parent, pre);
        });
    };
};

const rehypeExtractImages = () => (tree: hast.Root, file: VFile) => {
    const images = new Map();
    let cnt = 0;
    visit(tree, (node) => {
        if (node.type === "element" && node.tagName === "img") {
            const properties = (node.properties ??= {});

            const src = properties.src;
            assert(typeof src === "string" && src !== "");

            if (!src.startsWith("http")) {
                const importName = `img${++cnt}`;
                images.set(importName, src);

                delete properties.src;
                properties[":src"] = importName;
            }
        }
    });

    file.data.images = images;
};

async function buildProcessor() {
    const hl = await shiki.getHighlighter({ theme: "github-light" });

    return unified()
        .use(remarkParse)
        .use(remarkFrontmatter, ["yaml"])
        .use(remarkExtractFrontmatter, { name: "frontmatter", yaml: yaml.parse })
        .use(remarkGfm)
        .use(remarkExtractTitle) // custom
        .use(remarkRehype)
        .use(rehypeShiki, { hl })
        .use(rehypeExtractImages) // custom
        .use(rehypeStringify);
}

const cachedProcessor = asyncCached(buildProcessor);

export async function compile(filePath: string, content: string): Promise<MarkdownOutput> {
    const urlPath = toUrlPath(filePath);

    const processor = await cachedProcessor();
    const vfile = await processor.process(content);

    const frontmatter = (vfile.data.frontmatter as Record<string, unknown>) ?? {};
    checkDate(frontmatter.postDate);
    checkDate(frontmatter.editDate);
    const meta = { ...frontmatter };

    const script_setup_statements = [];
    script_setup_statements.push(`import MarkdownPage from "~/components/MarkdownPage.vue";`);

    const images = vfile.data.images as Map<string, string>;
    for (const [importName, src] of images.entries()) {
        script_setup_statements.push(`import ${importName} from "${src}";`);
    }

    script_setup_statements.push(`const meta = ${JSON.stringify(meta)};`);

    const vue = `
        <template>
            <MarkdownPage :meta="meta">
                ${String(vfile)}
            </MarkdownPage>
        </template>
        <script setup lang="ts">
            ${script_setup_statements.join("")}
        </script>
    `;

    return { filePath, urlPath, meta, vue };
}

function checkDate(s: unknown) {
    if (s !== undefined) {
        assert(typeof s === "string");
        validateDateString(s);
    }
}

export interface MarkdownRegistryOptions {
    contentDir: string;
    contentsJsonPath: string;
}

export interface MarkdownRegistry {
    readonly contentDir: string;

    compile(filePath: string, content: string): Promise<MarkdownOutput>;

    getOutputs(): Readonly<Record<string, MarkdownOutput>>;

    getIndexData(): MarkdownData[];
}

export type MarkdownData = Omit<MarkdownOutput, "vue">;

export async function buildRegistry(opts: MarkdownRegistryOptions): Promise<MarkdownRegistry> {
    const consola = useLogger("markdown");
    const contentDir = opts.contentDir;

    consola.info("Compiling markdown files ...");

    const filePaths = sortInplace(await globby("**/*.md", { cwd: contentDir })).map((s) => "/" + s);

    const urlPaths = new Set<string>();
    const outputs: Record<string, MarkdownOutput> = {};
    for (const filePath of filePaths) {
        consola.info(`Compiling: ${filePath}`);

        const fullPath = contentDir + filePath;

        const content = await readFile(fullPath, { encoding: "utf-8" });
        const output = await compile(filePath, content);

        if (urlPaths.has(output.urlPath)) {
            throw new Error(`URL path conflict: ${output.urlPath}`);
        }
        urlPaths.add(output.urlPath);

        outputs[filePath] = output;
    }
    const indexData = gatherIndexData(outputs);
    await writeFile(opts.contentsJsonPath, JSON.stringify(indexData, null, 4));
    consola.success("Validated markdown files");

    return {
        contentDir,

        async compile(filePath: string, content: string) {
            const output = await compile(filePath, content);

            const needsWrite = !isEqual(output.meta, outputs[filePath].meta);
            outputs[filePath] = output;

            if (needsWrite) {
                consola.info(`Meta changed: ${filePath}`);
                const indexData = gatherIndexData(outputs);
                await writeFile(opts.contentsJsonPath, JSON.stringify(indexData, null, 4));
            }

            return output;
        },

        getOutputs() {
            return outputs;
        },

        getIndexData() {
            return gatherIndexData(outputs);
        },
    };
}

function gatherIndexData(outputs: Record<string, MarkdownOutput>): MarkdownData[] {
    return Object.values(outputs).map((output) => ({
        filePath: output.filePath,
        urlPath: output.urlPath,
        meta: output.meta,
    }));
}
