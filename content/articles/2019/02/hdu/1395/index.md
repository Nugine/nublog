---
postDate: "2019-02-01"
postOrder: 3
---

# HDU-1395 2^x mod n = 1

## 题目：[2^x mod n = 1](http://acm.hdu.edu.cn/showproblem.php?pid=1395)

## 解法1： 暴力

$x$ 从 $1$ 取起，挨个算一下，第一个满足要求的 $x$ 就是 $ans$.

为了避免溢出，需要用乘法取模。

$(a \cdot b)$ $\equiv ((a \mod m)\cdot (b \mod m)),\;$ $(\mod m)$

## 解法2： 欧拉定理

概念： **阶**

设 $n > 1$ 且 $a, n$ 互质，则有最小的正整数 $t$, 使得

$$
a ^ t \mod n = 1
$$

此时称 $t$ 为 $a$ 对模 $n$ 的阶，记为 $t=\mathrm{Ord}_n(a)$.

概念： **原根**

由欧拉定理可知 $\mathrm{Ord}_n(a) <= \phi(n)$.

当 $\mathrm{Ord}_n(a) = \phi(n)$ 时，称 $a$ 是模 $n$ 意义下 $n$ 的一个原根.

### 分析

因为要有解， 所以 $n$ 必须是大于 $1$ 的奇数.

可得 $ans = \mathrm{Ord}_m(2)$, $ans$ 的上界为 $\phi(m)$.

因为 

$$
\begin{aligned}
    2 ^ {\mathrm{Ord}_m(2)} &\mod m = 1,\;(\text{阶的定义})\\
    2 ^ {\phi(m)} &\mod m = 1,\;(\text{欧拉定理})\\
\end{aligned}
$$

$$
\mathrm{Ord}_m(2) \le \phi(m)
$$

所以

$$
\mathrm{Ord}_m(2)\;|\;\phi(m)
$$

所以 $ans$ 是 $\phi(m)$ 的因子.

先计算 $\phi(m)$，然后枚举因子，最小的满足条件的因子就是 $ans$.

## 代码

解法1： [mod.1.cpp](./mod.1.cpp)

解法2： [mod.2.cpp](./mod.2.cpp)
