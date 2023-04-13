#include <algorithm>
#include <cstdio>
using namespace std;
#define asc(i, s, e) for ((i) = (s); (i) <= (e); ++(i))
#define rd(x) scanf("%d", &(x));
#define pdln(x) printf("%d\n", (x));

int main() {
    int P;
    rd(P);

    int i, t;
    int o, e, ai;
    o = e = 0;

    asc(i, 1, P) {
        rd(ai);
        t = o;
        o = max(o, e + ai);
        e = max(e, t - ai);
    }
    pdln(max(o, e));
    return 0;
}