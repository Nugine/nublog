import * as shiki from "shiki";
import * as hast from "hast";
import { visit, SKIP } from "unist-util-visit";
import assert from "node:assert";
import { toString } from "hast-util-to-string";
import { fromHtml } from "hast-util-from-html";
import type { Graphviz, Engine as GraphvizEngine } from "@hpcc-js/wasm/graphviz";

function findLanguage(node: hast.Element): string | null {
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
}

function normalizeLanguage(lang: string | null): string {
    // hack: https://github.com/shikijs/shiki/pull/444
    if (lang === "dockerfile") {
        return "docker";
    }
    return lang ?? "txt";
}

function getMeta(node: hast.Element): string | null {
    if (node.data === undefined) {
        return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta: unknown = (node.data as any).meta; // FIXME
    assert(typeof meta === "string" || meta === undefined);
    return meta ?? null;
}

export interface RehypeShikiOptions {
    highlighter: shiki.Highlighter;
}

export const rehypeShiki = (opts: RehypeShikiOptions) => (tree: hast.Root) => {
    visit(tree, "element", (node, _index, parent) => {
        if (node.tagName !== "code") return;
        if (!parent || parent.type === "root" || parent.tagName !== "pre") return;
        const lang = normalizeLanguage(findLanguage(node));

        const html = opts.highlighter.codeToHtml(toString(node), { lang: lang as shiki.Lang });
        const root = fromHtml(html, { fragment: true });

        const pre = root.children[0] as hast.Element;
        delete pre.properties?.style; // hack: remove style attribute

        const code = pre.children[0] as hast.Element;
        code.properties ??= {};
        code.properties["v-pre"] = ""; // hack: prevent vue from interpreting the code

        Object.assign(parent, pre);
        return SKIP;
    });
};

export interface RehypeGraphvizOptions {
    graphviz: Graphviz;
}

export const rehypeGraphviz = (opt: RehypeGraphvizOptions) => (tree: hast.Root) => {
    const parseMeta = (meta: string | null): GraphvizEngine | null => {
        if (meta === null) {
            return null;
        }
        const regex = /^\{engine="(.+)"\}$/;
        const match = meta.match(regex);
        if (match === null) {
            throw new Error(`invalid meta: ${meta}`);
        }
        const engine = match[1];
        switch (engine) {
            case "circo":
            case "dot":
            case "fdp":
            case "sfdp":
            case "neato":
            case "osage":
            case "patchwork":
            case "twopi":
                return engine;
            default:
                throw new Error(`invalid engine: ${engine}`);
        }
    };

    visit(tree, "element", (node, _index, parent) => {
        if (node.tagName !== "code") return;
        if (!parent || parent.type === "root" || parent.tagName !== "pre") return;
        const lang = normalizeLanguage(findLanguage(node));

        if (lang !== "dot") {
            return;
        }

        const meta = getMeta(node);

        const engine = parseMeta(meta) ?? "dot";
        const dot = toString(node);
        const svg = opt.graphviz.layout(dot, "svg", engine);

        const svgRoot = fromHtml(svg, { fragment: true });

        const vue: hast.Element = {
            type: "element",
            tagName: "div",
            properties: {
                class: `graphviz-svg`,
            },
            children: svgRoot.children as hast.Element[],
        };

        Object.assign(parent, vue);
        return SKIP;
    });
};
