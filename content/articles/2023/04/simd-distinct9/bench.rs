use criterion::{black_box, criterion_group, criterion_main, Criterion};
use rs::{distinct9_avx2, distinct9_naive};

pub fn bench_distinct9(c: &mut Criterion) {
    assert!(cfg!(target_feature = "avx2"));

    let mut group = c.benchmark_group("distinct9");

    let input = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    group.bench_function("naive", |b| {
        b.iter(|| assert!(black_box(distinct9_naive(black_box(&input)))))
    });

    group.bench_function("avx2", |b| {
        b.iter(|| assert!(black_box(unsafe { distinct9_avx2(black_box(&input)) })))
    });
}

criterion_group!(benches, bench_distinct9);
criterion_main!(benches);
