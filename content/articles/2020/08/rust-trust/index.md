# Rust Trust 问题

在 Safe Rust 和 Unsafe Rust 的交界处存在着一类隐蔽的地雷，本文称之为 Trust 问题，以下将用一些例子来介绍这类问题。

## Read

编写一个函数，从 reader 中读取一段数据，然后交换头尾字节。

```rust
fn read_and_swap(reader: &mut impl Read, buf: &mut [u8]) -> io::Result<()> {
    let nread: usize = reader.read(buf)?;
    if nread > 1 {
        unsafe {
            let head = buf.as_mut_ptr();
            let tail = buf.as_mut_ptr().add(nread - 1);
            mem::swap(&mut *head, &mut *tail);
        }
    }
    Ok(())
}
```

事实上，这个函数的实现是有问题的。我们来爆破它。

```rust
pub struct IncorrectReader;

impl Read for IncorrectReader {
    fn read(&mut self, buf: &mut [u8]) -> io::Result<usize> {
        Ok(buf.len() + 1)
    }
}

#[test]
fn test() {
    let mut reader = IncorrectReader;
    let mut buf: [u8; 32] = [0u8; 32];
    read_and_swap(&mut reader, &mut buf).unwrap()
}
```

用 miri 来检查内存错误和未定义行为。

运行命令 `cargo +nightly miri test`，得到报错：

```
error: Undefined Behavior: inbounds test failed: pointer must be in-bounds at offset 35, but is outside bounds of alloc95710 which has size 32
```

报错原因：

1. 传入错误的 Read 实现，返回了大于缓冲区长度的 nread 值
2. 函数没有检查 nread，使用 unsafe 直接越界操作数据

用 Safe 代码爆破了 Unsafe 代码，这是一个 unsoundness 漏洞。

在思维定势中，我们会默认 Read 返回值不大于缓冲区的长度，而没有意识到 **Unsafe 不可信任 Safe**。

## 信任

**Unsafe 不可信任 Safe，Safe 可以信任 Unsafe**

这个结论看起来有点反直觉。首先要回答一个问题，什么是 “信任”？

代码的上下文中存在着“约束”，表示某些数据和类型满足某些条件。有些约束可以用类型系统表示，比如 `Send` 和 `Sync`，有些约束用借用检查和生存期表示，Rust 编译器可以自动检查，还有一些约束无法在编译期表示，它们通常在文档中注明，以下称为**运行期约束**。

我们重新定义“**信任**”的含义：**代码上下文中的所有约束都必定成立**。

+ 在 Safe 代码中，运行期约束可以被轻易破坏，有 panic 兜底，作者想怎么写都可以。
+ 在 Unsafe 代码中，一旦破坏约束就会出现漏洞，所以作者不能随意发挥。

因此，在 Safe 代码中不能假定所有运行期约束都成立，要么检查返回错误，要么 panic 挂掉。

Unsafe 代码中可以假定所有约束成立，这会由调用者和依赖库保证，出错也不是我的锅，谁叫你开 Unsafe 呢。

那么 Safe 和 Unsafe 的交界处呢？

+ Safe 代码必须检查所有约束，成立后才能调用 Unsafe。
+ Safe 代码可以认为 Unsafe 代码的结果满足约束。
+ Unsafe 代码必须检查 Safe 代码的结果是否满足约束，以免被爆破。

## Ord

我们来看 Ord trait 的定义，该 trait 表示一类满足全序约束的类型。

```rust
pub trait Ord: Eq + PartialOrd<Self> {
    fn cmp(&self, other: &Self) -> Ordering;
    ...
}
```

但 Safe 代码并不禁止你随机返回 Ordering，你可以构造一个完全紊乱的类型。

`BTreeMap<K, V>` 需要 K 是全序的，它应该：

+ 保证对于任何 Ord 的实现，都不会产生内存漏洞
+ 对于不正确的 Ord 实现，可以产生不正确的行为，例如死循环和找不到值

这相当于带着镣铐跳舞，怎么回避这个问题？

## Trusted

标准库中存在一个未稳定的 TrustedLen trait，表示迭代器的长度一定与 `.size_hint()` 一致。

```rust
pub unsafe trait TrustedLen: Iterator { }
```

实现这个 trait 需要开 unsafe，所以相应的迭代器是可以信任的，这就让 Unsafe 代码可以不经检查而使用迭代器的长度约束，允许优化加速。

然而，这一设计模式还不成熟，特化还没稳定，可能会受到限制。

Trust 问题的最优雅的解决方法是什么？这有待社区形成共识。
