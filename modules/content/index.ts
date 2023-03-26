import { defineNuxtModule, resolvePath, useLogger } from "@nuxt/kit";
import assert from "node:assert";
import { globby } from "globby";
import { readFile } from "node:fs/promises";

import { compile } from "./markdown";
import { ensureDir, sortInplace } from "./utils";
import VitePluginNuxtContent from "./vite";

export default defineNuxtModule({
    async setup(_opts, nuxt) {
        const consola = useLogger("content");
        consola.log("------ module setup start -------");

        const contentDir = await resolvePath("content");

        assert(nuxt.options.vite.vue);
        assert(nuxt.options.vite.vue.include === undefined);
        nuxt.options.vite.vue.include = [/.vue$/, /.md$/];

        const vitePlugins = (nuxt.options.vite.plugins ??= []);
        vitePlugins.push(VitePluginNuxtContent({ contentDir }));

        const buildDir = `${nuxt.options.buildDir}/content`;
        ensureDir(buildDir);

        const filePaths = sortInplace(await globby("**/*.md", { cwd: contentDir }));
        const urlPaths = new Set<string>();
        const outputs = [];
        for (const filePath of filePaths) {
            consola.log(`compiling: ${filePath}`);
            const content = await readFile(`${contentDir}/${filePath}`, { encoding: "utf-8" });
            const output = await compile(filePath, content);
            outputs.push(output);

            // const dataPath = `${buildDir}/${output.urlPath}.json`;
            // await createFile(dataPath, JSON.stringify(output, null, 4));

            if (urlPaths.has(output.urlPath)) {
                throw new Error(`URL path conflict: ${output.urlPath}`);
            }
            urlPaths.add(output.urlPath);
        }
        consola.log("done");

        consola.log("------ module setup end   -------\n\n");
    },
});
