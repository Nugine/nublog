#include <iostream>
using namespace std;

#define rep(i, s, e) for (i = s; i < e; ++i)
const int N = 1000 + 2;

struct Set {
    Set *root;
    int num;
    char value;
} maze[N][N];

Set *root(Set *p) {
    if (p->root == p)
        return p;
    Set *r = p->root;
    if (r->root == r)
        return r;
    return p->root = root(r);
}

void merge(Set *r1, Set *r2) {
    if (r1 == r2)
        return;
    r2->root = r1;
    r1->num += r2->num;
}

int n;

void init() {
    int i, j;
    Set *p;

    rep(i, 0, n) {
        rep(j, 0, n) {
            p = &maze[i][j];
            cin >> p->value;
            p->root = p;
            p->num = 1;
        }
    }

    Set *pu, *pl;

    rep(i, 1, n) {
        rep(j, 0, n) {
            pu = &maze[i - 1][j];
            p = &maze[i][j];
            if (pu->value ^ p->value) {
                merge(root(pu), root(p));
            }
        }
    }

    rep(i, 0, n) {
        rep(j, 1, n) {
            pl = &maze[i][j - 1];
            p = &maze[i][j];
            if (pl->value ^ p->value) {
                merge(root(pl), root(p));
            }
        }
    }
}

int main() {
    // ios::sync_with_stdio(false);
    int m, i, j;
    cin >> n >> m;

    init();

    // rep(i, 0, n) {
    //     rep(j, 0, n) { cout << maze[i][j].num << ' '; }
    //     cout << endl;
    // }

    while (m--) {
        cin >> i >> j;
        cout << root(&maze[i - 1][j - 1])->num << endl;
    }
    return 0;
}