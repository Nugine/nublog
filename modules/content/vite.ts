import { useLogger } from "@nuxt/kit";
import { PluginOption } from "vite";
import { compile } from "./markdown";
import { stripPrefix, stripSuffix } from "./utils";

export interface Options {
    contentDir: string;
}

const logger = () => useLogger("vite-plugin-nuxt-content");

function matchFile(file: string, contentDir: string): string | null {
    const fullPath = stripSuffix(file, "?macro=true") ?? file;
    const filePath = stripPrefix(fullPath, contentDir);
    if (filePath === null) return null;
    if (!filePath.endsWith(".md")) return null;
    return filePath;
}

export default (opts: Options): PluginOption => ({
    name: "vite-plugin-nuxt-content",
    enforce: "pre",

    async transform(content, file) {
        const filePath = matchFile(file, opts.contentDir);
        if (!filePath) return;

        const output = await compile(filePath, content);
        return output.vue;
    },

    async handleHotUpdate(ctx) {
        const filePath = matchFile(ctx.file, opts.contentDir);
        if (!filePath) return;

        const read = ctx.read;
        ctx.read = async () => {
            const content = await read();
            const output = await compile(filePath, content);

            const consola = logger();
            consola.info(`hot update: ${filePath}`);

            return output.vue;
        };
    },
});
