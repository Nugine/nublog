import { useLogger } from "@nuxt/kit";
import assert from "node:assert";
import { PluginOption } from "vite";
import { compile } from "./markdown";
import { stripPrefix } from "./utils";

export interface Options {
    contentDir: string;
}

export default (opts: Options): PluginOption => ({
    name: "vite-plugin-nuxt-content",
    enforce: "pre",

    async transform(content, file) {
        if (!file.endsWith(".md")) return;

        const filePath = stripPrefix(file, opts.contentDir + "/");
        assert(filePath !== null);

        const output = await compile(filePath, content);
        return output.vue;
    },

    async handleHotUpdate(ctx) {
        if (!ctx.file.endsWith(".md")) return;

        const filePath = stripPrefix(ctx.file, opts.contentDir + "/");
        assert(filePath !== null);

        const read = ctx.read;
        ctx.read = async () => {
            const content = await read();
            const output = await compile(filePath, content);

            const consola = useLogger("vite-plugin-nuxt-content");
            consola.log(`Compiling: ${filePath}`);

            return output.vue;
        };
    },
});
