import type { VFile } from "vfile";
import * as hast from "hast";
import { visit } from "unist-util-visit";
import assert from "node:assert";
import type { Script } from "./script";

export const rehypeImage = () => (tree: hast.Root, file: VFile) => {
    const images = new Map<string, string>();
    let cnt = 0;

    visit(tree, "element", (node) => {
        if (node.tagName !== "img") return;
        const properties = (node.properties ??= {});

        const src = properties.src;
        assert(typeof src === "string" && src !== "");

        if (!src.startsWith("http")) {
            const importName = `img${++cnt}`;
            images.set(importName, src);

            delete properties.src;
            properties[":src"] = importName;
        }

        node.tagName = "MarkdownImage";
    });

    const script = file.data.script as Script;
    script.addImport("MarkdownImage", "~/components/markdown/MarkdownImage.vue");
    for (const [importName, src] of images) {
        script.addImport(importName, src);
    }
};
