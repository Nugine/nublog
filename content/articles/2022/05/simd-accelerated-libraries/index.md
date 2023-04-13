---
postDate: "2022-05-22"
editDate: "2023-02-06"
links:
    知乎: https://zhuanlan.zhihu.com/p/518119848
---

# SIMD 编解码加速库

uuid-simd, hex-simd, base64-simd: 三个使用 SIMD 的编解码加速库

无需 nightly，可用于 stable channel。

可能是目前 Rust 生态中最快的实现： 

+ uuid-simd 可为 uuid 的文本解析和格式化加速 3 倍以上。
+ hex-simd 比 faster-hex 更快。
+ base64-simd 比 radix64 更快，比 base64 快约 6~7 倍。 

通过公共抽象算法实现多平台支持： 

+ SSE4.1 
+ AVX2 
+ ARM NEON 
+ Aarch64 NEON 
+ WASM SIMD128  

仓库地址：  (求一波 star)

<https://github.com/Nugine/simd>

基准测试结果：<https://github.com/Nugine/simd/issues/25>

设计思路：[关于可移植 SIMD 库的设计](./../../../2021/11/portable-simd/index.md)

欢迎试用和测试！
