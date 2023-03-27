# Rust 开发环境指路

本文介绍有助于提高 Rust 开发效率的一些组件，并给出相关链接和简单说明。

## rustup

<https://rustup.rs/>

一键安装 Rust 编译器、组件、版本与包管理器，每个初学 Rust 的人都会走这一步。

## 换源

由于众所周知的原因，很多编程语言需要换源。

中国科学技术大学镜像源

+ rustup

    <https://lug.ustc.edu.cn/wiki/mirrors/help/rust-static>

+ crates.io

    <https://lug.ustc.edu.cn/wiki/mirrors/help/rust-crates>

更多示例请搜索 "Rust 换源"。

## VSCode

微软真香，JB 靠边站 (误)

<https://code.visualstudio.com/>

## rust-analyzer

rust-analyzer 是接替 RLS 的下一代 Rust 语言服务器，对多个编辑器提供插件。它正在快速演进，目前的开发体验已经很不错了。

+ GitHub 仓库

<https://github.com/rust-analyzer/rust-analyzer>

+ 安装指引

<https://rust-analyzer.github.io/manual.html#installation>

rust-analyzer 插件会尝试从 GitHub 上下载预构建的可执行文件，由于众所周知的原因，这个下载会非～～～常慢。

第一种方法：从 GitHub 仓库下载源码，自行编译安装。

第二种方法：用科学手段，从 GitHub Release 中下载对应平台的预构建文件，在插件配置中将 `rust-analyzer.serverPath` 设置为对应路径。或加入 Path 环境变量，设置为全局命令。

## TabNine

基于深度学习的智能提示插件，效果惊人。深度学习擅长提取模式，能有效猜中你想写的是什么。

<https://tabnine.com>

安装好 tabnine 后，在编辑器中键入 `tabnine::config`，会在浏览器中弹出 tabnine 的配置页面，启用 Deep TabNine Local，使用本地 CPU 运行深度学习模型。

由于众所周知的原因，模型的自动下载会失败，在配置页面最下方的 Logs 中可以找到模型的下载路径和下载失败的提示。

从 Logs 中复制 URL，用科学手段下载模型（约 700 MB），放到对应的本地路径，最后重启编辑器和插件。

值得一提的是，tabnine 是 Rust 写的，为了回馈 Rust 生态，tabnine 的付费功能对 Rust 代码免费开放。

<https://www.tabnine.com/faq#language>

## Rust Search Extension

用于搜索 Rust 文档的浏览器插件，基本上几次击键就能定位到标准库中的类型与函数。

+ GitHub 仓库

<https://github.com/Folyd/rust-search-extension>

因为 Firefox 搜索栏的行为不一致，击键次数会增加很多，建议用 Chrome 安装。

由于众所周知的原因，Chrome 商店需要用科学手段访问，或者也可以尝试第三方下载手段。

## cargo-edit

用命令修改项目依赖。

<https://github.com/killercup/cargo-edit>

## cargo-feature

用命令修改项目依赖的 features.

<https://github.com/Riey/cargo-feature>

## crates.io

官方维护的 Rust crate 注册表，类似 npm 与 pypi，调包、找包就去这里。

<https://crates.io/>

## docs.rs

官方维护的文档站，所有 crates.io 上的包都会在此自动生成风格统一的文档。

<https://docs.rs/>

## 官方文档

大部分语言问题都能在这里的文档中找到答案。

<https://www.rust-lang.org/learn>
