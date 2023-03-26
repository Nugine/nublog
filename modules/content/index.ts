import { defineNuxtModule, resolvePath, useLogger } from "@nuxt/kit";
import { compile, readSources } from "./markdown";
import { ensureDir, createFile } from "./utils";

export default defineNuxtModule({
    async setup(_opts, nuxt) {
        const consola = useLogger("content");
        consola.log("------ module setup start -------");

        const buildDir = `${nuxt.options.buildDir}/content`;
        ensureDir(buildDir);

        const contentDir = await resolvePath("content");
        const sources = await readSources(contentDir);
        const outputs = [];
        for (const src of sources) {
            consola.log(`compiling: ${src.filePath} -> ${src.urlPath}`);
            const output = await compile(src);
            outputs.push(output);

            const dataPath = `${buildDir}/${output.urlPath}.json`;
            await createFile(dataPath, JSON.stringify(output, null, 4));
        }
        consola.log("done");

        consola.log("------ module setup end   -------\n\n");
    },
});
