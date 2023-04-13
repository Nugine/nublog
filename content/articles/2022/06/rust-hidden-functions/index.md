---
postDate: "2022-06-03"
links:
    知乎: https://zhuanlan.zhihu.com/p/524003246
---

# Rust 中的“隐藏函数”

众所周知，Rust 标准库连随机数都没有，在一些无法调用第三方库的时候会带来麻烦，有办法解决吗？

答案是：有办法。

虽然 Rust 标准库没有给随机数 API，但 C 标准库给了。rustc 在编译时会链接 C 标准库，这不就有了吗。

试验代码：

```rust
use std::ptr;

#[allow(non_camel_case_types)]
type time_t = i64;

extern "C" {
    fn time(p: *mut time_t) -> time_t;
    fn srand(seed: u32);
    fn rand() -> i32;
}

fn main() {
    unsafe { srand(time(ptr::null_mut()) as u32) };
    let val = unsafe { rand() };
    println!("{val}");
}
```

根据目标平台写出对应的函数声明，就可以直接调用 C 标准库函数。

如果更进一步，能控制 rustc 的链接选项，那么系统里所有可链接的静态库、动态库在理论上都可以直接调用，但手写声明实在是太麻烦了。

如果会写汇编，还可以手搓系统调用，即使不链接 C 标准库，也能使用操作系统功能。

标题里的“隐藏函数”就是指 C 标准库函数。正常的在线评测环境（例如 leetcode）都会链接 C 标准库，要用随机数时不妨试一试。
