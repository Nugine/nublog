# 一种转换异步流的轻量级方法

本文将介绍一种利用 async 语法转换异步流的方法，可以回避手写状态机带来的心智负担和 channel 通信的额外同步开销。

## 结构定义

```rust
#![forbid(unsafe_code)]

use std::collections::VecDeque;
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use std::task::{Context, Poll};

use atomic_refcell::AtomicRefCell;
use futures::future::{self, BoxFuture};
use futures::stream::{FusedStream, Stream};
use pin_project_lite::pin_project;

type TryChannel<T, E> = Arc<AtomicRefCell<VecDeque<Result<T, E>>>>;

pin_project! {
    pub struct AsyncTryStream<T, E, G = BoxFuture<'static, Result<(), E>>> {
        chan: TryChannel<T, E>,
        done: bool,
        #[pin]
        gen: G,
    }
}

pub struct TryYielder<T, E> {
    tx: TryChannel<T, E>,
}
```

`Arc<AtomicRefCell<T>>` 允许跨线程共享、修改同一对象，相当于带竞态检测和引用计数的智能指针。内部使用原子指令保证对象不能被同时读写，违反限制会导致 panic。

`VecDeque<Result<T,E>>` 作为流缓冲区，起到 channel 的作用。

`AsyncTryStream` 包含流缓冲区、完成标记和作为生成器的 future。用 pin_project 投影到生成器，当 `AsyncTryStream` 被 pin 住时，gen 也会被 pin 住。

`TryYielder` 用作 channel 的发送端，会被注入到生成器中。

## 构造函数

```rust
impl<T, E, G> AsyncTryStream<T, E, G>
where
    G: Future<Output = Result<(), E>>,
{
    pub fn new<F>(f: F) -> Self
    where
        F: FnOnce(TryYielder<T, E>) -> G,
    {
        let chan = Arc::new(AtomicRefCell::new(VecDeque::new()));
        let tx = Arc::clone(&chan);
        let yielder = TryYielder { tx };
        let gen = f(yielder);
        Self {
            chan,
            gen,
            done: false,
        }
    }
}
```

`AsyncTryStream` 的构造函数接受一个工厂函数，这个工厂函数接受 `TryYielder`，返回一个 future 作为生成器。

## 实现 Stream

```rust
impl<T, E, G> Stream for AsyncTryStream<T, E, G>
where
    G: Future<Output = Result<(), E>>,
{
    type Item = Result<T, E>;

    fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        let mut this = self.project();

        loop {
            if let Some(item) = this.chan.borrow_mut().pop_front() {
                return Poll::Ready(Some(item));
            }

            if *this.done {
                return Poll::Ready(None);
            }

            match this.gen.as_mut().poll(cx) {
                Poll::Pending => return Poll::Pending,
                Poll::Ready(ret) => {
                    *this.done = true;
                    if let Err(e) = ret {
                        this.chan.borrow_mut().push_back(Err(e));
                    }
                }
            }
        }
    }
}

impl<T, E, G> FusedStream for AsyncTryStream<T, E, G>
where
    G: Future<Output = Result<(), E>>,
{
    fn is_terminated(&self) -> bool {
        self.done && self.chan.borrow().is_empty()
    }
}
```

进入 `AsyncTryStream` 的 poll_next 方法时，首先尝试从流缓冲区中拿出对象并返回，如果缓冲区为空并且完成标记为 true，说明流已经结束，直接返回。

如果缓冲区为空，完成标记为 false，那么就 poll 一次生成器，同时维护完成标记。当生成器返回时，缓冲区中可能被放入了一些对象，生成器返回错误时也要向缓冲区中放入错误。

外面套一层 loop，复用逻辑。

## 实现 TryYielder

```rust
impl<T, E> TryYielder<T, E> {
    pub async fn yield_ok(&mut self, value: T) {
        self.tx.borrow_mut().push_back(Ok(value));
    }

    pub async fn yield_ok_iter<I>(&mut self, iter: I)
    where
        I: IntoIterator<Item = T>,
    {
        self.tx.borrow_mut().extend(iter.into_iter().map(Ok));
    }
}
```

用作生成器的 future 中会调用 TryYielder 的方法来向流缓冲区中放入对象。

## 测试

测试一个常见场景：按行切分字节流。

```rust
fn main() {
    use self::async_stream::AsyncTryStream;
    use futures::{pin_mut, StreamExt};
    use memchr::memchr;
    use std::io;

    let bytes: &[&[u8]] = &[b"12", b"34", b"5\n", b"67", b"89", b"10\n", b"11"];
    let io_bytes: Vec<io::Result<Vec<u8>>> = bytes.iter().map(|&b| Ok(Vec::from(b))).collect();

    let source_stream = futures::stream::iter(io_bytes);

    let line_stream: AsyncTryStream<Vec<u8>, io::Error, _> =
        AsyncTryStream::new(|mut y| async move {
            pin_mut!(source_stream);

            let mut buf: Vec<u8> = Vec::new();
            loop {
                match source_stream.next().await {
                    None => break,
                    Some(Err(e)) => return Err(e),
                    Some(Ok(bytes)) => {
                        buf.extend(bytes);
                        if let Some(idx) = memchr(b'\n', &buf) {
                            let remaining = buf.split_off(idx + 1);
                            let line = mem::replace(&mut buf, remaining);
                            y.yield_ok(line).await;
                        }
                    }
                }
            }

            if !buf.is_empty() {
                y.yield_ok(buf).await;
            }

            Ok(())
        });

    futures::executor::block_on(async {
        pin_mut!(line_stream);

        while let Some(bytes) = line_stream.next().await {
            let bytes = bytes.unwrap();
            let line = std::str::from_utf8(&bytes).unwrap();
            dbg!(line);
        }
    });
}
```

运行结果如下：

```
[src/main.rs:167] line = "12345\n"
[src/main.rs:167] line = "678910\n"
[src/main.rs:167] line = "11"
```


## 原理

`AsyncTryStream` 可以轻松实现复杂的异步生成器，简化流解析的逻辑，少费脑细胞。这种方法也可以推广到其他形式的 stream。

其中的要点有两个：

第一，`Arc<AtomicRefCell<VecDeque<Result<T, E>>>>` 由两方共享，一方是作为发送端的 future，另一方是作为接收端的 stream。因为 future 嵌套在 stream 中，所以队列不会被同时修改。这个缓冲区也可以用自旋锁、异步锁、无锁队列、channel 等方式实现，但都不如 AtomicRefCell 来得直接。

第二，将发送端注入到 future 中，这让 future 拥有向缓冲区中放入对象的能力。编译器会把 async 语法转换成正确的状态机，大大减少了心智负担。

但这种方法也有弊端，future 可以把发送端传递给其他线程，超出 stream 的控制范围，最坏结果是违反 AtomicRefCell 的运行时借用检查。

因此 `AsyncTryStream` 还包含隐藏的约束：`TryYielder` 必须保留在 future 内部，不能离开作用域或被发送到其他线程。

<https://play.rust-lang.org/?version=stable&mode=debug&edition=2018&gist=fe7f5b2f4be21f987a21ebe013605d76>
