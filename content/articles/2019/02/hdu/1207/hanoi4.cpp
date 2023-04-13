#include <cmath>
#include <cstdio>
#include <vector>
using namespace std;
typedef long long ll;
#define regint register int
#define regll register ll

ll qpow2(ll p) {
    regll b = 2, r = 1;
    while (p) {
        if (p & 1) {
            r *= b;
        }
        b *= b;
        p >>= 1;
    }
    return r;
}

vector<ll> v;

ll solve(int n) {
    int i = v.size() - 1;

    while (i < n) {
        v.push_back(v[i] + qpow2(ll((sqrt(8 * i + 1) - 1) / 2)));
        ++i;
    }
    return v[n];
}

int main() {
    v.push_back(0);
    v.push_back(1);

    int n;
    while (scanf("%d", &n) > 0) {
        printf("%lld\n", solve(n));
    }
    return 0;
}