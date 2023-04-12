declare module "*.md" {
    import { type DefineComponent } from "vue";
    const component: DefineComponent<unknown, unknown, unknown>; // TODO: what should be the type here?
    export default component;
}

declare module "virtual:nuxt-content-index" {
    import type { MarkdownMeta } from "./markdown";
    const _default: MarkdownMeta[];
    export default _default;
}
