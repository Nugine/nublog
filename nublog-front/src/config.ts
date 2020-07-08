import * as utils from "./utils";

export const beian = utils.toReadonly({
    icp: {
        url: "http://www.miitbeian.gov.cn/",
        text: "苏ICP备19007025号"
    },
    gov: {
        url: "http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=32060202000537",
        text: "苏公网安备32060202000537号"
    }
});

export const site = utils.toReadonly({
    title: "Nugine 的个人博客",
    startYear: 2019,
    author: {
        nickName: "Nugine",
        githubUrl: "https://github.com/Nugine",
        email: "nugine@foxmail.com"
    }
});

export const api = utils.toReadonly({
    ssrUrlPrefix: "http://localhost/api",
    csrUrlPrefix: "/api"
});
