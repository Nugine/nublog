# Rust 有趣片段(三)：Y 组合子

Rust 有非常多的函数式特性，这些特性深入到 Rust 的核心概念与 API 设计，深刻地改变了人们对系统编程语言的印象。

本文将在无 GC、静态类型、保证内存安全的约束下，一步步实现 Y 组合子。

## 定义

$$
Y = \lambda f. (\lambda x. f(x \, x)) \, (\lambda x. f(x \, x))
$$

方便起见，先给出一个 JS 版本的实现。

```javascript
Y = f => (
    (g => g(g))
        (x => f(a => x(x)(a)))
)
```

```javascript
fact = Y(f => n => n == 1 ? 1 : n * f(n - 1))
console.debug(fact(5)) // 120
```

## 标注类型

设最终得到的递归函数是 Fn(Arg) -> Output，记作类型 F.

type F = Fn(Arg) -> Output

Y 是函数，参数类型为 typeof(f)，输出类型为 F.

Y: Fn(typeof(f)) -> F

f 是函数，参数类型为 F，输出类型为 F。

f: Fn(F) -> F

g 是函数，参数类型为 typeof(g)，输出类型与 Y 的相同，为 F.

g: Fn(typeof(g)) -> F

x 是函数，参数类型为 typeof(x)，输出类型与 f 的相同，也是 F，记 typeof(x) 为 X.

type X = Fn(X) -> F

发现 X 是一个递归定义的类型。

x => f(a => x(x)(a)) 这个表达式是一个函数，参数 X，输出 F，它的类型就是 X. 

g => g(g) 这个表达式是一个函数，参数 typeof(g)， 输出 F，它的类型就是 typeof(g).

x => f(a => x(x)(a)) 作为参数，输入给 g => g(g)，说明 X 与 typeof(g) 相同。


g: Fn(X) -> F

g: X

g => g(g): Fn(X) -> F



接下来分析表达式。

x(x): Fn(Arg) -> Output

x(x)(a): Output

a => x(x)(a): Fn(Arg) -> Output

f(a => x(x)(a)): F

x => f(a => x(x)(a)): Fn(X)->F

g => g(g): Fn(X) -> F

(g => g(g))(instanceof(X)): F

f => (instanceof(X))(instanceof(X)): Fn(typeof(f)) -> F

成功构造 Y

其中的关键类型是

type F = Fn(Arg) -> Output

type X = Fn(X) -> F

Y: Fn(typeof(f)) -> F


## 变形

表达式中存在用自己调用自己的结构，也就是说，函数要能共享，这里函数的形式应该是 `&dyn Fn(Arg) -> Output`，或者 `Rc<dyn Fn(Arg) -> Output>`。

表达式中也存在接受一个函数并返回一个函数的函数，使用引用调用会让生存期难以推导，只能用 Rc 了。这样可以实现原本的 Y 组合子，但每递归一次都要堆分配，为抽象付出了代价。

[Rust Playground](https://play.rust-lang.org/?version=stable&mode=debug&edition=2018&gist=f1db7595a2c1f4a5b2f8cfa5a3bb017d)

如果不追求原汁原味，只要实现功能呢？

解决方法：做个变形，修改 Y 的参数类型。

Y: Fn(typeof(f)) -> F

f: Fn(F) -> F

将 f 反柯里化，直接求值。

f: Fn(F, Arg) -> Output

相应的，X 也做变形。

type X = Fn(X, Arg) -> Output

想办法构造一个 X

(x, a) => x(x,a)

再用 f 来构造 X

(x, a) => f(a => x(x, a), a)

其中

x(x, a): Output

a => x(x, a): Fn(Arg) -> Output

f: Fn(F, Arg)-> Output

f(a => x(x, a), a): Output

用第二个 X 和外部输入的 a 作为参数，调用第一个 X，输出类型为 Output.

整体表现为 Fn(Arg) -> Output.

成功得到 Y

```javascript
Y = f => a =>
    ((x, a) => x(x, a))(
        (x, a) => f(a => x(x, a), a),
        a
    )
```

```javascript
fact = Y((f, n) => n == 1 ? 1 : n * f(n - 1))
console.debug(fact(5)) // 120
```

第一个 X 的作用是将第二个 X 自身输入给它。

x 求值时将一个包含自身的函数注入到 f，f 求值时又调用了 x，形成类似交叉递归的效果，这中间没有引入名字。

又因为双参函数可以立即求值，生存期不会干扰实现，函数可以用 `&dyn Fn(Arg) -> Output`。

## 实现

Rust 还不支持泛型匿名函数 (generic lambda)，只能用命名函数的写法了。

```rust
fn y<A, O>(f: impl Fn(&dyn Fn(A) -> O, A) -> O) -> impl Fn(A) -> O
```

y 有两个泛型参数，分别是 Arg 和 Output，接收一个参数 f，返回一个函数 Fn(A) -> O.

y: Fn(typeof(f)) -> F

f: Fn(F, A) -> O

用 new type 来构造 X，使 `X<A, O>` 与 `Fn(X<A, O>, A) -> O` 等效.

type X = Fn(X, Arg) -> Output

```rust
struct X<'a, A, O>(&'a dyn Fn(X<A, O>, A) -> O);

impl<'a, A, O> Clone for X<'a, A, O> {
    fn clone(&self) -> Self {
        Self(self.0)
    }
}

impl<'a, A, O> Copy for X<'a, A, O> {}

impl<'a, A, O> X<'a, A, O> {
    fn call(&self, x: Self, a: A) -> O {
        (self.0)(x, a)
    }
}
```

JS 表达式是这样的

```javascript
a => (
    (x, a) => x(x, a))(
        (x, a) => f(
            a => x(x, a),
            a
        ),
        a
    )
)
```

直接翻译到 Rust

```rust
move |a| {
    (|x: X<A, O>, a| x.call(x, a))(
        X(&|x, a| f(
            &|a| x.call(x, a),
            a
        )),
        a
    )
}
```

这样就完成了 Y 组合子。

```rust
fn y<A, O>(f: impl Fn(&dyn Fn(A) -> O, A) -> O) -> impl Fn(A) -> O {
    struct X<'a, A, O>(&'a dyn Fn(X<A, O>, A) -> O);

    impl<'a, A, O> Clone for X<'a, A, O> {
        fn clone(&self) -> Self {
            Self(self.0)
        }
    }

    impl<'a, A, O> Copy for X<'a, A, O> {}

    impl<'a, A, O> X<'a, A, O> {
        fn call(&self, x: Self, a: A) -> O {
            (self.0)(x, a)
        }
    }

    move |a| (|x: X<A, O>, a| x.call(x, a))(X(&|x, a| f(&|a| x.call(x, a), a)), a)
}
```

测试一下

```rust
fn fact(n: usize) -> usize {
    y(|f, n| match n {
        0 | 1 => 1,
        n => n * f(n - 1),
    })(n)
}

fn main(){
    dbg!(fact(5)); // 120
}
```

截取一段汇编，可以看到结果已经在编译时被算出来了。

```asm
playground::main:
	subq	$136, %rsp
	movq	$120, (%rsp) ; <- inline here
	movq	%rsp, %rax
	movq	%rax, 8(%rsp)
	leaq	.L__unnamed_2(%rip), %rax
	movq	%rax, %xmm0
	leaq	<&T as core::fmt::Display>::fmt(%rip), %rax
	...
```

[Rust Playground](https://play.rust-lang.org/?version=stable&mode=release&edition=2018&gist=9eb05047db8c39debf8f33af2f94aafe)

#### 意料之外

当我想看看 rustc 究竟能优化多少时，发生了诡异的情况。

```rust
#[inline(never)]
fn fact(n: usize) -> usize {
    y(|f, n| match n {
        0 | 1 => 1,
        n => n * f(n - 1),
    })(n)
}

#[inline(never)]
fn fib(n: usize) -> usize {
    y(|f, n| match n {
        0 => 0,
        1 => 1,
        n => f(n - 1) + f(n - 2),
    })(n)
}

fn main() {
    for &x in &[1, 2, 3, 4, 5, 10] {
        dbg!(fact(x));
        dbg!(fib(x));
    }
}
```

两个函数的汇编似乎都是提前用栈存储一些返回值，最后用一个函数不断尾递归调用自己，一并处理。

但这些汇编反常地多，在本地测试中，编译这么一点代码足足花了六分钟。

不开优化时一切正常，开启优化时却生成了不必要的大量汇编，也许是过于奇葩的 Y 组合子代码触发了 rustc 优化过程的某个 bug 吧。

## 再变换

之前的实现虽然符合无名递归的要求，但对优化太不友好了。

如果放松限制，允许犯规性地引入一个名字，用有名递归实现无名递归呢？

回到最初的类型推导

Y: Fn(typeof(f)) -> F

f: Fn(F) -> F

显然

Y(f): F

f(Y(f)): F

Y(f) = f(Y(f))

用 JS 实现，注意求值顺序，避免无限递归。

```javascript
var Y;
Y = f => f(x => Y(f)(x))

fact = Y(f => n => n == 1 ? 1 : n * f(n - 1))
console.debug(fact(5)) // 120
```

再次使用反柯里化

f: Fn(F, Arg)-> Output

已知 Y 和 f，构造一个 F

Y(f): F

f(Y(f), a): Output

a => f(Y(f), a): Fn(Arg) -> Output

a => f(Y(f), a): F

```javascript
var Y;
Y = f => a => f(Y(f), a)

fact = Y((f, n) => n == 1 ? 1 : n * f(n - 1))
console.debug(fact(5)) // 120
```

翻译到 Rust

```rust
fn y<'a, A, O>(
    f: &'a dyn Fn(
        &dyn Fn(A) -> O, A
    ) -> O
) -> impl Fn(A) -> O + 'a 
{
    move |a| f(&y(f), a)
}
```

但这个 Y 的形式对自动类型推导不友好，再包装一层。

```rust
fn y<'a, A, O>(f: impl Fn(&dyn Fn(A) -> O, A) -> O + 'a) -> impl Fn(A) -> O + 'a {
    fn real_y<'a, A, O>(f: &'a dyn Fn(&dyn Fn(A) -> O, A) -> O) -> impl Fn(A) -> O + 'a {
        move |a| f(&real_y(f), a)
    }
    move |a| real_y(&f)(a)
}
```

测试一下，发现编译期能算出结果。

[Rust Playground](https://play.rust-lang.org/?version=stable&mode=release&edition=2018&gist=db38e461ad2fb91253474d40b267b9cb)

更复杂的 fib 函数也能被合理优化。

```rust
#[inline(never)]
fn fib(n: usize) -> usize {
    y(|f, n| match n {
        0 => 0,
        1 => 1,
        n => f(n - 1) + f(n - 2),
    })(n)
}
```

## 结论

本文提出了三种 Y 组合子的实现形式。

第一种：用 Rc 存放函数，按原本的定义实现 Y 组合子。实验证明这样不会引起循环引用。

第二种：用 new type 构造递归定义的类型 X，用变换定义实现 Y 组合子。

第三种：允许犯规，借助 Y 组合子性质，用有名递归实现 Y 组合子。

最终结论：第一种性能低，第二种符合理论要求，但对优化不友好，甚至玩坏了 rustc，第三种虽然犯规，但能够被合理优化。

完整代码 [Rust Playground](https://play.rust-lang.org/?version=stable&mode=debug&edition=2018&gist=cad6a00d2d9a0d45c3c87e180d6220c5)
