import { useLogger } from "@nuxt/kit";
import { globby } from "globby";
import { readFile } from "node:fs/promises";

import { sortInplace } from "./utils";
import { MarkdownOutput, MarkdownMeta, compile } from "./markdown";
import { MarkdownCache } from "./cache";
import { toUrlPath } from "./link";
import assert from "node:assert";

export interface MarkdownRegistryOptions {
    contentDir: string;
    cachePath: string;
}

export class MarkdownRegistry {
    constructor(
        private readonly contentDir: string, //
        private readonly outputs: Record<string, MarkdownOutput>
    ) {}

    public static async load(opt: MarkdownRegistryOptions): Promise<MarkdownRegistry> {
        const consola = useLogger("content");
        const contentDir = opt.contentDir;

        const cache = await MarkdownCache.load(opt.cachePath);

        consola.info("Loading markdown files ...");

        const filePaths = sortInplace(await globby("**/*.md", { cwd: contentDir })).map((s) => "/" + s);

        checkUrlConflict(filePaths);

        const outputs: Record<string, MarkdownOutput> = {};
        for (const filePath of filePaths) {
            const fullPath = contentDir + filePath;
            const content = await readFile(fullPath, { encoding: "utf-8" });

            const cachedOutput = cache.get(filePath, content);
            if (cachedOutput) {
                outputs[filePath] = cachedOutput;
                continue;
            }

            consola.info(`Compiling: ${filePath}`);

            const output = await compile(filePath, content);
            cache.set(filePath, content, output);
            outputs[filePath] = output;
        }

        await cache.save(opt.cachePath);

        consola.success("Loaded markdown files");

        const registry = new MarkdownRegistry(contentDir, outputs);
        checkPostOrder(registry.getIndexData());

        return registry;
    }

    public async compile(filePath: string, content: string): Promise<MarkdownOutput> {
        const output = await compile(filePath, content);
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
