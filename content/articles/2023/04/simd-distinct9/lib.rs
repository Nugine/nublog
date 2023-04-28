#![allow(clippy::missing_safety_doc)]

pub fn distinct9_naive(arr: &[i32; 9]) -> bool {
    let [a, b, c, d, e, f, g, h, i] = arr;
    let f1 = (a != b) & (a != c) & (a != d) & (a != e) & (a != f) & (a != g) & (a != h) & (a != i);
    let f2 = (b != c) & (b != d) & (b != e) & (b != f) & (b != g) & (b != h) & (b != i);
    let f3 = (c != d) & (c != e) & (c != f) & (c != g) & (c != h) & (c != i);
    let f4 = (d != e) & (d != f) & (d != g) & (d != h) & (d != i);
    let f5 = (e != f) & (e != g) & (e != h) & (e != i);
    let f6 = (f != g) & (f != h) & (f != i);
    let f7 = (g != h) & (g != i);
    let f8 = h != i;
    f1 & f2 & f3 & f4 & f5 & f6 & f7 & f8
}

pub unsafe fn distinct9_avx2(arr: &[i32; 9]) -> bool {
    use core::arch::x86_64::*;

    let x = _mm256_loadu_si256(arr.as_ptr().cast());
    let mut m1 = _mm256_cmpeq_epi32(x, _mm256_set1_epi32(arr[8]));

    const R: i32 = 0b00111001;
    let mut b;

    b = _mm256_shuffle_epi32::<R>(x);
    m1 = _mm256_or_si256(m1, _mm256_cmpeq_epi32(x, b));

    b = _mm256_shuffle_epi32::<R>(b);
    m1 = _mm256_or_si256(m1, _mm256_cmpeq_epi32(x, b));

    b = _mm256_shuffle_epi32::<R>(b);
    m1 = _mm256_or_si256(m1, _mm256_cmpeq_epi32(x, b));

    let f1 = _mm256_testz_si256(m1, m1);

    let x1 = _mm256_castsi256_si128(x);
    let mut x2;
    let mut m2;

    x2 = _mm256_extracti128_si256(x, 1);
    m2 = _mm_cmpeq_epi32(x1, x2);

    x2 = _mm_shuffle_epi32::<R>(x2);
    m2 = _mm_or_si128(m2, _mm_cmpeq_epi32(x1, x2));

    x2 = _mm_shuffle_epi32::<R>(x2);
    m2 = _mm_or_si128(m2, _mm_cmpeq_epi32(x1, x2));

    x2 = _mm_shuffle_epi32::<R>(x2);
    m2 = _mm_or_si128(m2, _mm_cmpeq_epi32(x1, x2));

    let f2 = _mm_testz_si128(m2, m2);

    f1 != 0 && f2 != 0
}
