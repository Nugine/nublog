# Rust 送命题(误)

1. 不使用 unsafe 实现单链表。

2. 使用 unsafe 封装双向链表，导出一组线性表接口，不允许出现安全漏洞。

3. 简要解释 Send 与 Sync 的含义，举四个例子，分别对应 !Send + !Sync，Send + !Sync，!Send + Sync，Send + Sync.

4. 调用 async 函数得到 future，并提交到 executor，最理想的情况下需要多少次堆分配？调用 async 函数时会执行内部代码吗？

5. 简要说明 pin project 的概念。

6. 什么是 UnwindSafe ?

7. 标准库 Iterator trait 的缺陷是什么？

8. 数组类型的缺陷是什么？

9. 什么情况下会产生 drop flag ？

心血来潮出了几道题，等有时间再写个解（也可能不写）

附加题：

使用 cargo 编译，在编译期读入 json 文件，堆排序后生成程序常量，运行时打印出来。请提出可行实现方案。
