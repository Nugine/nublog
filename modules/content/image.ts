import type { VFile } from "vfile";
import * as hast from "hast";
import { visit } from "unist-util-visit";
import assert from "node:assert";

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

    file.data.images = images;
};

export function rehypeImageEmitStatements(vfile: VFile): string[] {
    const images = vfile.data.images as Map<string, string>;

    const statements: string[] = [];
    for (const [importName, src] of images) {
        statements.push(`import ${importName} from "${src}";`);
    }
    return statements;
}
