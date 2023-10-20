import { defineNuxtModule, extendPages, extendViteConfig, resolvePath, useLogger, useNuxt } from "@nuxt/kit";
import assert from "node:assert";
import type { NuxtOptions } from "nuxt/schema";

import { MarkdownRegistry } from "./registry";
import VitePluginNuxtContent from "./vite";
import { MarkdownCache } from "./cache";

export default defineNuxtModule({
    meta: {
        name: "content",
    },

    async setup() {
        const nuxt = useNuxt();
        const consola = useLogger("content");

        const contentDir = await resolvePath("content");

        const cacheDir = await resolvePath(".cache/content");
        const cache = new MarkdownCache(cacheDir);

        const registry = await MarkdownRegistry.load({ contentDir, cache });

        nuxt.hook("nitro:config", (nitro) => {
            const jsDataModule = (value: unknown) => `export default ${JSON.stringify(value)};`;
            nitro.virtual ??= {};
            nitro.virtual["virtual:nuxt-content-index"] = jsDataModule(registry.getIndexData());
        });

        extendViteConfig((viteConfig) => {
            const vite = viteConfig as NuxtOptions["vite"];
            assert(vite.vue);
            assert(vite.vue.include === undefined);
            vite.vue.include = [/.vue$/, /.md$/];

            const vitePlugins = (vite.plugins ??= []);
            vitePlugins.push(VitePluginNuxtContent({ registry }));
        });

        extendPages((pages) => {
            const outputs = [...Object.values(registry.getOutputs())];

            const urlPaths = new Set<string>(outputs.map((o) => o.meta.urlPath));
            for (const page of pages) {
                if (urlPaths.has(page.path)) {
                    throw new Error(`URL path conflict: ${page.path}`);
                }
            }

            for (const output of outputs) {
                pages.push({
                    path: output.meta.urlPath,
                    file: contentDir + output.meta.filePath,
                    children: [],
                });
            }
        });

        consola.success("Loaded contents\n");
    },
});
