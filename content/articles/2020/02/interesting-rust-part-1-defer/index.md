# Rust 有趣片段(一)：defer 

本系列用于分享一些简短有趣的 Rust 代码片段。第一篇介绍 defer 宏，它来自 async-std.

[async-std/src/utils.rs](https://docs.rs/crate/async-std/1.5.0/source/src/utils.rs)

```rust
/// Defers evaluation of a block of code until the end of the scope.
#[cfg(feature = "default")]
#[doc(hidden)]
macro_rules! defer {
    ($($body:tt)*) => {
        let _guard = {
            pub struct Guard<F: FnOnce()>(Option<F>);

            impl<F: FnOnce()> Drop for Guard<F> {
                fn drop(&mut self) {
                    (self.0).take().map(|f| f());
                }
            }

            Guard(Some(|| {
                let _ = { $($body)* };
            }))
        };
    };
}
```

注释上说，这个宏可以将代码块的执行推迟到作用域末尾。我们来实验一下。

```rust
fn main() {
    pub struct Guard<F: FnOnce()>(Option<F>);
    impl<F: FnOnce()> Drop for Guard<F> {
        fn drop(&mut self) {
            if let Some(f) = (self.0).take() {
                f()
            }
        }
    }

    let _guard1 = Guard(Some(|| {
        println!("guard: 1");
    }));

    let _guard2 = Guard(Some(|| {
        println!("guard: 2");
    }));

    println!("hello");
}
```

输出

    hello
    guard: 2
    guard: 1

类似栈，后进先出，后一个会先执行。

原理：构造一个 Guard 类型存放闭包，在 guard 析构时取出闭包再执行。

封装成宏，利用表达式块将新增的工具类型封闭起来。

```rust
macro_rules! defer {
    {$($body:stmt;)+} => {
        let _guard = {
            pub struct Guard<F: FnOnce()>(Option<F>);
            impl<F: FnOnce()> Drop for Guard<F> {
                fn drop(&mut self) {
                    if let Some(f) = (self.0).take() {
                        f()
                    }
                }
            }
            Guard(Some(||{
                $($body)+
            }))
        };
    };
}

fn main() {
    defer! {
        println!("guard: 1");
    }

    defer! {
        println!("guard: 2");
    }

    println!("hello");
}
```

## 用处

defer 的一个用处：在作用域末尾打印日志。


```rust
fn main() -> std::io::Result<()> {
    defer! {println!("finished");}

    do_sth()?;
    and_then_do_sth()?;

    Ok(())
}
```

defer 的另一个用处：完成恐慌安全(panic safety)，也就是其他语言中的异常安全(exception safety)。

```rust
fn foo(count: &mut i32, f: impl FnOnce(i32)) {
    *count += 1;
    let c = *count;
    defer! {*count-=1;}
    f(c);
}

fn main() {
    use std::panic::{catch_unwind, AssertUnwindSafe};
    let mut count = 0;
    let _ = catch_unwind(AssertUnwindSafe(|| {
        foo(&mut count, |c| {
            dbg!(c);
            panic!();
        })
    }));
    dbg!(count);
}
```

输出

    [src/main.rs:31] c = 1
    thread 'main' panicked at 'explicit panic', src/main.rs:32:13
    note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace.
    [src/main.rs:35] count = 0

foo 函数维护一个计数，进入时加一，退出时减一，同时接受一个闭包用来执行。但如果传入的闭包会 panic，计数就不会被减一，造成状态被破坏。

用 defer 可以在 panic 时执行清理逻辑，对应于其他语言的 finally，但在 rust 中有所局限。

```rust
fn foo(count: &mut i32, f: impl FnOnce(i32)) {
    *count += 1;
    defer! {*count-=1;}
    f(*count);
}
```

这个函数不会通过编译，因为 defer 中的闭包已经占用了 count，defer 后的代码不能再使用 count。

对于简单的状态，defer 可以简化实现，它的行为很容易人肉预测。对于复杂的状态，通常需要 unsafe，这类场合会用手写的类型来精确控制状态，也就进化为 RAII。

以上分析适用于内存状态，对于抽象资源，RAII 带来一个新的问题：释放失败怎么办？忽略错误还是重试，重试的话，重试几次？报告的话，怎么报告？

defer 能附带更多上下文，有更大的灵活性，这是一个比 RAII 好的地方。

## 对比

### GC/异常/异常处理

Rust: 无GC，无异常，panic/catch_unwind

C++: 无 GC，有异常，try-catch-finally

Go: 有 GC，无异常，panic/recover

Python：有 GC，有异常，try-except-else-finally

### 资源管理

Rust: RAII

C++: RAII

Go: defer

Python: with

### 错误处理

Rust: Option/Result

C++: 异常/错误码

Go: `if err != nil`

Python: 异常
