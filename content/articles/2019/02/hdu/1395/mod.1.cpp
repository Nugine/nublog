#include <cstdio>
using namespace std;

typedef unsigned long long ull;

ull find_x(const ull n) {
    ull x = 1;
    ull r = 2 % n;
    while (r != 1) {
        ++x;
        // printf("%llu, %llu\n", x, r);
        r = (r << 1) % n;
    }
    return x;
}

int main() {
    ull n;
    while (scanf("%llu", &n) > 0) {
        if (n == 1 || (n & 1) == 0) {
            printf("2^? mod %llu = 1\n", n);
        } else {
            printf("2^%llu mod %llu = 1\n", find_x(n), n);
        }
    }
    return 0;
}