---
postDate: "2023-04-25"
editDate: "2023-04-28"
links:
    知乎: https://www.zhihu.com/question/597274781/answer/3000680442
---

# SIMD 计算 9 个变量互不相等

知乎问题：[c语言怎么“简单”表示9个变量互不相等?](https://www.zhihu.com/question/597274781)

---

为什么不试试神奇的 SIMD 呢？

#### 算法

假设 9 个变量都是 32 位整数，输入为长度 9 的数组指针，输出为布尔值，表示 9 个变量是否互不相等。

AVX2 的 256 位向量可以放下 8 个 i32，第 9 个要特殊处理。

我们将 9 个变量记为 a,b,c,d,e,f,g,h,i.

首先将 abcdefgh 组成一个 i32x8 向量，i 扩展成 i32x8 向量，进行一次向量比较

```
abcd efgh
iiii iiii
```

这就完成了 8 次有效比较，得出 abcdefgh 中是否有和 i 相等的。

然后将 abcd efgh 旋转一次，得到 bcda fghe，进行向量比较

```
abcd efgh
bcda fghe
```

完成的有效比较为

```
ab, bc, cd, da, ef, fg, gh, he,
```

同理再旋转和比较两轮，完成的比较为

```
ac, bd, ca, db, eg, fh, ge, hf,
ad, ba, cb, dc, eh, fe, gf, hg,
```

去掉重复的，可以看出有 12 次有效比较

```
ab, bc, cd,   , ef, fg, gh,  ,
ac, bd,   ,   , eg, fh,   ,  ,
ad,   ,   ,   , eh,   ,   ,  ,
```

最后再将 abcdefgh 拆开，得到 abcd 和 efgh，同样进行四轮旋转和比较

```
abcd

efgh
fghe
ghef
hefg
```

可以完成 16 次有效比较

```
ae, bf, cg, dh
af, bg, ch, de
ag, bh, ce, df
ah, be, cf, dg
```

总共有 8 + 12 + 16 = 36 次有效比较，无遗漏，算法是正确的。

#### 代码

用 AVX2 指令实现算法，就得到了下面的代码。

```c
#include <immintrin.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#define eprintf(...) fprintf(stderr, __VA_ARGS__)

typedef __m256i i32x8;
typedef __m128i i32x4;

#define rotate 0b00111001 // LE 1230

bool distinct9(int32_t *arr) {
    i32x8 x = _mm256_loadu_si256((i32x8 *)(arr));
    i32x8 m1 = _mm256_cmpeq_epi32(x, _mm256_set1_epi32(arr[8]));

    i32x8 b;

    b = _mm256_shuffle_epi32(x, rotate);
    m1 |= _mm256_cmpeq_epi32(x, b);

    b = _mm256_shuffle_epi32(b, rotate);
    m1 |= _mm256_cmpeq_epi32(x, b);

    b = _mm256_shuffle_epi32(b, rotate);
    m1 |= _mm256_cmpeq_epi32(x, b);

    int f1 = _mm256_testz_si256(m1, m1);

    i32x4 x1 = _mm256_castsi256_si128(x);
    i32x4 x2, m2;

    x2 = _mm256_extracti128_si256(x, 1);
    m2 = _mm_cmpeq_epi32(x1, x2);

    x2 = _mm_shuffle_epi32(x2, rotate);
    m2 |= _mm_cmpeq_epi32(x1, x2);

    x2 = _mm_shuffle_epi32(x2, rotate);
    m2 |= _mm_cmpeq_epi32(x1, x2);

    x2 = _mm_shuffle_epi32(x2, rotate);
    m2 |= _mm_cmpeq_epi32(x1, x2);

    int f2 = _mm_testz_si128(m2, m2);

    return f1 && f2;
}

int main() {
    int32_t cases[4][9] = {
        {1, 2, 3, 4, 5, 6, 7, 8, 9},
        {1, 1, 3, 4, 5, 6, 7, 8, 9},
        {1, 2, 3, 4, 5, 6, 7, 8, 1},
        {1, 2, 3, 4, 4, 6, 7, 8, 9},
    };

    for (int i = 0; i < 4; i++) {
        printf("case %d: %d\n", i, distinct9(&cases[i][0]));
    }

    return 0;
}
```

测试结果

```
gcc a.c -march=native -O3 -Wall && ./a.out
```

```
case 0: 1
case 1: 0
case 2: 0
case 3: 0
```

不过这个 SIMD 算法可能没有性能优势，因为平均下来每次旋转和向量比较都只产生了 4 次有效比较。如果考虑到 CPU 指令级并行，就算比 36 次比较的标量算法慢也不奇怪。

---

更新：

使用 Rust Criterion 基准测试框架测量的结果如下，AVX2 版本的速度大约是标量版本的 1.44 倍。

```
distinct9/naive         time:   [5.6510 ns 5.6686 ns 5.6866 ns]
distinct9/avx2          time:   [3.8917 ns 3.9341 ns 3.9897 ns]
```

关键代码链接：<https://play.rust-lang.org/?version=stable&mode=release&edition=2021&gist=48a2630aec6fb35519a1c8be307fbcda>
