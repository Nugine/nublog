import type { PluginOption } from "vite";
import assert from "node:assert";

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

const indexModuleId = "virtual:nuxt-content-index";
const resolvedIndexModuleId = "\0" + indexModuleId;

export default ({ registry }: Options): PluginOption => ({
    name: "vite-plugin-nuxt-content",
    enforce: "pre",

    resolveId(id) {
        if (id === indexModuleId) {
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

    async handleHotUpdate(ctx) {
        if (!ctx.file.endsWith(".md")) return;

        // TODO: 仅当 meta 变化时才热更新

        const mod = await ctx.server.moduleGraph.getModuleByUrl(resolvedIndexModuleId);
        assert(mod !== undefined);
        await ctx.server.reloadModule(mod);
    },
});
