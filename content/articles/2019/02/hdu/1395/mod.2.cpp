#include <cmath>
#include <cstdio>
using namespace std;

typedef unsigned long long ull;

ull phi(ull n) {
    ull lim = sqrt(n) + 1;
    ull r = n;
    for (ull i = 2; i < lim; ++i) {
        if (n % i == 0) {
            r = r / i * (i - 1);
            while (n % i == 0) {
                n /= i;
            }
        }
    }
    if (n > 1) {
        r = r / n * (n - 1);
    }
    return r;
}

ull qpow2(ull p, const ull mod) {
    ull r = 1;
    ull b = 2;
    while (p) {
        if (p & 1) {
            r = r * b % mod;
        }
        b = b * b % mod;
        p >>= 1;
    }
    return r;
}

ull get_ans(const ull n, const ull phi_n) {
    ull i;
    for (i = 1; i <= phi_n; ++i) {
        if (phi_n % i == 0) {
            if (qpow2(i, n) == 1) {
                return i;
            }
        }
    }
    return 0;
}

int main() {
    ull n;
    while (scanf("%llu", &n) > 0) {
        if (n == 1 || (n & 1) == 0) {
            printf("2^? mod %llu = 1\n", n);
        } else {
            printf("2^%llu mod %llu = 1\n", get_ans(n, phi(n)), n);
        }
    }
}