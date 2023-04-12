import { SitemapStream, streamToPromise } from "sitemap";
import { setHeader } from "h3";

import { queryContentAll } from "~/composables/queryContent";
import { asyncCached } from "~/modules/content/utils";

export default defineEventHandler(async (ev) => {
    setHeader(ev, "Content-Type", "application/xml");
    return await buildSiteMap();
});

const buildSiteMap = asyncCached(async () => {
    const config = useAppConfig();
    const contents = await queryContentAll();

    const sitemap = new SitemapStream();
    for (const content of contents) {
        const url = config.baseUrl + content.urlPath;
        sitemap.write({ url });
    }
    sitemap.end();

    return streamToPromise(sitemap);
});
