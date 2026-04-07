// Workaround for defu 6.1.6 breaking Nuxt's AppConfig type inference.
// The new CJS type declaration in defu no longer exports `Defu` as a named type,
// causing the generated .nuxt/types/app.config.d.ts to resolve AppConfig properties as `unknown`.
// Explicitly augmenting AppConfig here restores the correct types.

interface AppConfigProperties {
    baseUrl: string;
    siteTitle: string;
    beian: {
        icp: { url: string; text: string };
        gov: { url: string; text: string };
    };
}

declare module "@nuxt/schema" {
    interface AppConfig extends AppConfigProperties {}
}
declare module "nuxt/schema" {
    interface AppConfig extends AppConfigProperties {}
}
export {};
