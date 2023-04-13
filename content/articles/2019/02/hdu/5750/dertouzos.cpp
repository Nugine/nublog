#include <cstdio>
using namespace std;

const int MAXN = 114514;

char not_prime[MAXN];
int primes[MAXN];
int tot = 0;

void init_primes() {
    register int i, j, t;

    for (i = 2; i < MAXN; ++i) {
        if (!not_prime[i]) {
            primes[tot++] = i;
        }

        for (j = 0; j < tot; ++j) {
            t = i * primes[j];
            if (t > MAXN)
                break;

            not_prime[t] = 1;

            if (i % primes[j] == 0)
                break;
        }
    }
}

int get_ans(const int n, const int d) {
    register int i, p, r = 0;
    for (i = 0; i < tot; ++i) {
        p = primes[i];

        if (p * d < n) {
            ++r;
        } else {
            break;
        }

        if (d % p == 0)
            break;
    }

    return r;
}

int main() {
    init_primes();
    int T;
    int n, d;

    scanf("%d", &T);
    while (T--) {
        scanf("%d %d", &n, &d);
        printf("%d\n", get_ans(n, d));
    }
    return 0;
}