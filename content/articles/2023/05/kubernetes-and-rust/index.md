---
postDate: "2023-05-09"
links:
    知乎: https://www.zhihu.com/question/483698887/answer/3019963528
---

# Kubernetes 为什么没有采用 Rust 实现?

知乎回答：[Kubernetes 为什么没有采用 Rust 实现?](https://www.zhihu.com/question/483698887/answer/3019963528)

---

2012 年 3 月，Google 发布 Go 1.0。

2014 年年中，Google 宣布 Kubernetes 项目[^1]，简称 k8s，其原型为 Google 内部的 Borg 集群管理器。与用 C++ 编写的 Borg 不同，Kubernetes 源代码是用 Go 语言编写的。

2015 年 5 月 15 日，Rust 1.0 发布，当时 Rust 由 Mozilla 赞助。

2015 年 7 月 21 日，Kubernetes 1.0 发布。同时，Google 与 Linux 基金会合作组建了云原生计算基金会 (CNCF)，并提供 Kubernetes 作为种子技术。

显然，在 2015 年，对于 Kubernetes 这种量级的项目，Google 选择了相对成熟的、自家控制的 Go 语言，而不是刚刚发布 1.0 的 Rust 语言。

Google 的另一款产品 —— 2016 年披露的 Fuchsia 操作系统，已经大量使用 Rust 语言[^2]，用于系统组件开发。

根据 2022 年 12 月谷歌安全博客的一篇报告[^3]，Google 的 Android 操作系统已经应用 Rust 语言。AOSP 中大约有 150 万行 Rust 代码，涵盖新功能和组件，例如 Keystore2、新的超宽带 (UWB) 堆栈、DNS-over-HTTP3、Android 的虚拟化框架 (AVF) 以及各种其他组件及其开源依赖项。

在 2015 年，Google 选择 Go 语言是相当合理的技术决策，而在 2023 年，Rust 已经成立了基金会，具有了丰富的开源生态，在亚马逊、微软、谷歌、华为等大公司都有应用。

如果你有相应的人才储备和技术经验，新项目完全可以考虑 Rust 语言。

[^1]: https://en.wikipedia.org/wiki/Kubernetes
[^2]: https://en.wikipedia.org/wiki/Fuchsia_(operating_system)
[^3]: https://security.googleblog.com/2022/12/memory-safe-languages-in-android-13.html
