---
postDate: "2019-07-20"
links:
    知乎: https://zhuanlan.zhihu.com/p/74429210
---

# Rust 中的 needs_drop 是什么

## 太长不看

[std::mem::needs_drop](https://doc.rust-lang.org/std/mem/fn.needs_drop.html) 用来判断数据类型的析构操作是否重要。对应于 C++ 的 [std::is_trival](http://www.cplusplus.com/reference/type_traits/is_trivial/)，可用于容器类型的优化。

## 示例

### Copy 类型

```rust
struct Point{
    x: i32,
    y: i32,
}
```

Point 类型完全由数字组成，当释放一个数组 [Point;N] 时，不需要对每个元素挨个调用 drop，而是直接释放整块内存。

```rust
assert_eq!(needs_drop::<Point>(), false);
assert_eq!(needs_drop::<[Point; 16]>(), false);
```

对于实现了 Copy 的类型，needs_drop 总是返回 false， 这样的类型通常都不持有资源，是平凡的，比如布尔类型、数字类型。

```rust
#[derive(Clone, Copy)]
struct Point {
    x: i32,
    y: i32,
}
```

### Drop 类型

```rust
struct MyBox<T> {
    ptr: *mut T,
}

use std::alloc::{alloc, dealloc, Layout};

impl<T> MyBox<T> {
    fn new(value: T) -> Self {
        unsafe {
            let ptr = alloc(Layout::new::<T>()) as *mut T;
            std::ptr::write(ptr, value);
            Self { ptr }
        }
    }
}
```

needs_drop::<MyBox<String>>() 返回 false，MyBox 类型由一个裸指针组成，它的默认析构操作是不重要的。

然而，堆分配的内存必须释放，否则会引起内存泄露。我们需要手动实现 Drop。

```rust
impl<T> Drop for MyBox<T> {
    fn drop(&mut self) {
        unsafe {
            std::ptr::drop_in_place(self.ptr);
            dealloc(self.ptr as *mut u8, Layout::new::<T>())
        }
    }
}
```

[std::ptr::drop_in_place](https://doc.rust-lang.org/std/ptr/fn.drop_in_place.html) 已经执行了 needs_drop 检查，会根据情况选择是否执行 drop。一般来说，我们不需要自己检查 needs_drop，调用 drop_in_place 是正确的选择。

对于平凡数据，这里相当于直接释放内存，对于非平凡数据，这里会正确执行原地析构后再释放内存。

手动实现 Drop 的类型通常拥有资源，删除这类数据必须先执行析构，needs_drop 对这类类型返回 true.

```rust
assert_eq!(needs_drop::<MyBox<String>>(), true);
assert_eq!(needs_drop::<MyBox<u8>>(), true);
```

对于其他类型，编译器会根据结构体字段推测析构操作的重要性，情况太多，不便一一解释。

## 关于 Drop 和 Copy

[E0184](https://doc.rust-lang.org/error-index.html#E0184) 说明：同时实现 Drop 和 Copy 理论上有用，但目前的编译器实现有问题，会导致内存不安全 ([issue #20126](https://github.com/rust-lang/rust/issues/20126))，因此不允许。Drop 和 Copy 中只能实现一个。

[E0204](https://doc.rust-lang.org/error-index.html#E0204)说明：如果想为结构体实现 Copy ，那么它的字段必须都是 Copy.

## 关于 ManuallyDrop

[std::mem::ManuallyDrop\<T\>](https://doc.rust-lang.org/std/mem/struct.ManuallyDrop.html) 阻止编译器执行 T 的析构操作。它的背后是语言项，编译器做了特殊处理。

needs_drop 对 ManuallyDrop\<T\> 返回 false

```rust
assert_eq!(needs_drop::<ManuallyDrop<u8>>(), false);
assert_eq!(needs_drop::<ManuallyDrop<String>>(), false);
```

包含 ManuallyDrop\<T\> 的类型通常使用了 unsafe ，会手动实现 Drop，以便自定义字段析构顺序和行为。

## 关于 LLVM

[nomicon](https://doc.rust-lang.org/nomicon/vec-dealloc.html?highlight=needs_drop#deallocating) 中提到，LLVM 擅长消除无副作用的代码。

needs_drop 的签名是 `pub const fn needs_drop<T>() -> bool`，背后是编译器内联函数。使用它的条件分支跳转实际上可以在编译期确定，无用分支会被消除。

drop_in_place 背后是语言项，显然存在相关优化。

[nomicon](https://doc.rust-lang.org/nomicon/index.html) 有时被称为 [死灵书](https://www.rust-lang.org/zh-CN/learn)。这本书介绍了 Unsafe Rust 的细节知识，带读者进入 Rust 黑魔法世界。
