import contents from "~/.nuxt/contents.json";
import { MarkdownData } from "~~/modules/content/markdown";

export interface QueryContentAllOptions {
    urlPrefix?: string;
}

export async function queryContentAll(q?: QueryContentAllOptions): Promise<MarkdownData[]> {
    const urlPrefix = q?.urlPrefix;

    let ans = contents;

    if (urlPrefix) {
        ans = ans.filter((c) => c.urlPath.startsWith(urlPrefix));
    }

    return ans;
}
