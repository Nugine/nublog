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
}
