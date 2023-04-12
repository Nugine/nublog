---
postDate: "2022-06-10"
---

# Rust 实现 offsetof

C 语言的 offsetof 是一个宏，用于求一个字段在结构体中的偏移量。Rust 也可以实现这样的宏，在 FFI 和一些精确控制内存布局的场景下很有用。

我们直接看代码：

```rust
/// Calculates the offset of the specified field from the start of the named struct.
#[macro_export]
macro_rules! offset_of {
    ($ty: path, $field: tt) => {
        // feature(inline_const)
        const {
            #[allow(
                unused_unsafe,
                clippy::as_conversions,
                clippy::unneeded_field_pattern,
                clippy::undocumented_unsafe_blocks
            )]
            unsafe {
                use ::core::mem::MaybeUninit;
                use ::core::primitive::{u8, usize};
                use ::core::ptr;

                // ensure the type is a named struct
                // ensure the field exists and is accessible
                let $ty { $field: _, .. };

                // const since 1.36
                let uninit: MaybeUninit<$ty> = MaybeUninit::uninit();

                // const since 1.59
                let base_ptr: *const $ty = uninit.as_ptr();

                // stable since 1.51
                let field_ptr: *const _ = ptr::addr_of!((*base_ptr).$field);

                // feature(const_ptr_offset_from)
                let base_addr = base_ptr.cast::<u8>();
                let field_addr = field_ptr.cast::<u8>();
                field_addr.offset_from(base_addr) as usize
            }
        }
    };
}

```

其中核心代码只有 7 行，依次解释一下：

```rust
let $ty { $field: _, .. };
```

通过模式匹配来确保传入的结构体名称和字段在当前上下文中可见。

```rust
let uninit: MaybeUninit<$ty> = MaybeUninit::uninit();
```

创建一个未初始化的结构体。

```rust
let base_ptr: *const $ty = uninit.as_ptr();
```

获取结构体指针，即基地址。

```rust
let field_ptr: *const _ = ptr::addr_of!((*base_ptr).$field);
```

获取字段指针，即字段地址。标准库的 `addr_of` 宏可以安全地获取任意位置 (place) 的裸指针，就算该位置未初始化也可以。

```rust
let base_addr = base_ptr.cast::<u8>();
let field_addr = field_ptr.cast::<u8>();
field_addr.offset_from(base_addr) as usize
```

最后计算并返回两个指针之间的字节距离，即字段偏移量。

目前 Rust 的语言特性已经能支持与 C 语言等效的 offset_of，不过需要开启两个不稳定特性 `inline_const` 和 `const_ptr_offset_from`。这两个特性不是必要的，如果要在 stable rust 中使用，可以换成运行期求值的写法，编译器也能优化成常量。[memoffset](https://docs.rs/memoffset/) 库已经提供了这样的宏。

基于 offset_of 宏，可以实现与 C 语言等效的 container_of 宏，通过字段指针计算出结构体指针：

```rust
#[macro_export]
macro_rules! container_of {
    ($ptr: expr, $ty: path, $field: tt) => {{
        use ::core::primitive::u8;
        let ptr: *const _ = $ptr;
        ptr.cast::<u8>().sub(offset_of!($ty, $field)).cast::<$ty>()
    }};
}

#[macro_export]
macro_rules! container_of_mut {
    ($ptr: expr, $ty: path, $field: tt) => {{
        use ::core::primitive::u8;
        let ptr: *mut _ = $ptr;
        ptr.cast::<u8>().sub(offset_of!($ty, $field)).cast::<$ty>()
    }};
}
```

写一个简单的测试：

```rust
#[allow(clippy::undocumented_unsafe_blocks)]
#[test]
fn test() {
    use std::{mem, ptr};

    #[repr(C)]
    struct Struct {
        a: u8,
        b: u16,
        c: u32,
        d: u64,
    }

    assert_eq!(offset_of!(Struct, a), 0);
    assert_eq!(offset_of!(Struct, b), 2);
    assert_eq!(offset_of!(Struct, c), 4);
    assert_eq!(offset_of!(Struct, d), 8);

    let s: Struct = unsafe { mem::zeroed() };
    let p: _ = unsafe { container_of!(ptr::addr_of!(s.c), Struct, c) };
    assert_eq!(p, ptr::addr_of!(s));
}
```

总结：

+ Rust 可以实现与 C 语言等效的 offset_of 和 container_of 宏。
+ 编译期计算需要两个尚不稳定的特性，运行期计算不需要，二者都能优化成常量

完整代码

<https://play.rust-lang.org/?version=nightly&mode=debug&edition=2021&gist=3777d5e0243f2eefb0d32a0bf53de3cd>