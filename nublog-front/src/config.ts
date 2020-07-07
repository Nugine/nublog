import * as util from "./util";

export const beian = util.toReadonly({
    icp: {
        url: "http://www.miitbeian.gov.cn/",
        text: "苏ICP备19007025号"
    },
    gov: {
        url: "http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=32060202000537",
        text: "苏公网安备32060202000537号"
    }
});

export const site = util.toReadonly({
    title: "Nugine 的个人博客",
    startYear: 2019,
    author: {
        nickName: "Nugine",
        githubUrl: "https://github.com/Nugine",
        email: "nugine@foxmail.com"
    }
});



