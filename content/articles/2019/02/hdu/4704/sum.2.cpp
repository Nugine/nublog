#include <cstdio>
using namespace std;

typedef unsigned long long ull;

const ull M = 1e9 + 7;

const int table[10] = {0x1,  0x2,  0x4,  0x8,   0x10,
                       0x20, 0x40, 0x80, 0x100, 0x200};

const ull magic = 5e8 + 4;

inline ull qpow10(ull b) {
    register ull r;
    b = b * b % M;
    r = b;
    b = b * b % M;
    b = b * b % M;
    r = r * b % M;
    return r;
}

int read(ull &res) {
    register ull r = 1;
    register char c;
    while ((c = getchar()) != '\n') {
        if (c == EOF) {
            return 0;
        }
        r = qpow10(r) * table[(int)c ^ '0'] % M;
    }
    res = r;
    return 1;
}

int main() {
    ull ans;
    while (read(ans)) {
        ans = ans * magic % M;
        printf("%lld\n", ans);
    }
    return 0;
}