# Rust 有趣片段(四)：sealed trait

sealed trait 字面意思为“密封特质”，在 Rust 中表示一类无法被下游代码实现的 trait.

与 Scala 不同，Rust 中的 sealed trait 不是语言内建功能，而是从访问控制功能导出的特殊设计模式。


假设我们的库中有一个非常重要的 trait。

```rust
mod important {
    pub trait Important {
        fn do_sth(&self);
    }

    impl Important for String {
        fn do_sth(&self) {
            dbg!(self);
        }
    }
}

fn main() {
    use important::Important;
    let s: String = "hello".into();
    s.do_sth();
}
```

使用方想折腾一下，增加了一个实现。

```rust
struct Foo;

impl important::Important for Foo {
    fn do_sth(&self) {
        dbg!();
    }
}

fn main() {
    use important::Important;

    let s: String = "hello".into();
    s.do_sth();

    let foo = Foo;
    foo.do_sth();
}
```

这时为了新需求，修改了 `Important` trait.

```rust
pub trait Important {
    fn do_sth(&self);
    fn do_another_thing(&self);
}
```

由于不匹配，使用方的实现立即报错。

```
...
23 | impl Important for Foo {
   | ^^^^^^^^^^^^^^^^^^^^^^ missing `do_another_thing` in implementation
```

`Important` trait 仅用于下游代码与上游库的交互，但此时，上游的内部修改破坏了下游的代码。

下游使用上游库，必须访问 `Important` trait，但上游为了未来的修改考虑，不想让下游实现这个 trait.

方法很简单：依赖一个下游无法访问的 trait。

```rust
mod important {
    mod private {
        pub trait Sealed {}

        impl Sealed for String {}
    }

    pub trait Important: private::Sealed {
        fn do_sth(&self);
    }

    impl Important for String {
        fn do_sth(&self) {
            dbg!(self);
        }
    }
}
```

`Important` trait 依赖一个 `Sealed` trait，要实现前者，必须先实现后者。下游代码无法访问未公开的 `Sealed` trait，也就无法实现 `Important` trait，但仍然能使用它的功能。

在访问泄露检查器看来，`Important` trait 没有泄露私有元素，只是依赖了其他模块的一个公开 trait，但对使用者来说，这个“其他模块”是不可见的。

此外，通过控制 `Sealed` trait 的可见范围，能够将扩展权限开放到整个 crate，也能只开放给同一模块。


这种设计模式在标准库和很多第三方库中出现。当上游为了兼容性或逻辑正确性,想禁止下游实现上游 trait 时，就可以用 sealed trait 来消除这种可能。

+ [std::slice::SliceIndex](https://doc.rust-lang.org/std/slice/trait.SliceIndex.html)
+ [byteorder::ByteOrder](https://docs.rs/byteorder/1.3.4/byteorder/trait.ByteOrder.html)
+ [serde_json::value::Index](https://docs.rs/serde_json/1.0.51/serde_json/value/trait.Index.html)

在 struct 中混入未公开字段也有类似的效果。

```rust
mod user {
    pub struct User {
        pub name: String,
        pub age: u32,
        _priv: (),
    }

    pub fn get_user() -> User {
        User {
            name: "asd".into(),
            age: 18,
            _priv: (),
        }
    }
}
```

模块提供 struct 定义与指定的构造器，外部代码可以访问公开字段，但不能自行构造 struct，必须使用模块提供的构造方法。

这就允许模块在未来任意添加字段，而不会破坏已有代码。

```rust
pub struct User {
    pub name: String,
    pub age: u32,
    pub job: Option<String>,
    _priv: (),
}
```

例如，添加 job 字段并修改对应构造方法，不会对下游造成影响。只要公开 API 没有破坏性改动，上游就能自由演进。

利用 Rust 类型系统与语言功能，能写出一些较为特殊的设计模式。目前来看，Rust 生态已经形成了特有的 API 风格与设计，有待总结常见模式。
