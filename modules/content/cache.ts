import { createStorage, Storage } from "unstorage";
import assert from "node:assert";
import fsDriver from "unstorage/drivers/fs";

import { MarkdownOutput } from "./markdown";
import { sha256sum } from "./utils";

interface MarkdownCacheItem {
    sha256: string;
    output: MarkdownOutput;
}

export class MarkdownCache {
    private storage: Storage;

    public constructor(cacheDir: string) {
        this.storage = createStorage({ driver: fsDriver({ base: cacheDir }) });
    }

    public async get(filePath: string, content: string): Promise<MarkdownOutput | null> {
        const key = filePath + ".json";
        const value = await this.storage.getItem(key);
        assert(value === undefined || typeof value === "object");

        const item = value as MarkdownCacheItem | undefined;
        const sha256 = sha256sum(content);

        if (item && sha256 === item.sha256) {
            return item.output;
        }
        return null;
    }

    public async set(filePath: string, content: string, output: MarkdownOutput) {
        const key = filePath + ".json";
        const sha256 = sha256sum(content);
        await this.storage.setItem(key, { sha256, output });
    }
}
