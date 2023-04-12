// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    vite: {
        clearScreen: false,
    },
    experimental: {
        payloadExtraction: false, // Is it useful?
    },
    nitro: {
        prerender: { routes: ["/sitemap.xml"] },
    },
});
