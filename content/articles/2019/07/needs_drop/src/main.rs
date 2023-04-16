#[derive(Clone, Copy)]
struct Point {
    x: i32,
    y: i32,
}

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

impl<T> Drop for MyBox<T> {
    fn drop(&mut self) {
        unsafe {
            std::ptr::drop_in_place(self.ptr);
            dealloc(self.ptr as *mut u8, Layout::new::<T>())
        }
    }
}

impl<T> MyBox<T> {
    fn get_ref(&self) -> &T {
        unsafe { &(*self.ptr) }
    }
}

use std::mem::needs_drop;
use std::mem::ManuallyDrop;

struct Wrapper<T> {
    inner: T,
}

fn main() {
    assert_eq!(needs_drop::<Point>(), false);
    assert_eq!(needs_drop::<[Point; 16]>(), false);

    assert_eq!(needs_drop::<MyBox<String>>(), true);
    assert_eq!(needs_drop::<MyBox<u8>>(), true);

    assert_eq!(needs_drop::<String>(), true);

    assert_eq!(needs_drop::<ManuallyDrop<u8>>(), false);
    assert_eq!(needs_drop::<ManuallyDrop<String>>(), false);
    println!("Hello, world!");
}
