---
postDate: "2019-01-29"
postOrder: 2
---

# IEEE754 浮点数取值范围

本文参照 IEEE754 二进制浮点数算术标准，以32位单精度浮点数(以下称 float )为例。

## 1. float的内存表示

1位符号，8位阶码，23位尾数

## 2. 阶码的取值范围

8位阶码范围：$[0,255]$

偏移值：$127$

指数表达式： $2 ^ {\mathrm{exponentbits} - 127}$

指数取值范围为 $[-127,128]$.

其中 $-127$ 保留给非规格化数，$+128$ 保留给 infinity.

因此32位浮点数的指数取值范围是 $[-126, 127]$.

## 3. float的计算方式

$$
\mathrm{value} = (-1) ^ \mathrm{signbit} \times 2 ^ {\mathrm{exponentbits} - 127 }\times (1.\mathrm{significandbits})_2
$$

例如：

    0 10001000 10000000000000000000000

其值的表达式：

$$
(-1) ^ 0 \times 2 ^ {(10001000)_2 - 127} \times (1.1)_2
$$

$$
1 \times 2 ^ {136 - 127} \times 1.5 = 768.0
$$

## 4. 程序验证

```c
#include <stdio.h>

int main() {
    float a = 768.0;
    char *p = (char *)(&a);

    for (int i = 3; i >= 0; --i) {
        printf("%02x ", *(p + i));
    }

    printf("\n");
    return 0;
}
```

编译运行

    gcc t.c && ./a.out

输出

    44 40 00 00

符合结论

    0x    4   4   4   0   0   0   0   0 
    0b 01000100010000000000000000000000

## 5. float的取值范围

最大值：

$(−1) ^ 0 \times 2 ^ {254 − 127}\times(1.11111111111111111111111)_2$

$= 2 ^ {127} \times (2-2 ^ {-23})$

$\simeq 3.4\times10^{38}$


最小值:

$(−1) ^ 1 \times 2 ^ {254 − 127}\times(1.11111111111111111111111)_2$

$= -2 ^ {127} \times (2-2 ^ {-23})$

$\simeq -3.4\times10^{38}$


最小规格化正值：
    
$(−1) ^ 0 \times 2 ^ {− 126}\times (1.00000000000000000000000)_2$

$= 2 ^ {-126}$

$\simeq 1.18\times10^{-38}$


最小非规格化正值：

$(−1) ^ 0 \times 2 ^ {− 126}\times (0.00000000000000000000001)_2$

$= 2 ^ {-149}$

$\simeq 1.40\times10^{-45}$
