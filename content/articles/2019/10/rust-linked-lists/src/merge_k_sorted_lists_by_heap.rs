// Definition for singly-linked list.
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

struct Solution;

impl Solution {
    pub fn merge_k_lists(lists: Vec<Option<Box<ListNode>>>) -> Option<Box<ListNode>> {
        use std::cmp::Ordering;
        use std::cmp::Reverse;
        use std::collections::BinaryHeap;

        struct HeapItem {
            idx: usize,
            val: i32,
        };
        impl PartialEq for HeapItem {
            fn eq(&self, other: &Self) -> bool {
                self.val == other.val
            }
        }
        impl Eq for HeapItem {}
        impl PartialOrd for HeapItem {
            fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
                self.val.partial_cmp(&other.val)
            }
        }
        impl Ord for HeapItem {
            fn cmp(&self, other: &Self) -> Ordering {
                self.val.cmp(&other.val)
            }
        }

        let mut lists = lists;
        let mut heap = BinaryHeap::with_capacity(lists.len());
        let mut head: Option<Box<ListNode>> = None;

        for (idx, node) in lists.iter_mut().enumerate() {
            if let Some(node) = node {
                heap.push(Reverse(HeapItem { idx, val: node.val }));
            }
        }

        while let Some(Reverse(HeapItem { idx, .. })) = heap.pop() {
            let next = lists[idx].as_mut().unwrap().next.take();
            if let Some(ref node) = next {
                heap.push(Reverse(HeapItem { idx, val: node.val }));
            }
            let mut node = std::mem::replace(&mut lists[idx], next).unwrap();
            node.next = head;
            head = Some(node);
        }

        let mut ans = None;
        while let Some(mut nd) = head {
            head = nd.next.take();
            nd.next = ans;
            ans = Some(nd);
        }

        ans
    }
}
