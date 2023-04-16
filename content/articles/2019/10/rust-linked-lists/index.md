---
postDate: "2019-10-01"
links:
    知乎: https://zhuanlan.zhihu.com/p/84953434
---

# Rust 链表！

本文将通过三道 leetcode 链表题目来介绍 Rust 中链表的玩法，加深对所有权和借用检查的理解。

## 链表定义

leetcode 给出的单链表定义

```rust
#[derive(PartialEq, Eq, Clone, Debug)]
pub struct ListNode {
    pub val: i32,
    pub next: Option<Box<ListNode>>,
}

impl ListNode {
    #[inline]
    fn new(val: i32) -> Self {
        ListNode { next: None, val }
    }
}
```

这种单链表结点带有它的后继的所有权。`node.clone()` 是深拷贝，`drop(node)` 是递归释放，`node1 == node2` 是深比较，都有可能爆栈。其实，用 unsafe 封装的结点才更符合实际需求。

## 反转链表

[206. 反转链表](https://leetcode-cn.com/problems/reverse-linked-list/)

```rust
pub fn reverse_list(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
    let mut lhs = head;
    let mut rhs = None;

    while let Some(mut node) = lhs {
        lhs = node.next.take();
        node.next = rhs;
        rhs = Some(node);
    }

    rhs
}
```

反转链表，无非是三步走： 把原链表的头结点拿下来，把新链表接上去，跟踪新的头结点。

第 1 行和第 2 行： lhs 绑定了原链表的头，背后串了一堆结点，rhs 绑定了 None，是一个空链表。

第 4 行：首先匹配 lhs，如果有结点，把它拿出来。此时 lhs 的内容被移动，lhs 绑定失效。

第 5 行：`lhs = node.next.take();` 在上一行取得了一个头结点，把它背后的一串结点取下来 (`take()`)，还给 lhs，lhs 绑定重新生效。

第 6 行：`node.next = rhs;` 把新链表接到头结点的后面，rhs 移动给头结点，rhs 绑定失效。

第 7 行：`rhs = Some(node);` 此时的头结点就是新链表，rhs 绑定到头结点，重新生效。

一次循环，将原链表的头结点移动给新链表，当原链表为空时，说明反转完成，最后返回 rhs.

## 链表的中间结点

[876. 链表的中间结点](https://leetcode-cn.com/problems/middle-of-the-linked-list/)

```rust
pub fn middle_node(head: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
    let mut head = head;
    let mut slow = head.as_ref();
    let mut fast = head.as_ref();

    loop {
        if let Some(node) = fast {
            fast = node.next.as_ref();
        } else {
            break;
        }
        if let Some(node) = fast {
            fast = node.next.as_ref();
        } else {
            break;
        }
        if let Some(node) = slow {
            slow = node.next.as_ref();
        } else {
            break;
        }
    }

    let mid_addr = if let Some(node) = slow {
        node.as_ref() as *const ListNode
    } else {
        return None;
    };

    while let Some(node) = head.as_ref() {
        let addr = node.as_ref() as *const ListNode;
        if addr != mid_addr {
            head = head.unwrap().next;
        } else {
            break;
        }
    }

    head
}
```

快慢指针法，快指针走两步，慢指针走一步，慢指针停下来的地方就是中间结点。

然而在 Rust 中，这题的语义有所不同。函数接收一个单链表，返回一个单链表，实际上是把原链表从中间截断，释放前一半，返回后一半。其他语言可以不管释放，随便泄露，或者交给 GC 处理。

`node.next.as_ref()` 取后继结点的只读指针，这个指针可为空，它的类型是 `Option<&Box<ListNode>>`.

当快慢指针在链表上移动时，整个链表处于只读锁定状态。Rust 编译器通过生命周期追踪到：快慢指针的有效性来源于 head 不可变。如果修改 head，指针很可能失效，违反了内存安全。

所以我们只能先完成中间结点的定位，再释放前一半链表。在函数运行期间，中间结点的内存地址是不变的，可以用做标识。最后挨个检验结点地址，挨个释放，直到遇到中间结点，返回中间结点。

## 合并两个有序链表

[21. 合并两个有序链表](https://leetcode-cn.com/problems/merge-two-sorted-lists/)

```rust
pub fn merge_two_lists(
        l1: Option<Box<ListNode>>,
        l2: Option<Box<ListNode>>,
) -> Option<Box<ListNode>> {
    let (mut lhs, mut rhs) = (l1, l2);
    let mut head = Box::new(ListNode::new(0));
    let mut tail = &mut head;

    while let (Some(lnode), Some(rnode)) = (lhs.as_ref(), rhs.as_ref()) {
        if lnode.val <= rnode.val {
            tail.next = lhs;
            tail = tail.next.as_mut().unwrap();
            lhs = tail.next.take();
        } else {
            tail.next = rhs;
            tail = tail.next.as_mut().unwrap();
            rhs = tail.next.take();
        }
    }

    tail.next = if lhs.is_some() { lhs } else { rhs };
    head.next
}
```

合并两个有序链表，当然是循环比较两个链表的头结点，追加到新链表的末尾。

我一开始以为无法用常数时间保持对新链表末尾结点的可变引用，但是由于 NLL 的存在，引用的生存期会及时结束，持续追踪尾结点而不产生冲突是有可能的。

在每次循环中，首先需要比较两个头结点，这只需要不可变引用，因此同时匹配两个 `as_ref()`，即可拿到两个有效的头结点引用。

比较完成后，不可变引用生存期结束。将头结点追加到新链表，分为三步。

第一步：将较小的链表连接到新链表的尾结点，所有权移动，对这个链表的绑定失效。

第二步：将尾结点的可变引用指向它的后继 (`as_mut()`)，此时尾结点一定有后继，可以 `unwrap()`。

第三步：将链表从尾结点取下来 (`take()`)，把所有权还给较小的链表，绑定重新生效。

某一链表为空后，将另一个链表的剩余部分追加到尾结点。head 为占位结点，最后返回 head.next

## 总结

对于 leetcode 的单链表定义，`take()`, `as_ref()`, `as_mut()` 是最常用的工具。只要理解所有权和借用检查，Rust 链表并没有那么可怕。
