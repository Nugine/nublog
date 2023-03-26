import {
    defineNuxtModule,
    extendPages,
    extendViteConfig,
    resolvePath,
    useLogger,
    useNuxt,
} from "@nuxt/kit";
import { globby } from "globby";
import assert from "node:assert";
import { readFile } from "node:fs/promises";
import { NuxtOptions } from "nuxt/schema";

import { compile, MarkdownOutput } from "./markdown";
import { ensureDir, sortInplace } from "./utils";
import VitePluginNuxtContent from "./vite";

const logger = () => useLogger("content");

export default defineNuxtModule({
    meta: {
        name: "content",
    },

    async setup() {
        const contentDir = await resolvePath("content");
        const outputs = await compileAllMarkdownFiles(contentDir);

        extendViteConfig((vite: NuxtOptions["vite"]) => {
            assert(vite.vue);
            assert(vite.vue.include === undefined);
            vite.vue.include = [/.vue$/, /.md$/];

            const vitePlugins = (vite.plugins ??= []);
            vitePlugins.push(VitePluginNuxtContent({ contentDir }));
        });

        extendPages((pages) => {
            const urlPaths = new Set<string>(outputs.map((o) => o.urlPath));
            for (const page of pages) {
                if (urlPaths.has(page.path)) {
                    throw new Error(`URL path conflict: ${page.path}`);
                }
            }

            for (const output of outputs) {
                pages.push({
                    path: output.urlPath,
                    file: contentDir + output.filePath,
                    children: [],
                });
            }
        });
    },
});

async function compileAllMarkdownFiles(contentDir: string): Promise<MarkdownOutput[]> {
    const nuxt = useNuxt();
    const consola = logger();

    consola.log("Compiling all markdown files ...");

    const filePaths = sortInplace(await globby("**/*.md", { cwd: contentDir })).map((s) => "/" + s);

    const buildDir = `${nuxt.options.buildDir}/content`;
    ensureDir(buildDir);

    const urlPaths = new Set<string>();
    const outputs = [];
    for (const filePath of filePaths) {
        consola.log(`Compiling: ${filePath}`);

        const fullPath = contentDir + filePath;
        const content = await readFile(fullPath, { encoding: "utf-8" });
        const output = await compile(filePath, content);
        outputs.push(output);

        if (urlPaths.has(output.urlPath)) {
            throw new Error(`URL path conflict: ${output.urlPath}`);
        }
        urlPaths.add(output.urlPath);
    }
    consola.log("Done");

    return outputs;
}
