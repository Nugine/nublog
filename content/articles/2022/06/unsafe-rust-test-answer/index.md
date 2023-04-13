---
postDate: "2022-06-25"
links:
    知乎: https://zhuanlan.zhihu.com/p/533815162
---

# Unsafe Rust 随堂小测参考答案

第一季总共三卷，15 题，300 分，时间 120 分钟。

我个人认为，如果能在规定时间内取得至少 240 分，那么可以说对 Unsafe Rust 的推理方式与常见问题有较好的理解。未达要求的同学请勿在重要项目中自行动用 Unsafe Rust，请寻找支援。

[第一卷](./../unsafe-rust-test-1/index.md)

[第二卷](./../unsafe-rust-test-2/index.md)

[第三卷](./../unsafe-rust-test-3/index.md)

---

#### 第 1 题

概念：引用，内存布局，未初始化内存，内部可变性。

得分点 （3 * 10分）：

1. 当 T 的内存布局中含有对齐时，用于对齐的字节可能未初始化。
2. 当 T 具有内部可变性时，&T 无法保证所指向的内存不变。
3. 当 T 是 union 时（例如 MaybeUninit），&T 所指向的内存可能有一部分未初始化。

以上三点会违反 `slice::from_raw_parts` 的安全约束。

本题原型是 bytemuck 中的 [bytes_of](https://docs.rs/bytemuck/latest/bytemuck/fn.bytes_of.html) 函数。

#### 第 2 题

概念：trust 问题

得分点（1 * 10分）：Memory trait 是 safe trait，其中的方法都是 safe 方法，其他类型可以轻易写出错误的实现，因此 as_bytes 方法中无法保证 addr 和 length 有效，可能触发 UB。

得分点（2 * 10分）：一种修复方案是把 Memory trait 标记成 unsafe trait，另一种修复方案是把 as_bytes 方法标记成 unsafe fn。其他方案只要合理均可得分。

我在 2020 年的一篇文章中写过 [trust 问题](../../../2020/08/rust-trust/index.md)。有经验的人应该瞬间就能看出来吧。

#### 第 3 题

概念：分配器，零大小类型

得分点（1 * 10分）：全局分配器不接受分配零大小的内存，当 T 为零大小类型时可能触发 UB。

得分点（1 * 10分）：修复方案可以是返回空指针、触发 panic/abort、返回特殊地址作为指针。其他方案只要合理均可得分。

零大小类型与全局分配器是一对经典冤家，我相信不少人都会忘记这里需要特判。

#### 第 4 题

概念：引用，未初始化内存

得分点（1 * 10分）：read_exact 接受 `&mut [u8]`，它要求缓冲区内存已初始化，而连续的 reserve 和 set_len 把未初始化的内存暴露了出来。这两个条件一结合就是立即 UB。

得分点（1 * 10分）：修复也很简单，用零初始化的 Vec 即可。另一种方案是用 [Rust RFC 2930](https://rust-lang.github.io/rfcs/2930-read-buf.html) 的 ReadBuf。

```rust
#![forbid(unsafe_code)]

use std::io;

pub fn read_to_vec<R>(mut reader: R, expected: usize) -> io::Result<Vec<u8>>
where
    R: io::Read,
{
    let mut buf: Vec<u8> = vec![0; expected];
    reader.read_exact(&mut buf)?;
    Ok(buf)
}
```

只要看见连续的 reserve 和 set_len，多半是 UB。clippy 有个 [issue](https://github.com/rust-lang/rust-clippy/issues/4483) 正在讨论要不要为此加个 lint。


#### 第 5 题

概念：未初始化内存，类型安全

得分点（1 * 10分）：把 `&mut [T]` 转换为 `&mut [MaybeUninit<T>]` 之后，其中的 `T` 可以被替换成任意内存，导致 UB。

```rust
let mut s: Vec<Vec<u32>> = vec![vec![1]];
let u = as_uninit_mut(&mut s);
u[0] = MaybeUninit::zeroed();
```

其实这题用型变可以直接看出来，把 T 当作 `MaybeUninit<T>` 的子类型(subtype)，而 `&'a mut T` 对 T 不变，所以类型转换显然是不安全的。

#### 第 6 题

概念：对齐

得分点（1 * 10分）：当 T 的对齐要求大于任何 C 语言内置类型时，malloc 无法保证对齐，该函数有可能触发 UB。

同时了解 C 和 Rust 的人有没有考虑过这样一个问题：为什么 malloc 只需要 size，而 Rust 的堆分配却需要 size 和 align？

原来 malloc 分配出的指针保证符合任何内置类型的对齐要求，也适用于它们组合出的结构体，但更大的对齐则需要其他 API。

#### 第 7 题

概念：恐慌安全

得分点（1 * 10分）：当 f 恐慌时，val 可能被重复析构，导致 UB。

本题原型是一个[被关闭的 Rust RFC](https://github.com/rust-lang/rfcs/pull/1736)，[take_mut](https://docs.rs/take_mut) 库实现了它的提议。

#### 第 8 题

概念：分配器，切片

得分点（2 * 10分）：

1. 全局分配器不接受分配零大小的内存，当传入的 len 为 0 时可能触发 UB。
2. 当传入的 len 大于 `isize::MAX`，并且成功分配时，内存长度超过了切片类型内存大小的最大值，可能触发 UB。

glommio [踩过第一点的坑](https://github.com/DataDog/glommio/pull/352)。

在启用了物理地址扩展 (PAE) 的 32 位内核中，第二点还真有可能发生。

#### 第 9 题

概念：对齐

得分点（1 * 10分）：is_ascii 函数中把 `*const u8` 强转成 `*const u64` 来读取，但没有检查对齐，可能触发 UB。

得分点（1 * 10分）：修复方案是用裸指针的 read_unaligned 方法，或者用切片的 align_to 方法重构算法。

```rust
let chunk = p.cast::<u64>().read_unaligned();
```

本题算法利用 SIMD 实现加速，其中对齐问题是必须考虑的。

#### 第 10 题

概念：整数溢出

得分点（1 * 10分）：迭代器的 sum 方法在 release 模式下不会检查整数溢出，当 total_len 溢出时，后续的内存复制可能触发段错误。

得分点（1 * 10分）：真实环境中很难分配导致 usize 溢出的内存量，但可以给 concat_bytes 函数传入大量相同的内存块，触发段错误。

```rust
#[test]
fn test_concat_bytes() {
   const N: usize = 1 << 17;
   let bytes: Vec<u8> = vec![0; N];
   let _ = concat_bytes(&vec![bytes.as_slice(); N]);
}
```

选一个 32 位的编译目标，跑交叉测试，可以看见段错误。

```bash
cross test test_concat_bytes --release --target armv7-unknown-linux-gnueabihf
```

得分点（1 * 10分）：修复方案是用 try_fold 和 checked_add 检查整数溢出，获取安全的 total_len 值。

```rust
let total_len = v
    .iter()
    .copied()
    .try_fold(0, |acc: usize, src| acc.checked_add(src.len()))
    .expect("total len overflow");
```

本题展示的漏洞很有可能在一些自定义传输协议中出现，clippy 目前没有针对这种情况的 lint，需要多加小心。

#### 第 11 题

概念：引用，未初始化内存

得分点（10分 + 10分）：

1. 裸指针 `p` 所指向的内存可能未初始化，不能对其取引用。
2. 修复方案是用 `std::ptr::addr_of_mut!`，它能直接获取一个位置的裸指针而不产生 UB。

```rust
let header: *mut String = std::ptr::addr_of_mut!((*p).header);
let body: *mut [u8; N] = std::ptr::addr_of_mut!((*p).body);
```

本题展示的正是 placement new 的手动写法，但必须注意引用和未初始化内存的问题。

#### 第 12 题

概念：字符串，UTF8 编码

得分点（1 * 10分）：当 from 为空时，填充 ans 的过程有可能使 UTF8 编码的码点断开，生成无效编码。

得分点（1 * 10分）：测试用例只要包含多字节编码的码点即可。

```rust
assert_eq!(str_replace("中文", "", "1"), "1中1文1");
```

按照字节分隔来替换不行，我们一般按照码点分隔来替换。其实，最符合人视觉的替换方式是按字素簇分隔，但性能比按码点分隔要低很多。

#### 第 13 题

概念：别名规则，derive

得分点（1 * 10分）：默认的 Debug 实现会对 slice 中的每个元素取到共享引用，但此时已迭代出去的独占引用仍有可能存活，导致对同一位置的共享引用和独占引用同时生效，违反别名规则。

得分点（1 * 10分）：根据上面的分析，构造测试。

```rust
#[test]
fn test_deref_iter_mut() {
    let mut slice: Vec<Vec<u32>> = vec![vec![1], vec![2], vec![3]];
    let mut iter = DerefIterMut::new(&mut slice);
    let v0 = iter.next().unwrap();
    dbg!(&iter);
    dbg!(v0);
}
```

miri 会查出这里的 UB。

```bash
cargo +nightly miri test test_deref_iter_mut
```

本题的主体代码是正确的，很多人意识不到 derive(Debug) 可能与主体代码冲突，就算 Rust 标准库也不止一次犯过这种错。

<https://github.com/rust-lang/rust/issues/53566>

<https://github.com/rust-lang/rust/issues/85813>

#### 第 14 题

概念：ManuallyDrop，derive

得分点（1 * 10分）：默认的 Clone 实现会对 boxed_slice 中的每个元素调用 clone，而 `ManuallyDrop<T>` 又会调用 T 的 clone，但此时已迭代出去的 T 是无效的，从而导致 UB。

得分点（1 * 10分）：根据上面的分析，构造测试。

```rust
#[test]
fn test_into_iter() {
    let slice: Box<[Vec<u32>]> = Box::from([vec![1], vec![2], vec![3]]);
    let mut iter = IntoIter::new(slice);
    iter.next();
    let _ = iter.clone();
}
```

miri 会查出这里的 UB。

```bash
cargo +nightly miri test test_into_iter
```

第一眼看起来，本题似乎是重复析构，但实际上是访问无效值，用错误的理由也有可能成功构造测试。

#### 第 15 题

概念：反序列化，derive

得分点（1 * 10分）：默认的 Deserialize 实现会把 Month 类型当作 u8 的 newtype，从而使任何 u8 数值都能被反序列化转换到 Month 类型，绕过 Month::new 的检查。

得分点（1 * 10分）：根据上面的分析，构造测试。

```rust
#[test]
fn test_month() {
    let month: Month = serde_json::from_str("13").unwrap();
    let _ = month.name();
}
```

同样，miri 可以查出这里的越界访问。

```bash
cargo +nightly miri test test_month
```

本题的分析思路是寻找类型构造器。既然 Month::name 假设其值在 1 到 12 内，那么 Month 的所有构造方法都应当满足要求。构造器有 Month::new 和反序列化，后者没有做检查，显然不安全。

---

第一季十五道题的覆盖范围有限，没有对型变、同步、线程、协程等概念做出要求，在未来的第二季中将重点考察。我希望每题仅用短短几十行代码就能构建出相对真实的漏洞，如果有相关点子，欢迎交流和投稿。
