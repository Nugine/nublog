---
postDate: "2023-06-21"
links:
    知乎: https://www.zhihu.com/question/607631457/answer/3083745061
---

# 为什么不用 Rust 重写 Rust 的编译器？

知乎回答：[为什么不用Rust重写Rust的编译器？](https://www.zhihu.com/question/607631457/answer/3083745061)

---

先问是不是，再问为什么。

在回答问题前，我们先介绍一些背景知识。

我们通常所说的 Rust 编译器是指官方编译器 rustc。它是目前唯一生产可用的 Rust 编译器，也是 Rust 语言的参考实现。

## Rust 的编译过程

rustc 的转换过程[^1]包括：

1. 源代码
2. 标记流 (Token Stream)
3. 抽象语法树 (AST)
4. 高级中间表示 (HIR)
5. 中级中间表示 (MIR)
6. LLVM IR
7. 机器码

### 词法分析 (Lexing) 和语法分析 (Parsing)

词法分析将源代码转换为标记流 (Token Stream)，语法分析将标记流转换为抽象语法树 (AST)。

宏展开、AST 验证、名称解析也在这一阶段完成。

###  HIR 下降转换 (Lowering)

HIR Lowering 将 AST 转换为高级中间表示 (HIR)。

语法糖的“脱糖”、类型检查 (type checking) 在这一阶段完成。

### MIR 下降转换

MIR Lowering 将 HIR 转换为中级中间表示 (MIR)。

借用检查、MIR 优化、单态化收集在这一阶段完成。

### 代码生成 (Code Generation)

rustc 将 MIR 转换为 LLVM IR，再由 LLVM 生成机器码。

LLVM 会执行大量优化，包括内联、常量传播、常量折叠、死代码消除、循环展开、向量化等。

如果 Rust 与其他语言一起编译到 LLVM IR，执行代码生成，还可以享受跨语言的链接时优化 (LTO)。

## Rust 编译器后端

Rust 编译器可分为前端和后端。前端是指从源代码到 MIR 的转换过程，后端是指从 MIR 到机器码的转换过程。

Rust 的编译器后端有

+ [rustc_codegen_llvm](https://github.com/rust-lang/rust/tree/master/compiler/rustc_codegen_llvm): 官方 LLVM 后端
+ [rustc_codegen_gcc](https://github.com/rust-lang/rustc_codegen_gcc): GCC 后端
+ [rustc_codegen_cranelift](https://github.com/bjorn3/rustc_codegen_cranelift): Cranelift 后端
+ [rustc_codegen_nvvm](https://github.com/Rust-GPU/Rust-CUDA#structure): CUDA 支持
+ [rustc_codegen_spirv](https://github.com/EmbarkStudios/rust-gpu): GPU Shader 支持

其中 Cranelift 后端是完全由 Rust 编写的。

目前稳定的 Rust 编译器后端只有 LLVM，其他后端都处于实验阶段。

### LLVM 后端

使用 LLVM 后端的优势在于[^2]：

+ LLVM 是成熟的编译器，已经有超过 20 年的历史，踩过无数的坑
+ LLVM 积累了大量优化，生成的机器码相当高效
+ LLVM 是模块化的，许可证友好，便于集成到其他项目中
+ LLVM 有大量的周边积累，包括调试器、性能分析器、反汇编器等
+ 基于 LLVM IR，可以与其他语言一起编译，实现跨语言互操作和优化
+ Rust 使用 LLVM 的过程中可以反哺上游社区，也会有利于其他语言

### Cranelift 后端

[Cranelift](https://github.com/bytecodealliance/wasmtime/tree/main/cranelift) 是字节码联盟 (Bytecode Alliance) 旗下的一个编译器后端项目，支持 AOT 和 JIT，主要用于 WASM，聚焦于快速、安全、相对简单、创新。

Cranelift 后端完全由 Rust 编写。Wasmtime 和 Rust 编译器都使用了 Cranelift。

Cranelift 作为 Rust 编译器后端的优势在于：
+ 提升编译速度，改进开发时体验
+ 规模小，优化保守，便于验证正确性

据一篇论文测量[^3] [^4]，Cranelift 生成的代码比 V8（TurboFan）慢约 2%，比 LLVM 慢约 14%，但 Cranelift 的代码生成速度比 LLVM 快一个数量级。

## Rust 解释器

除了生成机器码的编译器后端，Rust 还存在解释器。

[Miri](https://github.com/rust-lang/miri) 是一个 Rust 解释器，可以执行 Rust 的 MIR，用于检测 unsafe 代码的未定义行为。

Miri 已经成功检测出了整个 Rust 生态中的许多 bug，包括标准库中的健全性问题。

现在我们编写 unsafe 代码时都会尽可能利用 Miri 进行测试。

## 总结

> Rust 编译器是用 Rust 写的吗？

Rust 编译器前端是用 Rust 写的，编译器后端使用了 LLVM，一般可以认定为实现自举。

此外也存在完全由 Rust 编写的 Rust 编译器后端。

> 按本语言从头到尾覆盖所有工具链的定义，目前 Rust 官方编译器后端没有实现自举，为什么不重写？

如果你把聚焦于编译速度的 Cranelift 算进去，那么可以说“正在重写”。

实际上，使用 LLVM 是目前最现实和最优的选择，结合上下游社区的优势远大于重造轮子。

更何况，谁有信心、时间和资源在优化能力上击败 LLVM 和 GCC？

扩展阅读：[GCC 和 Rust](../../05/gcc-and-rust/index.md)

[^1]: https://rustc-dev-guide.rust-lang.org/overview.html
[^2]: https://en.wikipedia.org/wiki/LLVM
[^3]: https://cranelift.dev/
[^4]: https://arxiv.org/abs/2011.13127
