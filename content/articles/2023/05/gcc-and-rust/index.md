---
postDate: "2023-05-03"
links:
    知乎: https://www.zhihu.com/question/598603252/answer/3010915935
---

# GCC 与 Rust

谈到 GCC 与 Rust 的关系时，社区通常会提到三个项目：

1. [gccrs](https://rust-gcc.github.io/)
2. [rustc_codegen_gcc](https://github.com/rust-lang/rustc_codegen_gcc)
3. [Rust for Linux](https://rust-for-linux.com/)

本文将对这三个项目进行简单的介绍，信息来源于官方网站和国外社区。

## gccrs

[GCC](https://gcc.gnu.org/) 的全称是 GNU Compiler Collection， 即 GNU 编译器套件，目前支持 C、C++、Objective-C、Fortran、Ada、Go 和 D 编程语言。

GCC 是 100% 的自由软件，使用具有传染性的 GPL 许可证以保护软件自由，这也导致了它与其他体系的软件的一些集成问题。

[gccrs](https://rust-gcc.github.io/) 是一个基于 GCC 的 Rust 编译器前端项目，它将 Rust 语言编译为 GCC 的中间语言 GIMPLE，然后再编译为目标代码。这种方案的好处[^1]有

+ 复用 GCC 积累的大量中端优化，甚至能强于 LLVM。
+ 混合 C/C++ 与 Rust 代码时，可以享受完整的链接时优化(LTO)。
+ 自动获得 GCC 支持的大量平台，其中包括 LLVM 尚未支持的一些嵌入式平台。
+ 可复用现有的 GCC 插件，例如 Linux 里的。
+ 可通过 GCC Rust 引导 rustc，实现另一种自举方法。

gccrs 的起源可以追溯到 Rust 0.9 （2015 年之前）[^2]。经过数年发展，Rust 已经有了大量生态，并且正在着手制定规范[^3]，gccrs 最近也在积极更新，每月、每周都会发布进度报告。

gccrs 的行为将会以 rustc 为准，与 rustc 保持一致，因此不用担心分裂问题。

对于很多人关心的借用检查特性，gccrs 计划复用 Rust 官方的 [Polonius](https://github.com/rust-lang/polonius) 来实现。

2022 年 7 月，gccrs 获得 GCC 指导委员会批准[^4]。

截至目前（2023 年 5 月），gccrs 已经完成了与 GCC 上游的初始合并，但由于完整度问题，没有包含在最新的 GCC 发布中[^5]。

## rustc_codegen_gcc

与 gccrs 相反，[rustc_codegen_gcc](https://github.com/rust-lang/rustc_codegen_gcc) 是基于 GCC 的 Rust 编译器后端项目，它接受 Rust 中间语言 MIR，然后利用 libgccjit 生成目标代码。

像这样的 Rust 编译器后端有

+ [rustc_codegen_llvm](https://github.com/rust-lang/rust/tree/master/compiler/rustc_codegen_llvm): 官方 LLVM 后端
+ [rustc_codegen_gcc](https://github.com/rust-lang/rustc_codegen_gcc): GCC 后端
+ [rustc_codegen_cranelift](https://github.com/bjorn3/rustc_codegen_cranelift): Cranelift 后端
+ [rustc_codegen_nvvm](https://github.com/Rust-GPU/Rust-CUDA#structure): CUDA 支持
+ [rustc_codegen_spirv](https://github.com/EmbarkStudios/rust-gpu): GPU Shader 支持

目前稳定的 Rust 编译器后端只有 LLVM，其他后端都处于实验阶段。

## Rust for Linux

[Rust for Linux](https://rust-for-linux.com/) 是 Linux 内核的一系列补丁，旨在支持用 Rust 编写内核组件[^6]。

+ 2019 年，Rust for Linux 项目启动。
+ 2022 年 9 月，Linus 在欧洲开源峰会上表示将推动 Rust 进入即将推出的 Linux 6.1
+ 2022 年 12 月，Linux 6.1 发布，包含 Rust 的正式支持[^7]。

Rust for Linux 启用了 rustc 中大量的不稳定特性，正在积极推动这些特性的稳定化，以确定一个最低 rustc 版本。Rust for Linux 没有修改官方编译器。

gccrs 与 rustc_codegen_gcc 可以为 Rust for Linux 提供更好的工具链兼容性。

此外，Rust 也在 Android[^8]、Windows[^9]、Fuchsia[^10] 等操作系统中得到应用。

[^1]: https://github.com/Rust-GCC/gccrs/wiki/Frequently-Asked-Questions#benefits
[^2]: https://github.com/Rust-GCC/gccrs#gcc-rust
[^3]: https://github.com/rust-lang/rfcs/pull/3355
[^4]: https://news.ycombinator.com/item?id=32057116
[^5]: https://rust-gcc.github.io/2023/04/24/gccrs-and-gcc13-release.html
[^6]: https://en.wikipedia.org/wiki/Rust_for_Linux
[^7]: https://www.infoq.com/news/2022/12/linux-6-1-rust/
[^8]: https://security.googleblog.com/2022/12/memory-safe-languages-in-android-13.html
[^9]: https://zhuanlan.zhihu.com/p/625636682
[^10]: https://fuchsia.dev/fuchsia-src/development/languages/rust?hl=zh-cn
