#include <iostream>
using namespace std;

int main() {
    double s, a, b, ans;

    cout.setf(ios::fixed);
    cout.precision(6);

    cin >> s >> a >> b;
    ans = (3 * b + a) / (b + 3 * a) * s / b;
    cout << ans << endl;

    return 0;
}