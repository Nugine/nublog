# Rust 有趣片段(二)：anymap

Any 与 TypeId 为 Rust 提供了简单的运行时反射的能力，可以用来实现任意类型容器。

```rust
use std::any::{Any, TypeId};
use std::collections::HashMap;

pub struct AnyMap(HashMap<TypeId, Box<dyn Any + Send + Sync>>);
```

AnyMap 是对 `HashMap<TypeId, Box<dyn Any>` 的包装，方便起见，附带 Send,Sync 限制。

TypeId 是对 64 位无符号整数的一个包装，编译器按需对每个类型生成一个独立的 TypeId，用来标识类型。Any 是一个 trait，对所有 'static 类型实现。

```rust
impl AnyMap {
    pub fn new() -> Self {
        Self(HashMap::new())
    }

    pub fn insert<T: Any + Send + Sync>(&mut self, x: T) -> Option<T> {
        self.0
            .insert(TypeId::of::<T>(), Box::new(x))
            .map(force_downcast)
    }
    pub fn remove<T: Any + Send + Sync>(&mut self) -> Option<T> {
        self.0.remove(&TypeId::of::<T>()).map(force_downcast)
    }

    pub fn get<T: Any + Send + Sync>(&self) -> Option<&T> {
        self.0
            .get(&TypeId::of::<T>())
            .map(|b| b.downcast_ref::<T>().unwrap())
    }

    pub fn get_mut<T: Any + Send + Sync>(&mut self) -> Option<&mut T> {
        self.0
            .get_mut(&TypeId::of::<T>())
            .map(|b| b.downcast_mut::<T>().unwrap())
    }
}

fn force_downcast<T: 'static>(b: Box<dyn Any + Send + Sync>) -> T {
    *<Box<dyn Any + Send>>::downcast::<T>(b).unwrap()
}
```

AnyMap 的操作是泛型方法，首先指定一个类型 T，AnyMap 获取 T 的 TypeId，在内部哈希表中查找 TypeId 对应的 Any 对象，取得 Any 对象后，将它转换为具体类型 T.


```rust
fn main() {
    #[derive(Debug, PartialEq, Eq)]
    struct ExtA(u32);

    #[derive(Debug, PartialEq, Eq)]
    struct ExtB(u32);

    #[derive(Debug, PartialEq, Eq)]
    struct ExtC(u32);

    let mut map = AnyMap::new();
    map.insert(ExtA(1));
    map.insert(ExtB(2));
    map.insert(ExtC(3));

    assert_eq!(map.get::<ExtA>(), Some(&ExtA(1)));
    assert_eq!(map.get_mut::<ExtB>(), Some(&mut ExtB(2)));
    assert_eq!(map.remove::<ExtC>(), Some(ExtC(3)));
}
```

AnyMap 能保存任意类型的至多一个实例，用法非常简单。

nodejs 的 web 框架通常会往 req 对象上添加扩展，例如 req.session. Rust 也可以在 req 内嵌入一个类似 AnyMap 的容器，用来保存不同类型的扩展对象。

`dyn Any` 与 Go 的 interface{} 类似，以下是 std::any 中的部分示例。

```rust
fn log<T: Any + Debug>(value: &T) {
    let value_any = value as &dyn Any;

    match value_any.downcast_ref::<String>() {
        Some(as_string) => {
            println!("String ({}): {}", as_string.len(), as_string);
        }
        None => {
            println!("{:?}", value);
        }
    }
}

```

基于 Any 的泛型方法可以接收任意类型，运行时判断参数的具体类型并做相应处理。

## 概念对比

### 运行时类型识别

C++: typeid / dynamic_cast / 

Rust: TypeId / downcast / dyn Any

Go: TypeOf / .(type) / interface{}

### 动态分派

C++: 虚函数

Rust: trait

Go: 接口

### 泛型机制

C++: 模板 / concept

Rust: 泛型 / trait

Go: 
