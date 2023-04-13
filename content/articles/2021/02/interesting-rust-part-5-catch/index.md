---
postDate: "2021-02-21"
links:
    知乎: https://zhuanlan.zhihu.com/p/351865224
---

# Rust 有趣片段(五)：catch

三分钟实现 Unchecked Exception 和 try-catch (误)。

首先我们写个扩展 trait，给 Result 类型加上扩展方法 catch。

```rust
trait ResultExt<T, E> {
    fn catch<U>(self) -> Result<Result<T, U>, E>
    where
        U: std::error::Error + Send + Sync + 'static;
}
```

为 anyhow 的 Result 实现这个扩展 trait。

```rust
impl<T> ResultExt<T, anyhow::Error> for anyhow::Result<T> {
    fn catch<U>(self) -> Result<Result<T, U>, anyhow::Error>
    where
        U: Display + Debug + Send + Sync + 'static,
    {
        match self.map_err(|e| e.downcast::<U>()) {
            Ok(t) => Ok(Ok(t)),
            Err(Ok(u)) => Ok(Err(u)),
            Err(Err(e)) => Err(e),
        }
    }
}
```

如果 Result 里面是个 Err，就尝试把它向下转型(downcast)成类型参数 U。操作结果有三种：

1. Result 里面是 Ok，那么返回 Ok(Ok(t))
2. Result 里面是 Err，向下转型成功，那么返回 Ok(Err(u))
3. Result 里面是 Err，向下转型失败，那么返回 Err(e)

返回类型是 `Result<Result<T, U>, E>`。

第二次调用 catch，会得到 `Result<Result<Result<T, U1>, U2>, E>`。

第三次调用 catch，会得到 `Result<Result<Result<Result<T, U1>, U2>, U3>, E>`。

每调用一次 catch，就嵌套一层 Result，增加一种可能结果。

应用示例：

```rust
use std::fmt::{Debug, Display};
use std::io;
use std::num::{ParseFloatError, ParseIntError};

use anyhow::Result;

fn do_sth() -> Result<i32> {
    Ok(1)
}

fn main() -> Result<()> {
    let result = do_sth()
        .catch::<io::Error>()
        .catch::<ParseIntError>()
        .catch::<ParseFloatError>()?;

    match result {
        Ok(Ok(Ok(n))) => println!("{}", n),
        Ok(Ok(Err(err))) => eprintln!("IoError: {}", err),
        Ok(Err(err)) => eprintln!("ParseIntError: {}", err),
        Err(err) => eprintln!("ParseFloatError: {}", err),
    }

    Ok(())
}
```

在发生错误并且 catch 全部失败时，最后的问号运算符起到了向上传播错误的效果。留下的 result 具有四种可能，需要一一匹配处理。

在写无关紧要的代码时，可以用这种方法和相关变体。正常情况下，推荐仔细设计错误类型，以免发生意外。
