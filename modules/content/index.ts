import { defineNuxtModule, resolvePath } from "@nuxt/kit";
import { readSources } from "./markdown";

export default defineNuxtModule({
    async setup() {
        console.log("------ content module setup start -------");

        const contentDir = await resolvePath("content");

        const sources = await readSources(contentDir);
        console.dir(sources);

        console.log("------ content module setup end   -------\n\n");
    },
});
