import { useLogger } from "@nuxt/kit";
import { globby } from "globby";
import { readFile } from "node:fs/promises";

import { sortInplace } from "./utils";
import { type MarkdownOutput, type MarkdownMeta, compile } from "./markdown";
import { MarkdownCache } from "./cache";
import { toUrlPath } from "./link";
import assert from "node:assert";

export interface MarkdownRegistryOptions {
    contentDir: string;
    cache: MarkdownCache;
}

export class MarkdownRegistry {
    private readonly outputs: Record<string, MarkdownOutput>;

    constructor(
        private readonly contentDir: string, //
        private readonly cache: MarkdownCache
    ) {
        this.outputs = {};
    }

    public static async load(opt: MarkdownRegistryOptions): Promise<MarkdownRegistry> {
        const consola = useLogger("content");

        const registry = new MarkdownRegistry(opt.contentDir, opt.cache);

        consola.info("Loading markdown files ...");

        const filePaths = sortInplace(await globby("**/*.md", { cwd: opt.contentDir })).map((s) => "/" + s);

        checkUrlConflict(filePaths);

        for (const filePath of filePaths) {
            const fullPath = opt.contentDir + filePath;
            const content = await readFile(fullPath, { encoding: "utf-8" });

            // 从 cache 中恢复 outputs，或重新编译
            const output = await registry.compile(filePath, content);
            registry.outputs[filePath] = output;
        }

        consola.success("Loaded markdown files");

        checkPostOrder(registry.getIndexData());

        return registry;
    }

    public async compile(filePath: string, content: string): Promise<MarkdownOutput> {
        const cachedOutput = await this.cache.get(filePath, content);
        if (cachedOutput) return cachedOutput;

        const consola = useLogger("content");
        consola.info(`Compiling: ${filePath}`);

        const output = await compile(filePath, content);
        await this.cache.set(filePath, content, output);
        this.outputs[filePath] = output;

        return output;
    }

    public getIndexData(): MarkdownMeta[] {
        return Object.values(this.outputs).map((output) => output.meta);
    }

    public getOutputs(): Record<string, MarkdownOutput> {
        return this.outputs;
    }

    public getContentDir(): string {
        return this.contentDir;
    }
}

function checkUrlConflict(filePaths: string[]) {
    const urlPaths = new Set<string>();
    for (const filePath of filePaths) {
        const urlPath = toUrlPath(filePath);
        if (urlPaths.has(urlPath)) {
            throw new Error(`URL path conflict: ${urlPath}`);
        }
        urlPaths.add(urlPath);
    }
}

function checkPostOrder(contents: MarkdownMeta[]) {
    const map = new Map<string, MarkdownMeta[]>();

    for (const content of contents) {
        assert(content.postDate !== undefined);
        const list = map.get(content.postDate) ?? [];
        list.push(content);
        map.set(content.postDate, list);
    }

    for (const [date, list] of map.entries()) {
        if (list.length === 1) continue;

        for (const content of list) {
            assert(content.postOrder !== undefined, `postOrder is undefined: ${date} ${content.filePath}`);
        }

        const uniqueOrders = new Set(list.map((c) => c.postOrder));
        if (uniqueOrders.size !== list.length) {
            throw new Error(`postOrder conflict: ${date}`);
        }
    }
}
