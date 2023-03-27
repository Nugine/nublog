---
postDate: "2022-06-22"
---

# Unsafe Rust 随堂小测（一）

本卷总分为 100 分，时间 30 分钟。

开卷考试，资料仅限 Rust 标准库文档，禁止访问外部网站。

本卷不附带标准答案，完成后请自行订正。

---

#### 第 1 题

以下 bytes_of 函数为什么是不健全(unsound)的？（30分）

```rust
/// !!!unsound!!!
pub fn bytes_of<T>(val: &T) -> &[u8] {
    let len: usize = core::mem::size_of::<T>();
    let data: *const u8 = <*const T>::cast(val);
    unsafe { core::slice::from_raw_parts(data, len) }
}
```

#### 第 2 题

以下 Memory trait 的 as_bytes 方法为什么是不健全的？（10分）

请提出至少两种修复方案，使该 trait 健全。(20分)

```rust
pub trait Memory {
    fn addr(&self) -> *const u8;

    fn length(&self) -> usize;

    /// !!!unsound!!!
    fn as_bytes(&self) -> &[u8] {
        let data: *const u8 = self.addr();
        let len: usize = self.length();
        unsafe { core::slice::from_raw_parts(data, len) }
    }
}
```

#### 第 3 题

以下 alloc_for 函数为什么是不健全的？（10分）

请写出修复方案，不能改变函数签名。（10分）

```rust
/// !!!unsound!!!
pub fn alloc_for<T>() -> *mut u8 {
    let layout = std::alloc::Layout::new::<T>();
    unsafe { std::alloc::alloc(layout) }
}
```

#### 第 4 题

以下 read_to_vec 函数为什么是不健全的？（10分）。

请写出修复方案，不能改变函数签名。（10分）

```rust
use std::io;

/// !!!unsound!!!
pub fn read_to_vec<R>(mut reader: R, expected: usize) -> io::Result<Vec<u8>>
where
    R: io::Read,
{
    let mut buf: Vec<u8> = Vec::new();
    buf.reserve_exact(expected);
    unsafe { buf.set_len(expected) };
    reader.read_exact(&mut buf)?;
    Ok(buf)
}
```
