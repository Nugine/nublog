import { useLogger } from "@nuxt/kit";
import { globby } from "globby";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

import { sha256sum, sortInplace } from "./utils";
import { MarkdownOutput, MarkdownMeta, compile } from "./markdown";

export interface MarkdownRegistryOptions {
    contentDir: string;
    cachePath: string;
}

export interface MarkdownRegistry {
    readonly contentDir: string;

    compile(filePath: string, content: string): Promise<MarkdownOutput>;

    getOutputs(): Readonly<Record<string, MarkdownOutput>>;

    getIndexData(): MarkdownMeta[];

    saveCache(): Promise<void>;
}

export async function buildRegistry(opts: MarkdownRegistryOptions): Promise<MarkdownRegistry> {
    const consola = useLogger("content");
    const contentDir = opts.contentDir;

    consola.info("Compiling markdown files ...");
    const compiler = await buildCompiler(opts.cachePath);
    const filePaths = sortInplace(await globby("**/*.md", { cwd: contentDir })).map((s) => "/" + s);

    const urlPaths = new Set<string>();
    const outputs: Record<string, MarkdownOutput> = {};
    for (const filePath of filePaths) {
        consola.info(`Compiling: ${filePath}`);

        const fullPath = contentDir + filePath;
        const content = await readFile(fullPath, { encoding: "utf-8" });
        const output = await compiler.compile(filePath, content);

        if (urlPaths.has(output.meta.urlPath)) {
            throw new Error(`URL path conflict: ${output.meta.urlPath}`);
        }
        urlPaths.add(output.meta.urlPath);

        outputs[filePath] = output;
    }

    consola.success("Validated markdown files");

    return {
        contentDir,

        async compile(filePath: string, content: string) {
            const output = await compiler.compile(filePath, content);
            outputs[filePath] = output;
            return output;
        },

        getOutputs() {
            return outputs;
        },

        getIndexData() {
            return gatherIndexData(outputs);
        },

        async saveCache() {
            await compiler.saveCache();
        },
    };
}

function gatherIndexData(outputs: Record<string, MarkdownOutput>): MarkdownMeta[] {
    return Object.values(outputs).map((output) => output.meta);
}

interface MarkdownCache {
    [filePath: string]: { sha256: string; output: MarkdownOutput } | undefined;
}

async function loadCache(cachePath: string): Promise<MarkdownCache> {
    if (!existsSync(cachePath)) {
        return {};
    }
    const cacheJson = await readFile(cachePath, { encoding: "utf-8" });
    return JSON.parse(cacheJson);
}

async function saveCache(cachePath: string, value: MarkdownCache) {
    await writeFile(cachePath, JSON.stringify(value));
}

interface MarkdownCompiler {
    compile(filePath: string, content: string): Promise<MarkdownOutput>;
    saveCache(): Promise<void>;
}

async function buildCompiler(cachePath: string): Promise<MarkdownCompiler> {
    const cache = await loadCache(cachePath);

    return {
        async compile(filePath: string, content: string): Promise<MarkdownOutput> {
            const sha256 = sha256sum(content);

            const cachedItem = cache[filePath];
            if (cachedItem && sha256 === cachedItem.sha256) {
                // cache hit
                return cachedItem.output;
            }

            // cache miss
            const output = await compile(filePath, content);
            cache[filePath] = { sha256, output };

            return output;
        },

        async saveCache() {
            await saveCache(cachePath, cache);
        },
    };
}
