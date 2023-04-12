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

const IndexModuleId = "virtual:nuxt-content-index";
const resolvedIndexModuleId = "\0" + IndexModuleId;

// TODO: 热更新 nuxt-content-index

export default ({ registry }: Options): PluginOption => ({
    name: "vite-plugin-nuxt-content",
    enforce: "pre",

    resolveId(id) {
        if (id === IndexModuleId) {
            return resolvedIndexModuleId;
        }
    },

    load(id) {
        if (id === resolvedIndexModuleId) {
            const value = JSON.stringify(registry.getIndexData());
            return `export default ${value};`;
        }
    },

    async transform(content, file) {
        const filePath = matchFile(file, registry.getContentDir());
        if (!filePath) return;

        // https://github.com/nuxt/nuxt/blob/main/packages/nuxt/src/pages/page-meta.ts
        if (file.endsWith("?macro=true")) {
            return { code: "<template></template>", map: null };
        }

        const output = await registry.compile(filePath, content);
        return { code: output.vue, map: null };
    },
});
