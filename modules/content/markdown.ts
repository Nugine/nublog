import { globby } from "globby";
import { readFile } from "node:fs/promises";
import { hasDuplicate, stripSuffix, mapJoinAll, sortInplace } from "./utils";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkFrontmatter from "remark-frontmatter";
import remarkExtractFrontmatter from "remark-extract-frontmatter";
import yaml from "yaml";
import remarkExtractTitle from "./remark-extract-title";
import { validateDateString } from "./date";
import assert from "node:assert";

export interface MarkdownSource {
    filePath: string;
    urlPath: string;
    body: string;
}

export interface MarkdownOutput {
    filePath: string;
    urlPath: string;

    meta: {
        title?: string;
        postDate?: string;
        editDate?: string;

        [key: string]: unknown;
    };

    html: string;
}

function toUrlPath(filePath: string): string {
    const path = stripSuffix(filePath, ".md");
    if (path === null) {
        throw new Error("Not Implemented");
    }

    if (path == "index") {
        return "";
    }

    const stripped = stripSuffix(path, "/index");
    return stripped ?? path;
}

export async function readSources(contentDir: string): Promise<MarkdownSource[]> {
    const filePaths = sortInplace(await globby("**/*.md", { cwd: contentDir }));

    const sources = await mapJoinAll(filePaths, async (filePath) => {
        const urlPath = toUrlPath(filePath);
        const fullPath = `${contentDir}/${filePath}`;
        const body = await readFile(fullPath, { encoding: "utf-8" });
        return { filePath, urlPath, body };
    });

    if (hasDuplicate(sources.map((s) => s.urlPath))) {
        throw new Error("URL path conflict");
    }

    return sources;
}

const processor = unified() //
    .use(remarkParse)
    .use(remarkFrontmatter, ["yaml"])
    .use(remarkExtractFrontmatter, { yaml: yaml.parse })
    .use(remarkGfm)
    .use(remarkExtractTitle)
    .use(remarkRehype)
    .use(rehypeStringify);

export async function compile(src: MarkdownSource): Promise<MarkdownOutput> {
    const { filePath, urlPath, body } = src;
    const vfile = await processor.process(body);

    const meta = vfile.data;
    validateMeta(meta);

    const html = String(vfile);
    return { filePath, urlPath, meta, html };
}

export function validateMeta(meta: MarkdownOutput["meta"]): void {
    if (meta.postDate !== undefined) {
        assert(typeof meta.postDate === "string");
        validateDateString(meta.postDate);
    }
    if (meta.editDate !== undefined) {
        assert(typeof meta.editDate === "string");
        validateDateString(meta.editDate);
    }
}
