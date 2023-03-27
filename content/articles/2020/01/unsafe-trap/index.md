# Unsafe 的隐藏坑点

Unsafe Rust 有一个隐藏的坑点：型变(variance)问题。

不了解型变的人容易写出带有漏洞的unsafe代码，这类漏洞通常不易察觉。

本文前置知识 <https://doc.rust-lang.org/nomicon/subtyping.html>

我们来写一个具有内部可变性的结构。

```rust
pub struct MyCell<'a, T> {
    value: &'a T,
}

impl<'a, T> MyCell<'a, T> {
    pub fn new(x: &'a T) -> Self {
        Self { value: x }
    }

    pub fn get(&self) -> &'a T {
        self.value
    }

    pub fn set(&self, x: &'a T) {
        unsafe { std::ptr::write(&self.value as *const &T as *mut &T, &x) }
    }
}
```

MyCell 包含一个指向 T 的共享引用，提供 get 和 set 两个操作。

get 操作：返回一个指向 T 的共享引用，看起来没问题。

set 操作：将 MyCell 中的共享引用指向另一个 T，看起来也没问题。

但是这里会有健全性漏洞(unsoundness)，下面我们来利用它。

```rust
fn exp() {
    let x = 123;
    let cell = MyCell::new(&x);

    fn set_cell<'a>(cell: &MyCell<'a, i32>) {
        let val = 42;
        cell.set(&val);
    }

    set_cell(&cell);
    dbg!(cell.get());
}
```

执行结果每次都不一样，这里有一个释放后使用(use after free)的漏洞。

```
[src/main.rs:29] cell.get() = 22070
[src/main.rs:29] cell.get() = 21970
```

在 set_cell 中，记 val 的生存期为 &'1，从定义 val 的这行起，到函数结束，当函数返回时 val 被释放。

cell.set(&val) 相当于 MyCell::set(cell,&val)

cell 为 &MyCell<'a, i32>

&val 为 &'1 i32

由于 MyCell 只包含 &'a T，默认情况下，MyCell 对 'a 协变。这里的 cell 变为 &MyCell<'1, i32>

生存期检查通过，cell 中的引用有效期变为 '1，但函数返回后 cell 仍然是 MyCell<'a, i32>，'a 长于 '1

因此 cell 中的引用被设置成了 &'1 i32，但外部类型定义认为它是 &'a i32，产生了生存期错误，导致漏洞。

实际上，MyCell 这类具有内部可变性的结构应该对 'a 不变。

如果 MyCell 对 'a 协变，它内部的引用有效期就会被意外缩短。

如果 MyCell 对 'a 逆变，它内部的引用有效期并不会加长，同样有漏洞。

修复方案：使用标准库提供的内部可变性来源 UnsafeCell，标注 MyCell 具有类似 `UnsafeCell<&'a T>` 的行为。

`UnsafeCell<T>` 对 T 不变，`UnsafeCell<&'a T>` 对 'a 不变。根据型变推导，`MyCell<'a,T>` 对 'a 不变，对 T 不变。

```rust
use std::cell::UnsafeCell;
use std::marker::PhantomData;

pub struct MyCell<'a, T> {
    value: &'a T,
    _marker: PhantomData<UnsafeCell<&'a T>>,
}
```

或者直接使用 UnsafeCell

```rust
use std::cell::UnsafeCell;

pub struct MyCell<'a, T> {
    value: UnsafeCell<&'a T>,
}

impl<'a, T> MyCell<'a, T> {
    pub fn new(x: &'a T) -> Self {
        Self {
            value: UnsafeCell::new(x),
        }
    }

    pub fn get(&self) -> &'a T {
        unsafe { *self.value.get() }
    }

    pub fn set(&self, x: &'a T) {
        unsafe { std::ptr::write(self.value.get(), &x) }
    }
}
```

编译器正确地拒绝了利用代码。

```
error[E0597]: `val` does not live long enough
  --> src/main.rs:32:18
   |
30 |     fn set_cell<'a>(cell: &MyCell<'a, i32>) {
   |                 -- lifetime `'a` defined here
31 |         let val = 42;
32 |         cell.set(&val);
   |         ---------^^^^-
   |         |        |
   |         |        borrowed value does not live long enough
   |         argument requires that `val` is borrowed for `'a`
33 |     }
   |     - `val` dropped here while still borrowed
```

且慢，你以为这里只有一个漏洞吗？

回到原来的定义

```rust
pub struct MyCell<'a, T> {
    value: &'a T,
}
```

进行线程安全性推理，参考 [nomicon send-and-sync](https://doc.rust-lang.org/nomicon/send-and-sync.html).

如果 MyCell 满足 Send，那么需要 &'a T 满足 Send，T: Sync。

如果 MyCell 满足 Sync，那么需要 &'a T 满足 Sync，T: Sync。

但实际上 MyCell 应该只满足 Send，不满足 Sync.

当 MyCell 被多线程共享时，每个线程都可以随意改变同一个 MyCell 中的引用。如果两个线程同时写同一个内存地址，在没有原子操作保证的情况下，就会发生数据竞争，产生难以发现的 bug.

UnsafeCell 只满足 Send，不满足 Sync.

因此，最终的写法就是包含 UnsafeCell，安全简洁。

```rust
pub struct MyCell<'a, T> {
    value: UnsafeCell<&'a T>,
}
```

这也告诉我们，正确地写出 Unsafe 代码通常需要从数据结构定义开始就使用良好的抽象，不能一把梭乱写，不然，轻则应用崩溃，重则安全漏洞。

修正：

根据别名规则，只有 `UnsafeCell<T>` 才可以通过共享引用更改内容，因此本文中只有最终写法是正确的。
