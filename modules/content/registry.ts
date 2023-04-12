import { useLogger } from "@nuxt/kit";
import { globby } from "globby";
import { readFile } from "node:fs/promises";

import { sortInplace } from "./utils";
import { MarkdownOutput, MarkdownMeta, compile } from "./markdown";
import { MarkdownCache } from "./cache";
import { toUrlPath } from "./link";

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

        const urlPaths = new Set<string>();
        for (const filePath of filePaths) {
            const urlPath = toUrlPath(filePath);
            if (urlPaths.has(urlPath)) {
                throw new Error(`URL path conflict: ${urlPath}`);
            }
            urlPaths.add(urlPath);
        }

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

        return new MarkdownRegistry(contentDir, outputs);
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
