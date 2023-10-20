import contents from "virtual:nuxt-content-index";
import type { MarkdownMeta } from "~~/modules/content/markdown";

export interface QueryContentAllOptions {
    urlPrefix?: string;
}

export async function queryContentAll(q?: QueryContentAllOptions): Promise<MarkdownMeta[]> {
    const urlPrefix = q?.urlPrefix;

    let ans = contents;

    if (urlPrefix) {
        ans = ans.filter((c) => c.urlPath.startsWith(urlPrefix));
    }

    sortContents(ans); // 默认排序

    return ans;
}

// 默认排序： 时间降序，关键字 (postDate, postOrder)
export function sortContents(contents: MarkdownMeta[]) {
    const compare = (lhs: MarkdownMeta, rhs: MarkdownMeta) => {
        if (!(lhs.postDate !== undefined && rhs.postDate !== undefined)) {
            throw new Error("postDate is required");
        }

        const [l1, r1] = [lhs.postDate, rhs.postDate];
        if (l1 !== r1) return l1 < r1 ? -1 : 1;

        const [l2, r2] = [lhs.postOrder ?? 0, rhs.postOrder ?? 0];
        if (l2 !== r2) return l2 < r2 ? -1 : 1;

        return 0;
    };

    contents.sort((lhs, rhs) => -compare(lhs, rhs));
}
