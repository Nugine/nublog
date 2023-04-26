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
