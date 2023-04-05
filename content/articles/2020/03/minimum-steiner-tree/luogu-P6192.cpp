#include <cstdio>
#include <cstring>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;
#define reset(x, c) (memset((x), (c), sizeof(x)))
#define asc(i, s, e) for ((i) = (s); (i) <= (e); ++(i))
#define rd3(x, y, z) scanf("%d %d %d", &(x), &(y), &(z))
#define rd(x) scanf("%d", &(x))
#define pdln(x) printf("%d\n", (x))
inline void min_assign(int &a, int b) { a = min(a, b); }
typedef pair<int, int> pii;

const int MAX_N = 100 + 3;
const int MAX_M = 500 + 3;
const int MAX_K = 10 + 2;
const int INF = 0x3f3f3f3f;

int n, m, k;
vector<pii> graph[MAX_N]; // [(v, w)]
int s[MAX_K];

int weight[MAX_N][1 << (MAX_K)];

typedef greater<pii> greater_pii;
priority_queue<pii, vector<pii>, greater_pii> q; // [(dis, i)]

void dijkstra(int x) {
    static bool vis[MAX_N];
    reset(vis, 0);

    int i;
    asc(i, 1, n) {
        int d = weight[i][x];
        if (d != INF) {
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

        for (vector<pii>::iterator iter = graph[i].begin();
             iter != graph[i].end(); ++iter) {
            int j = iter->first;
            int w = iter->second;
            int &pd = weight[j][x];
            int nd = weight[i][x] + w;
            if (pd > nd) {
                pd = nd;
                q.push(pii(nd, j));
            }
        }
    }
}

int main() {
    { reset(weight, 0x3f); }

    {
        rd3(n, m, k);
        int i, u, v, w;
        asc(i, 1, m) {
            rd3(u, v, w);
            graph[u].push_back({v, w});
            graph[v].push_back({u, w});
        }
        asc(i, 1, k) { rd(s[i]); }
    }

    {
        int i, x;

        asc(i, 1, k) { weight[s[i]][1 << (i - 1)] = 0; }

        int lim = 1 << k;
        asc(x, 1, lim) {
            asc(i, 1, n) {
                for (int x1 = x & (x - 1); x1 != 0; x1 = x & (x1 - 1)) {
                    int x2 = x ^ x1;
                    min_assign(weight[i][x], weight[i][x1] + weight[i][x2]);
                }
            }

            dijkstra(x);
        }
    }

    {
        int ans = weight[s[1]][(1 << k) - 1];
        pdln(ans);
    }
}