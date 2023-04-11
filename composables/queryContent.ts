import contents from "~/.nuxt/contents-index.json";
import { MarkdownMeta } from "~~/modules/content/markdown";

export interface QueryContentAllOptions {
    urlPrefix?: string;
}

export async function queryContentAll(q?: QueryContentAllOptions): Promise<MarkdownMeta[]> {
    const urlPrefix = q?.urlPrefix;

    let ans = contents;

    if (urlPrefix) {
        ans = ans.filter((c) => c.urlPath.startsWith(urlPrefix));
    }

    return ans;
}
