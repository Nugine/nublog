#include <iostream>
using namespace std;

template <typename T> T gcd(T a, T b) {
    T t = a % b;
    while (t) {
        a = b;
        b = t;
        t = a % b;
    }
    return b;
}

int main() {
    long long a, b;
    while (cin >> a >> b) {
        cout << gcd(a, b) << endl;
    }
    return 0;
}