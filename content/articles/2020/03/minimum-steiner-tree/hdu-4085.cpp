// https://vjudge.net/problem/HDU-4085

#include <bits/stdc++.h>
using namespace std;
#define rng(i, s, e) for ((i) = (s); (i) < (e); ++(i))
#define asc(i, s, e) for ((i) = (s); (i) <= (e); ++(i))
#define rd(x) scanf("%d", &(x))
#define rd3(x, y, z) scanf("%d %d %d", &(x), &(y), &(z))
#define reset(x, c) (memset((x), (c), sizeof((x))))
inline void min_assign(int &a, int b) { a = min(a, b); }
typedef pair<int, int> pii;

const int MAX_N = 50 + 14;
const int MAX_M = 1000 + 3;
const int MAX_K = 10 + 2;
const int INF = 0x3f3f3f3f;

int n, m, h;
vector<pii> graph[MAX_N]; // clear, [(v,w)]
int s[MAX_K];             // 1-based

int k;   // h*2
int lim; // 1<<k

int weight[MAX_N][1 << MAX_K]; // 0x3f
int h_weight[1 << MAX_K];      // 0x3f

void init() {
    int i;
    int u, v, w;

    rd3(n, m, h);

    asc(i, 1, n) { graph[i].clear(); }
    k = h * 2;
    lim = 1 << k;
    reset(weight, 0x3f);
    reset(h_weight, 0x3f);

    asc(i, 1, m) {
        rd3(u, v, w);
        graph[u].push_back({v, w});
        graph[v].push_back({u, w});
    }

    asc(i, 1, h) { s[i] = i; }
    asc(i, 1, h) { s[i + h] = n - h + i; }
}

void dijkstra(int x) {
    typedef greater<pii> greater_pii;
    static priority_queue<pii, vector<pii>, greater_pii> q; // [(dis, i)]

    static bool vis[MAX_N];
    reset(vis, 0);

    int i;
    asc(i, 1, n) {
        int d = weight[i][x];
        if (d < INF) {
            q.push(pii(d, i));
        }
    }

    while (!q.empty()) {
        int i = q.top().second;
        q.pop();
        if (vis[i]) {
            continue;
        }
        vis[i] = true;
        for (auto &pr : graph[i]) {
            int j = pr.first;
            int w = pr.second;
            int &pd = weight[j][x];
            int nd = weight[i][x] + w;
            if (pd > nd) {
                pd = nd;
                q.push(pii(nd, j));
            }
        }
    }
}

void steiner_tree() {
    int i, x;
    asc(i, 1, k) { weight[s[i]][1 << (i - 1)] = 0; }

    rng(x, 1, lim) {
        asc(i, 1, n) {
            for (int x1 = x & (x - 1); x1 != 0; x1 = x & (x1 - 1)) {
                min_assign(weight[i][x], weight[i][x1] + weight[i][x ^ x1]);
            }
        }
        dijkstra(x);
    }
}

inline bool check(int x) {
    int v1 = 0, v2 = 0;
    int i;
    asc(i, 1, h) {
        v1 += (x & 1);
        x >>= 1;
    }
    asc(i, 1, h) {
        v2 += (x & 1);
        x >>= 1;
    }
    return v1 == v2;
}

void steiner_forest() {
    int i, x;
    rng(x, 1, lim) {
        asc(i, 1, n) { min_assign(h_weight[x], weight[i][x]); }
    }
    rng(x, 1, lim) {
        if (check(x)) {
            for (int x1 = x & (x - 1); x1 != 0; x1 = x & (x1 - 1)) {
                if (check(x1)) {
                    min_assign(h_weight[x], h_weight[x1] + h_weight[x ^ x1]);
                }
            }
        }
    }
}

int main() {
    int T;
    rd(T);

    while (T--) {
        init();
        steiner_tree();
        steiner_forest();
        int ans = h_weight[lim - 1];
        if (ans >= INF) {
            printf("No solution\n");
        } else {
            printf("%d\n", ans);
        }
    }
}