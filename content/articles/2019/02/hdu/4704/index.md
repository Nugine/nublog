---
postDate: "2019-02-01"
postOrder: 2
---

# HDU-4704 Sum

题目: [Sum](http://acm.hdu.edu.cn/showproblem.php?pid=4704)

$M = 10^9 + 7$

易得 $ans = 2 ^ {N-1} \mod M$

$N$ 非常大，因此要想办法化简。

## 解法1： 费马小定理 + 快速幂

注意到 $M$ 是素数，因此可用费马小定理。

$$
a ^ {p - 1} \mod p = 1
$$

在本题中，即

$$
2 ^ {M - 1} \mod M = 1
$$

若 $N - 1 = (M - 1)\cdot t + k$, 则

$$
\begin{aligned}
        &2 ^ {N-1} \mod M\\
    =\; &((2^{M-1}) ^ t \times 2 ^ k) \mod M\\
    =\; &2 ^ k \mod M
\end{aligned}
$$

此时 $k = (N - 1) \mod (M - 1)$, 但要注意保证 $k$ 为非负数。

剩下的就是使用快速幂取模计算答案了。

## 解法2：高精度求幂 + 除法取模

既然要计算 $2 ^ {N - 1} \mod M$, 有没有办法直接计算呢？

本质上是单精度的高精度次幂的取模运算，那么就能分解。

$\boldsymbol{123} = ((\boldsymbol{0} \times10 +\boldsymbol{1})\times10 +\boldsymbol{2})\times10 +\boldsymbol{3}$

$\boldsymbol{2 ^ {123}} = ((\boldsymbol{1}^{10} \times \boldsymbol{2^1})^{10} \times \boldsymbol{2 ^ 2})^{10} \times \boldsymbol{2 ^ 3}$

边读边乘，读完 $N$ 就得到了 $2 ^ N \mod M$.

除法取模又用到了费马小定理:
$$
\begin{aligned}
        &\frac{a}{c} \mod p\\
    =\; &(\frac{a}{c} \mod p)\cdot (c^{p-1}\mod p)\\
    =\; &a\cdot c^{p-2} \mod p
\end{aligned}
$$

适用条件： $c, p$ 互质。

在本题中，有

$$
\begin{aligned}
        &2 ^ {N - 1} \mod M\\
    =\; &(2 ^ N \times 2 ^ {M - 2}) \mod M\\
    =\; &((2 ^ N \mod M) \times C) \mod M
\end{aligned}
$$

$$
C=(2 ^ {M - 2} \mod M)
$$

$C$ 是常量，先写个快速幂就能求出来。

最后相乘取模，得解。

## 代码

解法1：[sum.1.cpp](./sum.1.cpp)

解法2：[sum.2.cpp](./sum.2.cpp)
