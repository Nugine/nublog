import { PluginOption } from "vite";
import { MarkdownRegistry } from "./registry";
import { stripPrefix, stripSuffix } from "./utils";

export interface Options {
    registry: MarkdownRegistry;
}

function matchFile(file: string, contentDir: string): string | null {
    const fullPath = stripSuffix(file, "?macro=true") ?? file;
    const filePath = stripPrefix(fullPath, contentDir);
    if (filePath === null) return null;
    if (!filePath.endsWith(".md")) return null;
    return filePath;
}

export default ({ registry }: Options): PluginOption => ({
    name: "vite-plugin-nuxt-content",
    enforce: "pre",

    async transform(content, file) {
        const filePath = matchFile(file, registry.contentDir);
        if (!filePath) return;

        // https://github.com/nuxt/nuxt/blob/main/packages/nuxt/src/pages/page-meta.ts
        if (file.endsWith("?macro=true")) {
            return { code: "<template></template>", map: null };
        }

        const output = await registry.compile(filePath, content);
        return { code: output.vue, map: null };
    },
});
