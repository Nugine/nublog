import { readFile, writeFile } from "node:fs/promises";
import { MarkdownOutput } from "./markdown";
import { existsSync } from "node:fs";
import { sha256sum } from "./utils";

export class MarkdownCache {
    constructor(private readonly map: Record<string, { sha256: string; output: MarkdownOutput } | undefined>) {}

    public static async load(cachePath: string): Promise<MarkdownCache> {
        let map: Record<string, { sha256: string; output: MarkdownOutput } | undefined> = {};
        if (existsSync(cachePath)) {
            const cacheJson = await readFile(cachePath, { encoding: "utf-8" });
            map = JSON.parse(cacheJson);
        }
        return new MarkdownCache(map);
    }

    public async save(cachePath: string) {
        await writeFile(cachePath, JSON.stringify(this.map));
    }

    public get(filePath: string, content: string): MarkdownOutput | null {
        const sha256 = sha256sum(content);
        const cachedItem = this.map[filePath];
        if (cachedItem && sha256 === cachedItem.sha256) {
            return cachedItem.output;
        }
        return null;
    }

    public set(filePath: string, content: string, output: MarkdownOutput) {
        const sha256 = sha256sum(content);
        this.map[filePath] = { sha256, output };
    }
}
