import contents from "~/.nuxt/contents.json";
import { MarkdownData } from "~~/modules/content/markdown";

export async function queryContentAll(): Promise<MarkdownData[]> {
    return contents;
}
