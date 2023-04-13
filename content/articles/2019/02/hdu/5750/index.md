---
postDate: "2019-02-01"
postOrder: 1
---

# HDU-5750 Dertouzos

题目： [Dertouzos](http://acm.hdu.edu.cn/showproblem.php?pid=5750)

## 解法： 线性素数筛

看完题目，很容易想到在区间 $[1, n)$ 内遍历，数出最大真因子为 $d$ 的数有多少个，明显超时.

反过来想，如果一个正整数 $t$ 的最大真因子是 $d$ ，那么一定有
    
$$
t = x \cdot d,\; x \le d
$$

枚举这个 $x$ ，数出 $x \cdot d < n$ 的有多少个就行了.

虽然把遍历区间换到了 $d$ 上，但还是会超时.

对 $x$ 进行分析，假设 $x$ 是合数，那么有

$$
x = p_1^{a_1} \cdot p_2^{a_2} \dots p_n^{a_n}
$$

此时

$$
t = \frac{x}{p_1} \cdot (d\cdot p_1)
$$

$$
d \cdot p_1 > d
$$

与 $d$ 为 $t$ 的最大真因子矛盾，所以 $x$ 是素数.

遍历序列长度减少,大约是 $\frac{d}{\ln d}$.

当 $d$ 是素数时，按上述方式遍历素数序列.

当 $d$ 是合数时

$$
d = p_1^{a_1} \cdot p_2^{a_2} \dots p_n^{a_n}
$$

考虑 $x$ 在 $p$ 序列中的位置，若 $x$ > $p_1$，则

$$
\begin{aligned}
    t&=p_1^{a_1} \cdot x \cdot p_2^{a_2} \cdot \dots \cdot p_n^{a_n}\\
    t&=p_1\cdot(p_1^{a_1-1})\cdot x \cdot p_2^{a_2} \cdot \dots \cdot p_n^{a_n}
\end{aligned}
$$

$$
\frac{t}{p_1}>d
$$

所以 $d$ 不是 $t$ 的最大真因子，构造错误.

所以 $x \le p_1$.

因此需要遍历的素数到 d 的最小质因子为止.

整理一下，我们需要遍历素数序列 $P$ ,使用 $P_i$ 和 $d$ 乘出一个正整数 $t$ ，如果 $t < n$，它就符合要求，遍历到 $d$ 的最小质因子 $p_1$ 为止.

答案就是这个有序集合的基数

$$
| \{ P_i \cdot d\;|P_i \cdot d < n,\;P_i \le p_1,\;i=1,2,\dots \} |
$$

用线性素数筛预先计算出足够的素数，对每组数据分别求答案即可.

本题数据范围 $10^9$.

若 $d > \sqrt{10^9}$，则当 $x$ 接近 $\sqrt{10^9}$ 时， $x \cdot d > n$ 一定成立.

若 $d < \sqrt{10^9}$，则 $d$ 的最小质因子一定小于 $\sqrt{10^9}$.

因此需要计算的最大素数只要大于 $\sqrt{10^9}$ 即可，大约 $32000$.

代码：[dertouzos.cpp](./dertouzos.cpp)
