import { Feed } from "feed";
import { setHeader } from "h3";

import { queryContentAll } from "~/composables/queryContent";
import { asyncCached } from "~/modules/content/utils";

export default defineEventHandler(async (ev) => {
    setHeader(ev, "Content-Type", "application/xml");
    return await buildRssFeed();
});

const buildRssFeed = asyncCached(async () => {
    const config = useAppConfig();

    const siteUrl = config.baseUrl;
    const copyright = `CC BY-NC-SA 4.0, © 2019 - ${new Date().getFullYear()}, Nugine`;

    const feed = new Feed({
        id: siteUrl,
        title: config.siteTitle,
        description: config.siteTitle,
        copyright,
        link: siteUrl,
    });

    const articles = await queryContentAll({ urlPrefix: "/articles" });
    const latestArticles = articles.slice(0, 20); // 输出最近的 20 篇文章

    for (const article of latestArticles) {
        if (!article.title) {
            throw new Error(`missing article title: ${article.urlPath}`);
        }
        if (!article.postDate) {
            throw new Error(`missing article postDate: ${article.urlPath}`);
        }

        const title = article.title;
        const link = config.baseUrl + article.urlPath;
        const date = toDate(article.editDate ?? article.postDate);
        const published = toDate(article.postDate);

        feed.addItem({ title, link, date, published });
    }

    return feed.atom1();
});

function toDate(dateString: string) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
}
