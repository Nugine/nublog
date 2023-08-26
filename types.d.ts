// https://github.com/nuxt/nuxt/issues/19606
// https://github.com/hpcc-systems/hpcc-js-wasm#-typescript-notes
declare module "@hpcc-js/wasm/graphviz" {
    export * from "@hpcc-js/wasm/types/graphviz";
}

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
