#include <cstdio>
using namespace std;

typedef char *BInt;

BInt iadd(BInt a, const BInt b, const int len) {
    register int i = 0;
    for (i = 0; i < len; ++i) {
        a[i] += b[i];
    }

    register int carry = 0;
    for (i = 0; i < len; ++i) {
        a[i] += carry;
        carry = a[i] / 10;
        a[i] -= carry * 10;
    }
    return a;
}

BInt isub(BInt a, const BInt b, const int len) {
    register int i;
    for (i = 0; i < len; ++i) {
        a[i] -= b[i];
    }

    register int carry = 0;
    for (i = 0; i < len; ++i) {
        a[i] += carry;
        if (a[i] < 0) {
            carry = -1;
            a[i] += 10;
        } else {
            carry = 0;
        }
    }
    return a;
}

BInt imul(BInt a, const int b, const int len) {
    register int i;
    for (i = 0; i < len; ++i) {
        a[i] *= b;
    }

    register int carry = 0;
    for (i = 0; i < len; ++i) {
        a[i] += carry;
        carry = a[i] / 10;
        a[i] -= carry * 10;
    }
    return a;
}

void repr(char *dst, const BInt src, const int len) {
    register int i = len - 1;
    while (!src[i]) {
        --i;
    }

    register int j;
    for (j = 0; i >= 0; --i, ++j) {
        dst[j] = src[i] ^ '0';
    }
    dst[j] = '\0';
}

void _BInt_print(const BInt a, const int len) {
    register int i;
    for (i = len - 1; i >= 0; --i) {
        putchar(a[i] ^ '0');
    }
    putchar('\n');
}

typedef char *Stack;
#define PUSH(top, x) (++top, *top = (x))
#define POP(top, x) ((x) = *top, top--)
#define IPOP(top) (--top)

void _Stack_print(const Stack s, const Stack full) {
    register Stack p = s + 1;
    while (p != full) {
        putchar(*p ^ '0');
        putchar(' ');
        ++p;
    }
    putchar('\n');
}

void init_table(BInt table[10], const int len, const int n) {
    register int i;
    for (i = 0; i < 10; ++i) {
        table[i][0] = i;
    }

    register int j;
    for (i = 2; i < 10; ++i) {
        j = n;
        while (--j) {
            imul(table[i], i, len);
        }
    }
}

void _table_print(const BInt table[10], const int len) {
    for (register int i = 0; i < 10; ++i) {
        _BInt_print(table[i], len);
    }
}

void _cnt_print(const int cnt[10]) {
    for (register int i = 0; i < 10; ++i) {
        printf("%d ", cnt[i]);
    }
    putchar('\n');
}

int check(BInt a, const int len, const int cnt[10]) {
    int cnt2[10] = {};
    register int i = len - 1;
    while (!a[i]) {
        --i;
    }

    for (; i >= 0; --i) {
        ++cnt2[(int)a[i]];
    }

    for (i = 0; i < 10; ++i) {
        if (cnt[i] != cnt2[i]) {
            return 0;
        }
    }

    return 1;
}

int narcissus(const int n, char *results[]) {
    const int np1 = n + 1;
    const int nm1 = n - 1;
    register int i, flag;
    int resLen = 0;

    Stack stack = new char[np1];
    Stack full = stack + n;
    Stack top = stack;
    *top = 1;

    BInt table[10];
    for (i = 0; i < 10; ++i) {
        table[i] = new char[np1]();
    }
    init_table(table, np1, n);

    BInt sum = new char[np1]();

    int cnt[10] = {};

#define ADD(i) iadd(sum, table[i], np1);
#define SUB(i) isub(sum, table[i], np1);

    flag = 1;
    PUSH(top, 9);
    ADD(9);
    cnt[9] = 1;

    while (top != stack) {
        if (top == full && flag) {
            if (!sum[n] && !sum[nm1]) {
                break;
            }

            while (*top) {
                // _Stack_print(stack, full);
                // _cnt_print(cnt);
                if (check(sum, np1, cnt)) {
                    repr(results[resLen++], sum, np1);
                    // _BInt_print(sum, np1);
                }

                i = *top;
                --cnt[i];
                SUB(i);

                i = --*top;
                ++cnt[i];
                ADD(i)
            }

            // _Stack_print(stack, full);
            // _cnt_print(cnt);
            if (check(sum, np1, cnt)) {
                repr(results[resLen++], sum, np1);
                // _BInt_print(sum, np1);
            }

            while (!*top) {
                --cnt[0];
                IPOP(top);
            }
            flag = 0;
        }

        if (flag) {
            i = *top;
            PUSH(top, i);
            ++cnt[i];
            ADD(i);
        } else {
            i = *top;
            --cnt[i];
            SUB(i);

            i = --*top;
            ++cnt[i];
            ADD(i);

            flag = 1;
        }

        flag = sum[n] == 0;
    }

    delete[] sum;
    for (i = 0; i < 10; ++i) {
        delete[] table[i];
    }
    delete[] stack;

    return resLen;

#undef SUB
#undef ADD
}

int main() {
    int n;
    while (scanf("%d", &n) > 0) {
        register int i;
        char *results[20];
        for (i = 0; i < 20; ++i) {
            results[i] = new char[n + 1]();
        }

        int res = narcissus(n, results);
        for (i = res - 1; i >= 0; --i) {
            // for (i = 0; i < res; ++i) {
            printf("%s\n", results[i]);
        }
        printf("done\n");

        for (i = 0; i < 20; ++i) {
            delete[] results[i];
        }
    }
    return 0;
}