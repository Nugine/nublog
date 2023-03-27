---
postDate: "2022-06-24"
---

# Unsafe Rust 随堂小测（三）

本卷总分为 100 分，时间 50 分钟。

开卷考试，资料限制为 Rust 官方文档、书籍和 Docs.rs 网站，禁止访问其他网站。

默认情况下，所有测试题仅可使用 Rust 标准库，禁止自行链接 C 标准库函数。

本卷不附带标准答案，完成后请自行订正。

本卷题号与[第二卷](../unsafe-rust-test-2/index.md)连续。

---

#### 第 11 题

类型 Buf 的 default_inplace 方法实现可能触发 UB，请指出原因并修复该方法。（20分）

```rust
const N: usize = 1024;

pub struct Buf {
    header: String,
    body: [u8; N],
}

impl Buf {
    /// FIXME: UB
    ///
    /// # Safety
    /// The pointer `p` must be valid for writes and be properly aligned.
    pub unsafe fn default_inplace(p: *mut Buf) {
        let header: *mut String = &mut (*p).header;
        header.write(String::default());

        let body: *mut [u8; N] = &mut (*p).body;
        body.write_bytes(0, 1);
    }
}
```

#### 第 12 题

str_replace 函数为什么是不健全的？（10分）

请增加测试用例，使该函数触发 UB。（10分）

```rust
/// !!!unsound!!!
pub fn str_replace(s: &str, from: &str, to: &str) -> String {
    if s.len() < from.len() {
        return s.to_owned();
    }

    let (s, from, to) = (s.as_bytes(), from.as_bytes(), to.as_bytes());
    let mut ans: Vec<u8> = Vec::new();

    unsafe {
        if from.is_empty() {
            for &b in s {
                ans.extend_from_slice(to);
                ans.push(b);
            }
            ans.extend_from_slice(to);
        } else {
            let mut i = 0;
            let end = s.len() - from.len();
            while i <= end {
                let probe = s.get_unchecked(i..i + from.len());
                if probe == from {
                    ans.extend_from_slice(to);
                    i += from.len();
                } else {
                    ans.push(s[i]);
                    i += 1;
                }
            }
        }

        String::from_utf8(ans).unwrap_unchecked()
    }
}

#[test]
fn test_str_replace() {
    assert_eq!(str_replace("abc", "a", "b"), "bbc");
    assert_eq!(str_replace("abc", "", "b"), "babbbcb");
    assert_eq!(str_replace("abc", "a", ""), "bc");
}
```

#### 第 13 题

以下是类型 DerefIterMut 的公开接口实现，其中存在什么问题？（10分）

请针对该类型的公开接口构造测试，使以下代码触发 UB。（10分）

```rust
use std::ops::DerefMut;

#[derive(Debug)]
pub struct DerefIterMut<'a, T> {
    slice: &'a mut [T],
    cur: usize,
}

impl<'a, T> DerefIterMut<'a, T> {
    pub fn new(slice: &'a mut [T]) -> Self {
        Self { slice, cur: 0 }
    }
}

impl<'a, T: DerefMut> Iterator for DerefIterMut<'a, T> {
    type Item = &'a mut T::Target;

    fn next(&mut self) -> Option<Self::Item> {
        let elem: &mut T = self.slice.get_mut(self.cur)?;
        let item: *mut T::Target = &mut **elem;
        self.cur += 1;
        unsafe { Some(&mut *item) }
    }
}
```

#### 第 14 题

以下是类型 IntoIter 的公开接口实现，其中存在什么问题？（10分）

请针对该类型的各公开接口构造测试，使以下代码触发 UB。（10分）

```rust

use std::mem::ManuallyDrop;
use std::{ptr, slice};

#[derive(Clone)]
pub struct IntoIter<T> {
    boxed_slice: Box<[ManuallyDrop<T>]>,
    cur: usize,
}

impl<T> IntoIter<T> {
    pub fn new(boxed_slice: Box<[T]>) -> Self {
        let boxed_slice: Box<[ManuallyDrop<T>]> = unsafe {
            let mut b = ManuallyDrop::new(boxed_slice);
            let data: *mut ManuallyDrop<T> = b.as_mut_ptr().cast();
            let len: usize = b.len();
            Box::from_raw(slice::from_raw_parts_mut(data, len))
        };
        Self {
            boxed_slice,
            cur: 0,
        }
    }
}

impl<T> Iterator for IntoIter<T> {
    type Item = T;

    fn next(&mut self) -> Option<Self::Item> {
        unsafe {
            let item: ManuallyDrop<T> = ptr::read(self.boxed_slice.get(self.cur)?);
            self.cur += 1;
            Some(ManuallyDrop::into_inner(item))
        }
    }
}

impl<T> Drop for IntoIter<T> {
    fn drop(&mut self) {
        unsafe {
            let data: *mut T = self.boxed_slice.as_mut_ptr().add(self.cur).cast();
            let len: usize = self.boxed_slice.len() - self.cur;
            let slice: *mut [T] = slice::from_raw_parts_mut(data, len);
            ptr::drop_in_place(slice);
        }
    }
}
```

#### 第 15 题

以下是类型 Month 的公开接口实现，其中存在什么问题？（10分）

请针对该类型的公开接口构造测试，使以下代码触发 UB。（10分）

本题测试函数允许使用任意第三方库，但禁止一切系统调用。

```rust

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct Month(u8);

impl Month {
    pub fn new(month: u8) -> Self {
        assert!((1..=12).contains(&month));
        Self(month)
    }

    pub fn name(self) -> &'static str {
        static NAME: &[&str; 12] = &[
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
        unsafe { NAME.get_unchecked((self.0 - 1) as usize) }
    }
}
```

---

Unsafe Rust 随堂小测第一季到此结束，总共三卷，300 分，时间 120 分钟。

每丢一个得分点，在实际项目中就有可能爆出相应的漏洞，各位同学有信心拿满分吗？
