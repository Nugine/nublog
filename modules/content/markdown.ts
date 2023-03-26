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
import { validateDateString } from "./date";
import assert from "node:assert";

import { visit, SKIP } from "unist-util-visit";
import * as mdast from "mdast";
import type { VFile } from "vfile";

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

    vue: string;
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

const processor = unified() //
    .use(remarkParse)
    .use(remarkFrontmatter, ["yaml"])
    .use(remarkExtractFrontmatter, { name: "frontmatter", yaml: yaml.parse })
    .use(remarkGfm)
    .use(remarkExtractTitle)
    .use(remarkRehype)
    .use(rehypeStringify);

export async function compile(src: MarkdownSource): Promise<MarkdownOutput> {
    const { filePath, urlPath, body } = src;
    const vfile = await processor.process(body);

    const frontmatter = (vfile.data.frontmatter as Record<string, unknown>) ?? {};
    checkDate(frontmatter.postDate);
    checkDate(frontmatter.editDate);

    const meta = { ...frontmatter };

    const html = String(vfile);
    const vue = `<template>${html}</template>`;

    return { filePath, urlPath, meta, vue };
}

function checkDate(s: unknown) {
    if (s !== undefined) {
        assert(typeof s === "string");
        validateDateString(s);
    }
}
