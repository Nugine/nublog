---
postDate: "2019-01-31"
postOrder: 1
---

# POJ-2181 Jumping Cows

题目：[Jumping Cows](http://poj.org/problem?id=2181)

## 解法：动态规划

给定长度为 $n$ 的序列 $a$, 要求找出一个子序列, 使得它的奇数项和减去偶数项和的结果最大.

### 最优子结构

如果子序列长度为 $m$, 最后一项为 $a[i]$, 则 子序列的前 $m - 1$ 项在 $a$ 的前 $i - 1$ 项中, 且前 $m - 1$ 项组成的序列的结果也是最大的.

若子序列前 $m - 1$ 项的结果不是最大的, 则可以在 $a$ 的前 $i - 1$ 项中重新找到一个结果最大的子序列来替换它, 使得最终结果更大.

长度为 $m$ 的子序列可以通过求长度为 $m - 1$ 的子序列来得到.

### 最优解定义

第 $i$ 个数时的最大结果

$$
\begin{aligned}
    dp[i][0]: \text{子序列长度为奇数}\\
    dp[i][1]: \text{子序列长度为偶数}
\end{aligned}
$$

$$
dp[i][0]=\max\left(
    \begin{aligned}
        &dp[i-1][0],\\
        &dp[i-1][1] + a[i]
    \end{aligned}
\right)
$$

$$
dp[i][1] = \max\left(
    \begin{aligned}
        &dp[i-1][1],\\
        &dp[i-1][0] - a[i]
    \end{aligned}
\right)
$$

### 空间优化

从最优子结构描述和状态转移方程可以看出, $dp[i]$ 只与 $dp[i-1]$ 有关, 因此可以优化到常数空间.

定义状态: $(i, o, e)$

表示 $a$ 的前 $i$ 项中抽出长度为奇数和偶数的子序列的结果的最大值.

初始状态: $(0, 0, 0)$

状态转移: 

$$
\begin{aligned}
    \begin{pmatrix}
        i-1\\
        o\\
        e\\
    \end{pmatrix}
    \Rightarrow
    \begin{pmatrix}
        i\\
        max(o, e + a[i])\\
        max(e, o - a[i])\\
    \end{pmatrix}
\end{aligned}
$$

终止条件: $i == n$

$$
ans = \max(o, e)
$$

代码：[jumping-cows.cpp](./jumping-cows.cpp)
