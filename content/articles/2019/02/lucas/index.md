---
postDate: "2019-02-02"
---

# 组合数取模 C(n, m) % p

计算式

$$
C(n, m) = \frac{n!}{m! \cdot (n - m)!}
$$

## 解法1：暴力计算 + gcd 约分

此处略去

## 解法2：乘法逆元

当 $(a, p) = 1$ 且 $a \cdot b \mod p = 1$ 时，称 $b$  为 $a \mod p$ 的逆元。

当 $b \mod p$ 的逆元为 $c$ 时，可得

$$
\begin{aligned}
    &\frac{a}{b} \mod p\\
=\; &(\frac{a}{b} \mod p) \cdot ((b \cdot c) \mod p)\\
=\; &(a\cdot c)\mod p\\
\end{aligned}
$$

计算式

$b$  为 $a \mod p$ 的乘法逆元, 记为 $b=\mathrm{inv}(a,\,p)$.

$$
\begin{aligned}
        &C(n, m)\\
\equiv\;&\frac{n!}{m! \cdot (n - m)!}\\
\equiv\;&n! \cdot \mathrm{inv}(m!,\,p) \cdot \mathrm{inv}((n - m)!,\,p)\\
        &(\mod p)\\
\end{aligned}
$$

可用 exgcd 求逆元.
单组数据可直接算，但多组数据且范围较大时，时间消耗大，打表又消耗了大量空间，有局限性。

## 解法3：费马小定理

当 $p$ 为素数时， $a ^ {p - 2} = \mathrm{inv}(a, p)$.

可用快速幂取模替换解法2的 exgcd，但局限性相同。

## 解法4：卢卡斯定理

当 p 是素数时

$$
\begin{aligned}
        &C(n,m)\\
\equiv\;&(C(n\mod p,m \mod p) \mod p)\\
\cdot   &(C(\frac{n}{p},\frac{m}{p})\mod p)\\
        &(\mod p)\\
\end{aligned}
$$

显然这是一个递归计算式，而且还是尾递归.

每次需要求解的 $C(n \mod p, m \mod p) \mod p$ 的数据范围一定在 $[0, p)$ 内.
当 $p$ 不是很大 $(10^5)$ 时，可以预打表，直接计算.


### 计算方法

$$
r = C(n ,m) \mod p
$$

定义状态

$$
(t, a, b)
$$

循环不变式
$$
r = t \cdot C(a, b) \mod p
$$

状态转移 

$$
\begin{aligned}
t&\Rightarrow t \cdot C(a \mod p, b \mod p) \mod p\\
a&\Rightarrow \frac{a}{p}\\
b&\Rightarrow \frac{b}{p}\\
\end{aligned}
$$

初始状态 

$$
(1, n, m)
$$

转移后

$$
(\;C(n \mod p,\;m \mod p) \mod p,\;\;\frac{n}{p},\;\frac{m}{p}\;)
$$

由归纳法和卢卡斯定理得循环不变式成立.

如果当前状态可以直接导出 $r$ ，则终止状态转移.

$$
(t, a, b)
$$

$$
r = t \cdot C(a, b) \mod p
$$

$$
\begin{aligned}
(t=0) &\Rightarrow r=0\cdot C(a,b)  &= 0\\
(a<b) &\Rightarrow r=t\cdot 0       &= 0\\
(a=b) &\Rightarrow r=t\cdot 1       &= t\\
(b=0) &\Rightarrow r=t\cdot 1       &= t\\
\end{aligned}
$$

### 代码

```cpp
ll lucas(const ll n, const ll m, const ll p) {
    ll t = 1, a = n, b = m;
    while (t && a>=b) {
        if (a == b || b == 0){
            return t;
        }

        t *= C(a % p, b % p, p);
        a /= p, b /= p;
    }
    return 0;
}
```
