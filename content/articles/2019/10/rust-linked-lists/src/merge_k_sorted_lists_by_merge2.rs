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

pub struct Solution;

impl Solution {
    pub fn merge2(
        lists: &mut Vec<Option<Box<ListNode>>>,
        s: usize,
        e: usize,
    ) -> Option<Box<ListNode>> {
        if s == e {
            return lists[s].take();
        } else {
            let mid = (s + e) / 2;
            let mut lhs = Solution::merge2(lists, s, mid);
            let mut rhs = Solution::merge2(lists, mid + 1, e);
            let mut head = Box::new(ListNode { val: 0, next: None });
            let mut tail = &mut head;

            while let (Some(lhs_head), Some(rhs_head)) = (lhs.as_ref(), rhs.as_ref()) {
                if lhs_head.val <= rhs_head.val {
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
    }

    pub fn merge_k_lists(mut lists: Vec<Option<Box<ListNode>>>) -> Option<Box<ListNode>> {
        if lists.is_empty() {
            None
        } else {
            let (s, e) = (0, lists.len() - 1);
            Solution::merge2(&mut lists, s, e)
        }
    }
}
