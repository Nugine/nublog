---
postDate: "2019-11-26"
links:
    知乎: https://zhuanlan.zhihu.com/p/93799869
---

# Rust 数据结构: 广义表

众所周知，用 Rust 实现一个正确的双向链表十分复杂，所以今天我们来写一个简单的广义表。

广义表的元素可以是单个原子，也可以是一个广义表，于是用枚举来描述元素类型。广义表是线性表的推广，用 `Vec<Element<T>>` 作为 `List<T>`.

```rust
pub enum Element<T> {
    List(List<T>),
    Value(T),
}

pub struct List<T>(Vec<Element<T>>);
```

为了方便，实现元素类型的转换方法。元素可以从 T 或 List<T> 转换而来，实现两个 From 即可。

```rust
impl<T> From<T> for Element<T> {
    fn from(x: T) -> Self {
        Element::Value(x)
    }
}

impl<T> From<List<T>> for Element<T> {
    fn from(x: List<T>) -> Self {
        Element::List(x)
    }
}
```

`List::push` 是一个泛型方法，任何能转换为元素类型的值都可传进去。

```rust
impl<T> List<T> {
    pub fn new() -> Self {
        Self(Vec::new())
    }

    pub fn push(&mut self, x: impl Into<Element<T>>) {
        self.0.push(x.into())
    }
}
```

为 Element 和 List 实现 Debug，以便打印出广义表的字面形式。

```rust
impl<T: Debug> Debug for Element<T> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Element::Value(x) => x.fmt(f),
            Element::List(x) => x.fmt(f),
        }
    }
}

impl<T: Debug> Debug for List<T> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_list().entries(self.0.iter()).finish()
    }
}
```

List 可以表示为连续元素的所有权指针, 即 List 可以 Deref 到`[Element]`

```rust
impl<T> Deref for List<T> {
    type Target = [Element<T>];
    fn deref(&self) -> &[Element<T>] {
        &self.0
    }
}

impl<T> DerefMut for List<T> {
    fn deref_mut(&mut self) -> &mut [Element<T>] {
        &mut self.0
    }
}
```

最后，写一个宏来初始化 List

```rust
macro_rules! list{
    []=>{List::new()};
    [$($x:expr),+]=>{{
        let mut list = List::new();
        $(list.push($x);)+
        list
    }};
    [$($x:expr,)+]=>{ list![$($x),+] }
}
```

测试

```rust
fn main() {
    let list_a: List<char> = list![list!['a'], 'b'];
    println!("list a: {:?}", list_a);
    let list_b = list![list_a, 'c', list!['d', 'e',]];
    println!("list b: {:?}", list_b);

    let (head, tail) = list_b.split_first().unwrap();
    println!("head: {:?}", head);
    println!("tail: {:?}", tail);
}
```

输出结果

```
list a: [['a'], 'b']
list b: [[['a'], 'b'], 'c', ['d', 'e']]
head: [['a'], 'b']
tail: ['c', ['d', 'e']]
```

在 Rust 中，定义好结构后，添加各种非侵入式接口实现十分自然 (隔壁cpp咳嗽了一下)。

从所有权角度来说，广义表是一个平凡的递归结构，这也减小了实现难度，更不用考虑生存期了。

<https://play.rust-lang.org/?version=stable&mode=debug&edition=2018&gist=b089b6350e125308919d83777472e443>
