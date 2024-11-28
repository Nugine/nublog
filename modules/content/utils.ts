import { createHash } from "node:crypto";
import { existsSync, mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";

export function stripSuffix(s: string, suffix: string): string | null {
    if (s.endsWith(suffix)) {
        return s.substring(0, s.length - suffix.length);
    }
    return null;
}

export function stripPrefix(s: string, prefix: string): string | null {
    if (s.startsWith(prefix)) {
        return s.substring(prefix.length);
    }
    return null;
}

export function hasDuplicate(arr: string[]): boolean {
    return new Set(arr).size !== arr.length;
}

export async function mapJoinAll<T, U>(arr: T[], f: (val: T) => Promise<U>): Promise<U[]> {
    return await Promise.all(arr.map(f));
}

export function sortInplace(arr: string[]): string[] {
    return arr.sort((lhs, rhs) => (lhs !== rhs ? (lhs < rhs ? -1 : 1) : 0));
}

export function ensureDir(dir: string): void {
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
}

export async function createFile(filePath: string, content: string) {
    ensureDir(path.dirname(filePath));
    await writeFile(filePath, content);
}

export function asyncCached<T>(f: () => Promise<T>): () => Promise<T> {
    let ans: T | undefined;
    return async () => {
        if (ans === undefined) {
            ans = await f();
        }
        return ans;
    };
}

export function isValidHttpUrl(s: string): boolean {
    try {
        const url = new URL(s);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

export function sha256sum(s: string): string {
    return createHash("sha256").update(s).digest("hex");
}
