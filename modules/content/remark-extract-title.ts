import { visit, SKIP } from "unist-util-visit";
import type { Root, Content } from "mdast";
import type { VFile } from "vfile";
import assert from "node:assert";

export default () => (tree: Root, file: VFile) => {
    let first: Content | undefined;
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
    file.data.title ??= title;
};
