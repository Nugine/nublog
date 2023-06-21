#include <immintrin.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <assert.h>
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

bool distinct9_naive(int32_t *arr) {
    int32_t a = arr[0], b = arr[1], c = arr[2], d = arr[3], e = arr[4],
            f = arr[5], g = arr[6], h = arr[7], i = arr[8];
    bool f1 = (a != b) & (a != c) & (a != d) & (a != e) & (a != f) & (a != g) &
              (a != h) & (a != i);
    bool f2 = (b != c) & (b != d) & (b != e) & (b != f) & (b != g) & (b != h) &
              (b != i);
    bool f3 = (c != d) & (c != e) & (c != f) & (c != g) & (c != h) & (c != i);
    bool f4 = (d != e) & (d != f) & (d != g) & (d != h) & (d != i);
    bool f5 = (e != f) & (e != g) & (e != h) & (e != i);
    bool f6 = (f != g) & (f != h) & (f != i);
    bool f7 = (g != h) & (g != i);
    bool f8 = h != i;
    return f1 & f2 & f3 & f4 & f5 & f6 & f7 & f8;
}

// 作者：tyrtyugj546y
// 链接：https://www.zhihu.com/question/597274781/answer/3042179526
// 来源：知乎

bool draft2441x (int32_t *disp32)
{
  const __m256i ymm0 = _mm256_loadu_si256 ((const __m256i *) (disp32));
  const __m256i ymm2 = _mm256_permute2x128_si256 (ymm0, ymm0, 0x21); // swap d0~d3 and d4~d7 

  // vector comparison r [d0...d7] == d8 mask 
  const __m256i compare_r = _mm256_cmpeq_epi32 (ymm0, _mm256_set1_epi32 (disp32[8])); // TODO:boardcastd ???...
  // vector comparison 0
  const __m256i compare0 = _mm256_cmpeq_epi32 (ymm0, ymm2);
  // vector comparison a 
  const __m256i compare_a = _mm256_cmpeq_epi32 (ymm0, _mm256_alignr_epi8 (ymm2, ymm0, 4));
  // vector comparison b 
  const __m256i compare_b = _mm256_cmpeq_epi32 (ymm0, _mm256_alignr_epi8 (ymm2, ymm0, 8));
  // vector comparison c 
  const __m256i compare_c = _mm256_cmpeq_epi32 (ymm0, _mm256_alignr_epi8 (ymm2, ymm0, 12));

  // vector mask merge (TODO:??...)
  const __m256i m = compare_r | compare0 | compare_a | compare_b | compare_c;

  if ( _mm256_testz_si256 ( m, m ) != 0 )
  {
    return true;
  }
  // cmpeq 5x
  // load (unaligned) 1x 
  // permute128 1x 
  // set1 1x 
  // alignr 3x 
  // or 2x 
  // packs 2x 
  // testz 1x 
  // 
  // scalar free assembly instruction
  return false;
}

int main() {
    int32_t a[10];
    for (a[0] = 0; a[0] <= 10; a[0]++) {
        for (a[1] = 0; a[1] <= 10; a[1]++) {
            for (a[2] = 0; a[2] <= 10; a[2]++) {
                for (a[3] = 0; a[3] <= 10; a[3]++) {
                    for (a[4] = 0; a[4] <= 10; a[4]++) {
                        for (a[5] = 0; a[5] <= 10; a[5]++) {
                            for (a[6] = 0; a[6] <= 10; a[6]++) {
                                for (a[7] = 0; a[7] <= 10; a[7]++) {
                                    for (a[8] = 0; a[8] <= 10; a[8]++) {
                                        if (draft2441x(a) !=
                                            distinct9_naive(a)) {
                                            printf("a: %d %d %d %d %d %d %d %d "
                                                   "%d\n",
                                                   a[0], a[1], a[2], a[3], a[4],
                                                   a[5], a[6], a[7], a[8]);
                                            return 1;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return 0;
}
