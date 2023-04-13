---
postDate: "2021-08-12"
links:
    知乎: https://zhuanlan.zhihu.com/p/399173889
---

# 用编译期计算来连接字符串

Rust 的编译期计算功能正在逐渐强化，现在我们已经可以做到生成字符串常量（而不是字面量），下面以简化版 concat 宏来演示编译期求值的写法。

生成字符串常量需要一个常量表达式，而不是 const fn。

const fn 既可以在编译期调用，也可以在运行期调用，一个接收 &str、返回 &'static str 的字符串连接函数必然产生某种形式的内存泄露。所以一个展开为常量表达式的宏才符合我们的需求。

```rust
#[macro_export]
macro_rules! my_concat {
    ($($s: expr),+) => {{
```

计算所有字符串的总长度。因为 for 循环解糖为迭代器，目前还不能在编译期求值，所以改用 while 循环。

```rust
        const STRS: &[&str] = &[
            $($s,)+
        ];

        const TOTAL_LEN: usize = {
            let mut ans = 0;
            let mut arr = STRS;
            while let [x, xs @ ..] = arr {
                ans += x.len();
                arr = xs;
            }
            ans
        };
```

生成一个字节数组，用双重循环把字符串内容复制进去。

```rust
        const CONST_STR_BUF: [u8; TOTAL_LEN] = {
            let mut buf: [u8; TOTAL_LEN] = [0; TOTAL_LEN];
            let mut cur: usize = 0;
            let mut arr = STRS;
            while let [x, xs @ ..] = arr {
                let bytes = x.as_bytes();
                let mut i = 0;
                while i < bytes.len() {
                    buf[cur] = bytes[i];
                    i += 1;
                    cur += 1;
                }
                arr = xs;
            }
            buf
        };
```

把 `&[u8]` 强转为 `&str`。因为两者内存表示一致，UTF8 编码可以直接连接，所以这里的强转是安全的。

```rust
        // unsafe { ::core::str::from_utf8_unchecked(&CONST_STR_BUF)} // const since 1.55
        unsafe { ::core::mem::transmute::<&[u8], &str>(&CONST_STR_BUF) }
    }};
}
```

然后来写测试。

str 的相等运算符还不能在编译期求值，因此手动写一个比较函数。

```rust
pub const fn str_eq(lhs: &str, rhs: &str) -> bool {
    if lhs.len() != rhs.len() {
        return false;
    }
    let len = lhs.len();
    let lhs = lhs.as_bytes();
    let rhs = rhs.as_bytes();
    let mut i = 0;
    while i < len {
        if lhs[i] != rhs[i] {
            return false;
        }
        i += 1
    }
    true
}
```

assert 宏和 panic 宏目前也不是 const 的，再手动写一个 const_assert 宏。利用 bool 转换为 usize 和数组边界检查来触发编译错误。

```rust
#[macro_export]
macro_rules! const_assert {
    ($e:expr) => {
        const _: () = [()][(!($e) as usize)];
    };
}
```

编写测试。这里的测试函数编译后为空函数，条件已经在编译期检查过了。

```rust
pub const HELLO: &str = "hello";
pub const WORLD: &str = "world";
pub const HELLO_WORLD: &str = my_concat!(HELLO, " ", WORLD);

#[test]
fn test() {
    const_assert!(str_eq(HELLO_WORLD, "hello world"));
}
```

完整代码：<https://play.rust-lang.org/?version=beta&mode=release&edition=2018&gist=1f106ddc1eeb48923b18572b178a062f>

各位学会了吗？

课后练习：实现编译期堆排序。

[参考答案](https://play.rust-lang.org/?version=stable&mode=debug&edition=2018&gist=28fb96a85795b39b44e03389d8cdbbee)
