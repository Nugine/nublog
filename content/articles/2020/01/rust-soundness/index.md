---
postDate: "2020-01-18"
links:
    知乎: https://zhuanlan.zhihu.com/p/103378116
---

# 可靠性对 Rust 意味着什么？

简单来说，可靠性 (soundness) 在 Rust 语境下是指：用 Safe Rust 写出的程序能保证内存安全 (memory-safety) 和 线程安全 (thread-safety)。

### 我们得到了什么？

在编译期消除内存错误的可能，随便传递引用而不用担心引用失效，安心玩各种花招。

编码进类型系统的线程安全性，写多线程时可以清楚地知道每个对象能不能跨线程传递和访问。

借助已有的库快速写出应用，聚集于逻辑 Bug 和错误处理。

### 我们失去了什么？

生命周期加大了学习难度，熟练的人觉得十分自然，对于新手来说真是令人头疼。

Send, Sync, Unpin, UnwindSafe 这些标记怎么推理，协变逆变不变怎么推理。用 unsafe 写基础库的人必须清楚地知道怎么用，才能封装出安全的 API. 事实上，基础部分的心智负担一点也不小。

用 C++ 时不需要仔细考虑这些可靠性问题，毕竟使用者写出 UB (Undefined Behavior) 不关我事，是他姿势不对。用 Safe Rust 写出 UB 的锅要扣在库作者头上，这就造成负担的向上转移。

### 如何对待可靠性 Bug？

可靠性 Bug (unsoundness) 是指：用 Safe Rust 能写出引发内存不安全或线程不安全的代码，运行时会出现 UB.

unsoundness 发生的地方通常是符合正常人直觉的 API，但有可能用各种奇怪的类型转换绕过安全限制，只有刻意针对的时候才会出错。

从一开始就是错的 API 当然也属于 unsoundness.

一个看起来安全的 API 出错的可能：

1. 没有检查内部 unsafe 所依赖的运行时条件，例如错误地封装多线程访问，没有正确同步。
2. 没有考虑型变 (variance)，导致生存期错误。
3. 使用了不正确的 unsafe 代码，可能引发 UB。
4. 泛型约束不到位，让外部有可能传入不满足条件的类型。
5. ……

对于 UB 问题，显然应该全力修复，这关系到程序的正确性。

对于公开 API，需要考虑兼容性，立即撤销还是先 deprecate，要不要跳版本号，这些都不是能轻易决定的事。

对于内部 API，影响范围多大，要改多少，有没有必要立即修复，都要想想。

### 尊重

unsoundness 会动摇 Rust 的根本安全保证，但问题有多种，严重程度也不一样，应该区别看待。

有些人视 UB 为洪水猛兽，连带地，对 unsafe 也抱着敌视的态度，甚至在作者没有按他们的想要的方式处理 unsafe 时对作者人身攻击。

再难的技术问题与分歧都是死物，学技术的人眼中不该只有技术，尊重彼此才是最重要的。