---
postDate: "2019-02-01"
postOrder: 5
links:
    知乎: https://zhuanlan.zhihu.com/p/66526975
---

# 扩展欧几里得递推算法

## 欧几里得算法

$\mathrm{gcd}(a, b)$ 表示 整数 a 与 b 的最大公约数.

若 $t = a \mod b$, 则 $\mathrm{gcd}(a, b) = \mathrm{gcd}(b, t)$

证明略.

### 递推版 gcd 算法

gcd 接受变量元组 $(a, b)$ 作为输入，输出最大公约数 $(r)$.

我们很难直接计算出 $r$，但可以通过一些中间步骤逐步计算得到 $r$.

我们定义一个中间状态

$$
(c,\;d,\;t)
$$

其中 $t = c \mod d$

定义一个状态转移过程，将一个状态映射到下一个状态.

$$
\begin{pmatrix}
    c\\
    d\\
    t\\ 
\end{pmatrix}
\Rightarrow
\begin{pmatrix}
    d\\
    t\\
    d\mod t\\
\end{pmatrix}
$$

将初始状态赋值为 $(a,\;b,\;a \mod b)$，则 $r = \mathrm{gcd}(a, b)$

进行状态转移

$$
\begin{pmatrix}
    a\\
    b\\
    a\mod b\\ 
\end{pmatrix}
\Rightarrow
\begin{pmatrix}
    b\\
    a\mod b\\
    b \mod (a\mod b)\\
\end{pmatrix}
$$

此时

$$
r = \mathrm{gcd}(b,\;a\mod b) = \mathrm{gcd}(a,\;b)
$$

由归纳法可得，在任意一个中间状态 $(c, d, t)$ 时，有

$$
r = \mathrm{gcd}(c, d)
$$

状态转移不能无限进行下去，要有一个终止条件，即 $t = 0$.

当 $t = c \mod d = 0$ 时，显然 $d\;|\;c$， $r = \mathrm{gcd}(c, d) = d$.

在最终状态 $(c, d, 0)$ 时， $d$ 就是最大公约数 $r$.


### 代码

```cpp
int gcd(const int a, const int b) {
    int c = a, d = b, t = a % b;
    while (t) {
        c = d;
        d = t;
        t = c % d;
    }
    return d;
}
```

实际上，可以减少变量个数，直接使用输入时定义的变量 a, b 存放中间状态，即我们通常所见的 gcd 实现。

## 扩展欧几里得算法

设

$$
r = \mathrm{gcd}(a, b) = a\cdot x + b\cdot y
$$

则扩展欧几里得算法可以在求出 $r$ 的同时，得出二元一次方程$r = a \cdot x + b \cdot y$ 的一组整数解。

### 递推版 exgcd 算法

exgcd 是一个映射

$$
(a,\,b) \Rightarrow (r,\,x,\,y)
$$

可以这样定义中间状态

$$
(c,\,d,\,q,\,t,\,x,\,y)
$$

其中
$$
\begin{aligned}
    q &= \lfloor\frac{c}{d}\rfloor\\
    t &= c \mod d = a \cdot x + b \cdot y\\
\end{aligned}
$$

继承 gcd 的状态转移过程

$$
\begin{pmatrix}
    c\\
    d\\
    q\\
    t\\
    x\\
    y\\
\end{pmatrix}
\Rightarrow
\begin{pmatrix}
    d\\
    t\\
    \lfloor\frac{d}{t}\rfloor\\
    d \mod t\\
    x'\\
    y'\\
\end{pmatrix}
$$

当 $d \mod t = 0$ 时， $r = \mathrm{gcd}(c, d) = \mathrm{gcd}(d, t) = t$.

此时该状态保证 $r = t = a \cdot x + b \cdot y$， 即得解.

如何递推计算 $x, y$ ?

$$
\begin{aligned}
    t &= a \cdot x + b \cdot y\\
    d \mod t &= a \cdot x' + b \cdot y'\\
\end{aligned}
$$

$$
\begin{aligned}
    &d \mod t\\
=   &d - \lfloor\frac{d}{t}\rfloor \cdot t\\
=   &d - \lfloor\frac{d}{t}\rfloor \cdot (a \cdot x + b \cdot y)\\
\end{aligned}
$$

无法计算 $x',\,y'$.

又注意到上式中的 $d$ 阻断了递推，因此需要想办法用 $x,\,y$ 表示 $d$.

这就是通常的 exgcd 递推算法.

定义状态

$$
(c,\,d,\,q,\,t,\,x_0,\,y_0,\,x_1,\,y_1)
$$

其中
$$
\begin{aligned}
    q &= \lfloor\frac{c}{d}\rfloor\\
    t &= c\mod d\\
    c &= a\cdot x_0 + b\cdot y_0\\
    d &= a\cdot x_1 + b\cdot y_1\\
\end{aligned}
$$

状态转移

$$
\begin{pmatrix}
    c\\
    d\\
    q\\
    t\\
    x_0\\
    y_0\\
    x_1\\
    y_1\\
\end{pmatrix}
\Rightarrow
\begin{pmatrix}
    d\\
    t\\
    \lfloor\frac{d}{t}\rfloor\\
    d\mod t\\
    x_1\\
    y_1\\
    x_0-q\cdot x_1\\
    y_0-q\cdot y_1\\
\end{pmatrix}
$$

证明： 状态转移不会破坏状态定义

$$
\begin{aligned}
    &t\\
=\; &c - q \cdot d\\
=\; &(a \cdot x_0 + b \cdot y_0) - q \cdot (a \cdot x_1 + b \cdot y_1)\\
=\; &(x_0 - q \cdot x_1) \cdot a + (y_0 - q \cdot y_1) * b\\
\end{aligned}
$$

$$
\begin{aligned}
    d &= a \cdot x_1 + b \cdot y_1\\
    t &= a \cdot (x_0 - q \cdot x_1) + b \cdot (y_0 - q \cdot y_1)\\
\end{aligned}
$$

因此转移后的状态仍满足定义。

初始状态

$$
(a,\,b,\,\lfloor\frac{a}{b}\rfloor,\,a \mod b,\,1,\,0,\,0,\,1)
$$

由归纳法可得，在任意一个中间状态，有 $r = \mathrm{gcd}(c, d)$

当 $t = c \mod d = 0$ 时, $d\,|\,c,\;r = \mathrm{gcd}(c,\,d) = d$.

$$
r = d = a \cdot x_1 + b \cdot y_1 = a \cdot x + b \cdot y
$$

输出为 $(d,\,x_1,\,y_1)$

### 代码

欧几里得算法: [gcd.cpp](./gcd.cpp)

扩展欧几里得算法: [exgcd.cpp](./exgcd.cpp)
