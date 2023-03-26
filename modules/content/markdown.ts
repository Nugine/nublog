import { globby } from "globby";
import { readFile } from "node:fs/promises";
import { hasDuplicate, stripSuffix, mapJoinAll } from "./utils";

export interface Source {
    filePath: string;
    urlPath: string;
    body: string;
}

function toUrlPath(filePath: string): string {
    const path = stripSuffix("/" + filePath, ".md");
    if (path === null) {
        throw new Error("Not Implemented");
    }

    if (path == "/index") {
        return "/";
    }

    const stripped = stripSuffix(path, "/index");
    return stripped ?? path;
}

export async function readSources(contentDir: string): Promise<Source[]> {
    const filePaths = await globby("**/*.md", { cwd: contentDir });

    const sources = await mapJoinAll(filePaths, async (filePath) => {
        const urlPath = toUrlPath(filePath);
        const fullPath = `${contentDir}/${filePath}`;
        const body = await readFile(fullPath, { encoding: "utf-8" });
        return { filePath, urlPath, body };
    });

    if (hasDuplicate(sources.map((s) => s.urlPath))) {
        throw new Error("URL path conflict");
    }

    return sources;
}
