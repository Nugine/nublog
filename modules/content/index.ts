import {
    addTemplate,
    defineNuxtModule,
    extendPages,
    extendViteConfig,
    resolvePath,
    useLogger,
    useNuxt,
} from "@nuxt/kit";
import assert from "node:assert";
import { NuxtOptions } from "nuxt/schema";

import { buildRegistry } from "./registry";
import VitePluginNuxtContent from "./vite";

const logger = () => useLogger("content");

export default defineNuxtModule({
    meta: {
        name: "content",
    },

    async setup() {
        const nuxt = useNuxt();
        const consola = logger();

        const contentDir = await resolvePath("content");
        const registry = await buildRegistry({
            contentDir,
            indexPath: `${nuxt.options.buildDir}/contents-index.json`,
            cachePath: `${nuxt.options.buildDir}/contents-cache.json`,
        });

        await registry.saveCache();

        extendViteConfig((vite: NuxtOptions["vite"]) => {
            assert(vite.vue);
            assert(vite.vue.include === undefined);
            vite.vue.include = [/.vue$/, /.md$/];

            const vitePlugins = (vite.plugins ??= []);
            vitePlugins.push(VitePluginNuxtContent({ registry }));
        });

        addTemplate({
            filename: "contents-index.json",
            getContents: () => JSON.stringify(registry.getIndexData(), null, 4),
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
