---
postDate: "2019-02-16"
---

# 快速幂

```cpp
int qpow(int b, int p, int m) {
    int r = 1;
    b %= m;
    while (p) {
        if (p & 1) {
            r *= b;
            r %= m;
        }
        b *= b;
        b %= m;
        p >>= 1;
    }
    return r;
}
```
