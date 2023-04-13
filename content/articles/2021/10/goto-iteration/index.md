---
postDate: "2021-10-08"
links:
    知乎: https://zhuanlan.zhihu.com/p/419147996
---

# 用 goto 把递归函数变换为迭代函数

做题时发现一种有趣的通用变换方法，和生成器、无栈协程的结构相似。

[leetcode 145 二叉树的后序遍历](https://leetcode-cn.com/problems/binary-tree-postorder-traversal/)

递归转迭代的通用算法是用栈模拟函数调用，其中最大的难点就是判断代码应该执行到哪一步。

在递归函数中调用自身函数会把代码切割成两个状态，分别是调用前和调用后。我们把被切割出的状态标出来，发现二叉树遍历的递归函数有三个状态。

我们可以将**上次访问的子树指针**作为判断状态的依据。有了这个依据，就可以直接用 goto 跳了。

推广开来，对于一个递归函数，如果根据当前“栈帧”和“子函数”的返回值可以判断“函数”状态，那么这个递归函数能以相同的规则变换为迭代函数，除参数压栈外，**无需额外空间**。

```cpp
class Solution {
  public:
    vector<int> postorderTraversal(TreeNode *root) {
        vector<int> ans;
        if (root == nullptr) {
            return ans;
        }

        vector<TreeNode *> stk{root};
        TreeNode *popped = nullptr;

        while (!stk.empty()) {
            TreeNode *cur = stk.back();

            if (popped == nullptr) {
                goto state1;
            } else if (popped == cur->left) {
                goto state2;
            } else {
                goto state3;
            }

        state1:
            if (cur->left) {
                stk.push_back(cur->left);
                popped = nullptr;
                continue;
            }
        state2:
            if (cur->right) {
                stk.push_back(cur->right);
                popped = nullptr;
                continue;
            }
        state3:
            ans.push_back(cur->val);
            stk.pop_back();
            popped = cur;
        }

        return ans;
    }
};
```
