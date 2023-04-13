---
postDate: "2022-06-23"
links:
    知乎: https://zhuanlan.zhihu.com/p/532937544
---

# Unsafe Rust 随堂小测（二）

本卷总分为 100 分，时间 40 分钟。

开卷考试，资料限制为 Rust 官方文档、书籍和 Linux man page，禁止访问外部网站。

本卷不附带标准答案，完成后请自行订正。

本卷题号与[第一卷](../unsafe-rust-test-1/index.md)连续。

---

#### 第 5 题

as_uninit_mut 函数为什么是不健全(unsound)的？（10分）

```rust
use core::mem::MaybeUninit;

/// !!!unsound!!!
pub fn as_uninit_mut<T>(s: &mut [T]) -> &mut [MaybeUninit<T>] {
    let data: *mut MaybeUninit<T> = s.as_mut_ptr().cast();
    let len = s.len();
    unsafe { core::slice::from_raw_parts_mut(data, len) }
}
```

#### 第 6 题

ffi_static_mut 函数为什么是不健全的？（10分）

```rust
/// !!!unsound!!!
pub fn ffi_static_mut<T>(val: T) -> &'static mut T {
    unsafe {
        let size: usize = std::mem::size_of::<T>();
        let ptr: *mut T = libc::malloc(size).cast();
        if ptr.is_null() {
            std::process::abort();
        }
        ptr.write(val);
        &mut *ptr
    }
}
```

#### 第 7 题

replace_with 函数为什么是不健全的？（10分）

```rust
/// !!!unsound!!!
pub fn replace_with<T>(v: &mut T, f: impl FnOnce(T) -> T) {
    unsafe {
        let ptr: *mut T = v;
        let val = ptr.read();
        ptr.write(f(val));
    }
}
```

#### 第 8 题

alloc_uninit_bytes 函数为什么是不健全的？（20分）

```rust
use std::alloc::{alloc, handle_alloc_error, Layout};
use std::mem::MaybeUninit;
use std::slice;

/// !!!unsound!!!
pub fn alloc_uninit_bytes(len: usize) -> Box<[MaybeUninit<u8>]> {
    unsafe {
        let layout = Layout::from_size_align_unchecked(len, 1);
        let ptr = alloc(layout);
        if ptr.is_null() {
            handle_alloc_error(layout)
        }
        Box::from_raw(slice::from_raw_parts_mut(ptr.cast(), len))
    }
}
```

#### 第 9 题

is_ascii 函数为什么是不健全的？（10分）

请修复该函数，不能改变函数签名。（10分）

```rust

use std::ops::Not;

/// !!!unsound!!!
pub fn is_ascii(s: &[u8]) -> bool {
    unsafe {
        let mut p = s.as_ptr();
        let e = p.add(s.len());
        for _ in 0..s.len() / 8 {
            let chunk = p.cast::<u64>().read();
            if chunk & (0x8080_8080_8080_8080) != 0 {
                return false;
            }
            p = p.add(8);
        }
        while p < e {
            if p.read().is_ascii().not() {
                return false;
            }
            p = p.add(1);
        }
        true
    }
}
```

#### 第 10 题

concat_bytes 函数为什么是不健全的？（10分）

请构造测试，使该函数出现段错误。（10分）

请修复该函数，不能改变函数签名。（10分）

```rust
use std::ptr;

/// !!!unsound!!!
pub fn concat_bytes(v: &[&[u8]]) -> Vec<u8> {
    let total_len: usize = v.iter().copied().map(|src| src.len()).sum();

    let mut buf: Vec<u8> = Vec::with_capacity(total_len);
    unsafe {
        let mut dst = buf.as_mut_ptr();
        for &src in v {
            ptr::copy_nonoverlapping(src.as_ptr(), dst, src.len());
            dst = dst.add(src.len())
        }
        buf.set_len(total_len)
    }
    buf
}
```
