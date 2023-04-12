#include <cstdio>
using namespace std;

int exgcd(int a, int b, int &x, int &y) {
    int q = a / b, t = a % b;
    int x0 = 1, y0 = 0, x1 = 0, y1 = 1;
    while (t) {
        a = b;
        b = t;
        q = a / b;
        t = x0, x0 = x1, x1 = t - q * x1;
        t = y0, y0 = y1, y1 = t - q * y1;
        t = a % b;
    }
    x = x1, y = y1;
    return b;
}

int main() {
    int a, b, r, x, y;
    while (scanf("%d %d", &a, &b) > 0) {
        r = exgcd(a, b, x, y);
        printf("%d %% %d = %d, %d * %d + %d * %d = %d\n", a, b, r, x, a, y, b,
               r);
    }
    return 0;
}