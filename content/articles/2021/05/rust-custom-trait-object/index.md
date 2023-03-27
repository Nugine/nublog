---
postDate: "2021-05-08"
---

# Rust 自定义 trait object

在 Rust 中，trait object 胖指针的内部实现是两个指针，一个指向实际数据，对应 C++ 的 this 指针，另一个是虚表指针，指向实际类型的虚函数表。

我们完全可以手动模拟胖指针，自己来构造虚函数表，实现和 trait object 相同的动态派发效果，这就是自定义 trait object。

接下来，我们实现一个可以指向任意类型的胖指针。

```rust
use std::any::TypeId;
use std::ptr::NonNull;
use std::{fmt, mem};


pub struct Any {
    data: NonNull<()>, // Box<T>
    vtable: &'static AnyVTable,
}

unsafe impl Send for Any {}
unsafe impl Sync for Any {}

struct AnyVTable {
    type_id: unsafe fn() -> TypeId,
    drop: unsafe fn(*mut ()),
    clone: unsafe fn(*const ()) -> Any,
}
```

方便起见，我们设计的 Any 满足 `Clone + Send + Sync + 'static`，同样，内部的实际类型也必须满足 `Clone + Send + Sync + 'static`。

Any 的 data 是一个指向堆上数据的裸指针，本来是 `Box<T>`，被强制转换为 `NonNull<()>`，抹掉了类型信息。

Any 的 vtable 指向自定义的虚函数表 AnyVTable，其中包含三个虚函数指针。

虚函数的具体实现如下：

```rust
impl AnyVTable {
    unsafe fn v_type_id<T>() -> TypeId
    where
        T: Send + Sync + 'static,
    {
        TypeId::of::<T>()
    }

    unsafe fn v_drop<T>(this: *mut ())
    where
        T: Send + Sync + 'static,
    {
        drop(Box::from_raw(this.cast::<T>()))
    }

    unsafe fn v_clone<T>(this: *const ()) -> Any
    where
        T: Clone + Send + Sync + 'static,
    {
        let x = Clone::clone(&*this.cast::<T>());
        Any::new(x)
    }
}
```

通过泛型参数输入类型信息，对每个类型 T 都单态化一份虚函数。

虚函数接受运行时的 this 指针，函数本身知道类型信息，在内部强制转换即可获得实际数据。

```rust
impl Any {
    pub fn new<T>(x: T) -> Self
    where
        T: Clone + Send + Sync + 'static,
    {
        unsafe {
            Self {
                data: NonNull::new_unchecked(Box::into_raw(Box::new(x))).cast(),
                vtable: &AnyVTable {
                    type_id: AnyVTable::v_type_id::<T>,
                    drop: AnyVTable::v_drop::<T>,
                    clone: AnyVTable::v_clone::<T>,
                },
            }
        }
    }
```

构造 Any 时，把数据放到堆上，取得数据指针，指定虚函数的泛型参数，构造自定义虚函数表。这样就得到了自定义 trait object，可以完成动态派发。

```rust
    pub fn type_id(&self) -> TypeId {
        unsafe { (self.vtable.type_id)() }
    }

    pub fn downcast<T>(self) -> Result<Box<T>, Self>
    where
        T: Send + Sync + 'static,
    {
        if self.type_id() == TypeId::of::<T>() {
            let ptr = self.data.as_ptr().cast::<T>();
            mem::forget(self);
            unsafe { Ok(Box::from_raw(ptr)) }
        } else {
            Err(self)
        }
    }

    pub fn downcast_ref<T>(&self) -> Result<&T, ()>
    where
        T: Send + Sync + 'static,
    {
        if self.type_id() == TypeId::of::<T>() {
            let ptr = self.data.as_ptr().cast::<T>();
            unsafe { Ok(&*ptr) }
        } else {
            Err(())
        }
    }
}
```

虚函数 type_id 可以用来实现向下转型。运行时检查 T 的 TypeId 和 Any 内部类型的 TypeId，如果相同，说明 Any 的 data 指针确实指向 T，可以把 Any 转换为具体类型 T，否则失败。

```rust
impl Clone for Any {
    fn clone(&self) -> Self {
        unsafe { (self.vtable.clone)(self.data.as_ptr()) }
    }
}

impl Drop for Any {
    fn drop(&mut self) {
        unsafe { (self.vtable.drop)(self.data.as_ptr()) }
    }
}

impl fmt::Debug for Any {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "Any {{ .. }}")
    }
}
```

用内部虚函数为 Any 实现 Clone 和 Drop。

虚表中没有 debug， fmt::Debug 就随便写写。

最后用 miri 简单测试一下。

```rust
fn main() {
    let a1 = Any::new(42_u32);
    let a2 = Any::new(String::from("hello"));
    dbg!(a1.type_id());
    dbg!(a2.type_id());

    dbg!(a1.downcast::<u32>().unwrap());
    dbg!(a2.downcast_ref::<String>().unwrap());

    let a3 = a2.clone();
    dbg!(a3.downcast_ref::<String>().unwrap());

    drop(a2);
    drop(a3);
}
```

```
[src/main.rs:112] a1.type_id() = TypeId {
    t: 12849923012446332737,
}
[src/main.rs:113] a2.type_id() = TypeId {
    t: 13038339745531503022,
}
[src/main.rs:115] a1.downcast::<u32>().unwrap() = 42
[src/main.rs:116] a2.downcast_ref::<String>().unwrap() = "hello"
[src/main.rs:119] a3.downcast_ref::<String>().unwrap() = "hello"
```

一切正常。

自定义 trait object 在很多库中出现过，可以做到灵活高效的动态派发。

+ [std::task::RawWaker](https://doc.rust-lang.org/nightly/std/task/struct.RawWaker.html)
+ [bytes::Bytes](https://docs.rs/bytes/1.0.1/bytes/struct.Bytes.html)
+ [anyhow::Error](https://docs.rs/anyhow/1.0.40/src/anyhow/lib.rs.html#376-378)
+ [async_task::Task](https://docs.rs/async-task/4.0.3/async_task/struct.Task.html)

具体实现各有差别，例如 bytes::Bytes 还包含其他状态，anyhow::Error 把虚表指针和实际数据一起放在堆上，自身是瘦指针。

总体上看，unsafe rust 操控对象布局和虚表是非常直接清晰的，但细节很容易出错，搞不好就是隐藏 UB。使用高级黑魔法，后果自负。
