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

import { validateDateString } from "./date";
import { stripSuffix } from "./utils";

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

    if (path == "index") {
        return "";
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

const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ["yaml"])
    .use(remarkExtractFrontmatter, { name: "frontmatter", yaml: yaml.parse })
    .use(remarkGfm)
    .use(remarkExtractTitle) // custom
    .use(remarkRehype)
    .use(rehypeExtractImages) // custom
    .use(rehypeStringify);

export async function compile(filePath: string, content: string): Promise<MarkdownOutput> {
    const urlPath = toUrlPath(filePath);
    const vfile = await processor.process(content);

    const frontmatter = (vfile.data.frontmatter as Record<string, unknown>) ?? {};
    checkDate(frontmatter.postDate);
    checkDate(frontmatter.editDate);
    const meta = { ...frontmatter };

    const images = vfile.data.images as Map<string, string>;
    const statements = [];
    for (const [importName, src] of images.entries()) {
        statements.push(`import ${importName} from "${src}";`);
    }

    const html = String(vfile);
    const vue = `<template>${html}</template><script setup lang="ts">${statements.join()}</script>`;

    return { filePath, urlPath, meta, vue };
}

function checkDate(s: unknown) {
    if (s !== undefined) {
        assert(typeof s === "string");
        validateDateString(s);
    }
}
