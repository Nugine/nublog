declare module "*.md" {
    import { type DefineComponent } from "vue";
    const component: DefineComponent<unknown, unknown, unknown>; // TODO: what should be the type here?
    export default component;
}
