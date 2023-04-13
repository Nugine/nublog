---
postDate: "2019-01-30"
postOrder: 1
---

# 洛谷 P1258 小车问题

题目：[小车问题](https://www.luogu.org/problemnew/show/P1258)

甲乘车到C，下车走到B

车由C向A开，在D点与走路的乙相遇

乙上车到B

    |-------|--------|-----------|
    A       D        C           B

$$
T_{AC}=\frac{AC}{b}
$$

$$
T_{CB}=\frac{CB}{a}
$$

$$
T_{AD}=\frac{AD}{a}
$$

$$
T_{DB}=\frac{DB}{b}
$$

$$
T_\text{甲}=T_{AC}+T_{CB}
$$

$$
T_\text{乙}=T_{AD}+T_{DB}
$$

$$
T_\text{甲}=T_\text{乙}
$$

$$
    \frac{AC}{b}+\frac{CB}{a}=\frac{AD}{a}+ \frac{DB}{b}
$$

设 $p$ 为两速度之比，由题中“步行速度小于车速”可得比值大于1

$$
    p=\frac{b}{a},\;p>1
$$

设 $CB=x,\;AD=y$

$$
    \frac{s-x}{p}+x=y+\frac{s-y}{p}
$$

$$
    x(p-1)=y(p-1),\;p\ne1
$$

$$
    x=y
$$

因此 $AD=CB=x$

    |-------|--------|---------|
    A   x   D  s-2x  C    x    B

$$
\begin{aligned}
T_{DB}=\frac{x}{a}&=\frac{s-2x}{b}+\frac{s-x}{b}\\
bx&=a(2s-3x)\\
(b+3a)x&=2as\\
x&=\frac{2as}{b+3a}\\
\end{aligned}
$$

$$
\begin{aligned}
T_{AB}=t&=\frac{x}{a}+\frac{s-x}{b}\\
t&=x\cdot\frac{b-a}{ab}+\frac{s}{b}\\
t&=\frac{2(b-a)s}{(b+3a)b}+\frac{s}{b}\\
t&=\frac{3b+a}{b+3a}\cdot\frac{s}{b}
\end{aligned}
$$

公式

$$
t=\frac{3b+a}{b+3a}\cdot\frac{s}{b}
$$

代码

```cpp
#include <iostream>
using namespace std;

int main() {
    double s, a, b, ans;

    cout.setf(ios::fixed);
    cout.precision(6);

    cin >> s >> a >> b;
    ans = (3 * b + a) / (b + 3 * a) * s / b;
    cout << ans << endl;

    return 0;
}
```