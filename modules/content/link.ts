import { stripSuffix } from "./utils";
import type { VFile } from "vfile";
import * as hast from "hast";
import { visit } from "unist-util-visit";
import assert from "node:assert";
import path from "node:path";

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

export const rehypeFixLink = () => (tree: hast.Root, file: VFile) => {
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
