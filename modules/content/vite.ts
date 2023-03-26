import { useLogger } from "@nuxt/kit";
import { PluginOption } from "vite";
import { MarkdownRegistry } from "./markdown";
import { stripPrefix, stripSuffix } from "./utils";

export interface Options {
    registry: MarkdownRegistry;
}

const logger = () => useLogger("vite-plugin-nuxt-content");

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

        const output = await registry.compile(filePath, content);
        return output.vue;
    },

    async handleHotUpdate(ctx) {
        const filePath = matchFile(ctx.file, registry.contentDir);
        if (!filePath) return;

        const read = ctx.read;
        ctx.read = async () => {
            const content = await read();
            const output = await registry.compile(filePath, content);

            const consola = logger();
            consola.info(`hot update: ${filePath}`);

            return output.vue;
        };
    },
});
