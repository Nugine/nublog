import { defineNuxtModule, resolvePath } from "@nuxt/kit";
import { globby } from "globby";

export default defineNuxtModule({
    async setup() {
        console.log("------ content module setup start -------");

        const contentDir = await resolvePath("content");
        console.log(contentDir);

        const paths = await globby("**/*.md", { cwd: contentDir });
        console.dir(paths);

        console.log("------ content module setup end   -------\n\n");
    },
});
