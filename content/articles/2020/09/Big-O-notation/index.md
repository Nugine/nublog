---
postDate: "2020-09-08"
---

# 渐进符号的特性

$$
O(f(n))+O(g(n)) = O(\max\{f(n),g(n)\})
$$

#### 证明

设

$$
x(n) = \max\{f(n),g(n)\}
$$

可得

$$
x(n)\le f(n)+g(n) \le 2x(n)
$$

$$
f(n)+g(n)=\Theta(x(n))
$$

$$
f(n)+g(n)=O(x(n))
$$

因为

+ $f(n)=O(f(n))$ 
+ $g(n)=O(g(n))$ 
+ $f(n)+g(n)=O(x(n))$ 

所以

$$
O(f(n))+O(g(n))=O(x(n))
$$

即得

$$
O(f(n))+O(g(n)) = O(\max\{f(n),g(n)\})
$$

证毕. 

#### 参考

1. <https://en.wikipedia.org/wiki/Big_O_notation#Multiple_uses>
