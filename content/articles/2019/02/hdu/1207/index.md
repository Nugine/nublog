---
postDate: "2019-02-01"
postOrder: 4
---

# HDU-1207 汉诺塔II

题目: [汉诺塔II](http://acm.hdu.edu.cn/showproblem.php?pid=1207)

公式: [OEIS-A007664](http://oeis.org/A007664)

$$
A(n)=A007664(n) = \sum_{i=0}^{n-1}{2 ^ {A003056(i)}}
$$

$$
B(n)=A003056(n) = \lfloor \frac{1}{2}(\sqrt{1 + 8n} - 1)\rfloor
$$

$$
A(n+1) = A(n) + 2 ^ {B(n)}
$$

使用下标 i 转写.

    A[i+1] = A[i] + 2 ^ floor((sqrt(1 + 8 * i) - 1) / 2)

快速幂+递推, 即得解.

由于题目数据范围较小, 不用取模, 可预打表.

这里使用惰性递推, 当 $A(n)$ 不在已有的数据内时, 递推计算出 $A(n)$时就返回.

代码：[hanoi4.cpp](./hanoi4.cpp)
