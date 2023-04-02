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
import { VFile } from "vfile";
import * as hast from "hast";
import { useLogger } from "@nuxt/kit";
import { globby } from "globby";
import { readFile, writeFile } from "node:fs/promises";
import { isEqual } from "lodash";
import * as shiki from "shiki";
import path from "node:path";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { KatexOptions } from "katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { toc } from "mdast-util-toc";

import { validateDateString } from "./date";
import { asyncCached, sortInplace, stripSuffix } from "./utils";
import { rehypeShiki, rehypeGraphviz, rehypeGraphvizEmitStatements } from "./codeblock";
import { rehypeImage, rehypeImageEmitStatements } from "./image";

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

const remarkToc = () => (tree: mdast.Root) => {
    const tocResult = toc(tree, { tight: true });
    visit(tree, "paragraph", (node) => {
        // 将 "[TOC]" 替换为目录列表

        if (node.children.length !== 1) return;
        const child = node.children[0];

        if (child.type === "text") {
            if (child.value === "[TOC]" || child.value === "[toc]") {
                Object.assign(node, tocResult.map);
            }
        }
    });
};

const rehypeFixLink = () => (tree: hast.Root, file: VFile) => {
    visit(tree, "element", (node, _index, parent) => {
        if (node.tagName !== "a") return;

        const props = (node.properties ??= {});

        const href = props.href;
        assert(typeof href === "string" && href !== "");

        // 修正内部链接
        if (href.startsWith("./") || href.startsWith("../")) {
            if (href.endsWith(".md")) {
                props.href = toUrlPath(path.resolve(path.dirname(file.path), href));
            }
        }

        // 修正 h1 链接
        if (parent && parent.type === "element" && parent.tagName === "h1") {
            props.href = file.data.urlPath as string;
        }

        // 替换为自定义链接组件
        node.tagName = "XLink";
    });
};

const rehypeKatexShim = (opts?: KatexOptions) => {
    const transform = rehypeKatex(opts) as (tree: hast.Root, vfile: VFile) => void;
    return (tree: hast.Root, vfile: VFile) => {
        transform(tree, vfile);

        visit(tree, "element", (node) => {
            const className = node.properties?.className ?? [];
            assert(Array.isArray(className));
            if (className.includes("math")) {
                node.properties ??= {};
                node.properties["v-pre"] = "";
                return SKIP;
            }
        });
    };
};

async function buildProcessor() {
    const highlighter = await shiki.getHighlighter({ theme: "github-light" });

    return unified()
        .use(remarkParse)
        .use(remarkFrontmatter, ["yaml"])
        .use(remarkExtractFrontmatter, { name: "frontmatter", yaml: yaml.parse })
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkExtractTitle) // custom
        .use(remarkToc) // custom
        .use(remarkRehype)
        .use(rehypeGraphviz) // custom
        .use(rehypeShiki, { highlighter }) // custom
        .use(rehypeSlug)
        .use(rehypeAutolinkHeadings, { behavior: "wrap", test: ["h1", "h2", "h3", "h4"] })
        .use(rehypeKatexShim) // custom
        .use(rehypeImage) // custom
        .use(rehypeFixLink) // custom
        .use(rehypeStringify);
}

const cachedProcessor = asyncCached(buildProcessor);

export async function compile(filePath: string, content: string): Promise<MarkdownOutput> {
    const urlPath = toUrlPath(filePath);

    const input = new VFile({ path: filePath, value: content, data: { urlPath } });
    const processor = await cachedProcessor();
    const vfile = await processor.process(input);

    const frontmatter = (vfile.data.frontmatter as Record<string, unknown>) ?? {};
    checkDate(frontmatter.postDate);
    checkDate(frontmatter.editDate);
    const meta = { ...frontmatter };

    const script = [];
    script.push(`import MarkdownPage from "~/components/MarkdownPage.vue";`);
    script.push(`import XLink from "~/components/XLink";`);
    script.push(`import MarkdownImage from "~/components/markdown/MarkdownImage.vue";`);
    script.push(`import GraphViz from "~/components/markdown/GraphViz.vue";`);

    script.push(`const meta = ${JSON.stringify(meta)};`);

    script.push(...rehypeImageEmitStatements(vfile));
    script.push(...rehypeGraphvizEmitStatements(vfile));

    const vue = `
        <template>
            <MarkdownPage :meta="meta">
                ${String(vfile)}
            </MarkdownPage>
        </template>
        <script setup lang="ts">
            ${script.join("")}
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
