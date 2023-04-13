#include <cstdio>
using namespace std;

typedef unsigned long long ull;

const ull M = 1e9 + 7;
const ull Mm1 = 1e9 + 6;

// k = (N-1) % (M-1)
ull get_k(ull &r) {
    register ull k = 0;
    register char c;
    while ((c = getchar()) != '\n') {
        if (c == EOF) {
            return 0;
        }
        k = k * 10 + (c ^ '0');
        k %= Mm1;
    }
    r = (k + Mm1 - 1) % Mm1;
    return 1;
}

// ans = pow(2, k) % M
ull qpow(ull k) {
    register ull r = 1;
    register ull b = 2;
    while (k) {
        if (k & 1) {
            r *= b;
            r %= M;
        }
        b *= b;
        b %= M;
        k >>= 1;
    }
    return r;
}

int main() {
    ull k;
    while (get_k(k)) {
        printf("%lld\n", qpow(k));
    }
    return 0;
}