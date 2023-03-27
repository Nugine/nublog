---
postDate: "2021-11-07"
---

# 校验十六进制字符的奇技淫巧

十六进制字符指的是 `0123456789abcdefABCDEF` 这 22 个 ASCII 字符。很多协议会用到十六进制字符编码，因此加速校验是很有意义的。

以下直接贴代码，相信大家都能看懂原理。

```rust
pub fn is_hex_v1(c: u8) -> bool {
    matches!(c, b'0'..=b'9'|b'a'..=b'f'|b'A'..=b'F')
}

pub fn is_hex_v2(c: u8) -> bool {
    let x1 = c.wrapping_sub(0x30);
    let x2 = (x1 & 0xdf).wrapping_sub(0x11);
    x1 < 10 || x2 < 6
}

#[test]
fn test() {
    for c in 0..=255_u8 {
        assert_eq!(is_hex_v1(c), is_hex_v2(c));
    }
}
```

第二版本仅用了 6 次运算，实际生成的汇编代码能证明第二版本的指令更少且消除了分支。

```asm
playground::is_hex_v1: # @playground::is_hex_v1
# %bb.0:
                                        # kill: def $edi killed $edi def $rdi
	leal	-48(%rdi), %ecx
	movb	$1, %al
	cmpb	$10, %cl
	jb	.LBB0_4
# %bb.1:
	addb	$-65, %dil
	cmpb	$37, %dil
	ja	.LBB0_2
# %bb.3:
	movzbl	%dil, %eax
	movabsq	$270582939711, %rcx             # imm = 0x3F0000003F
	btq	%rax, %rcx
	setb	%al

.LBB0_4:
                                        # kill: def $al killed $al killed $eax
	retq

.LBB0_2:
	xorl	%eax, %eax
                                        # kill: def $al killed $al killed $eax
	retq
                                        # -- End function

playground::is_hex_v2: # @playground::is_hex_v2
# %bb.0:
	addb	$-48, %dil
	movl	%edi, %eax
	andb	$-33, %al
	addb	$-17, %al
	cmpb	$10, %dil
	setb	%cl
	cmpb	$6, %al
	setb	%al
	orb	%cl, %al
	retq
                                        # -- End function
```

在校验十六进制字符串时，可以用 SSE 或 AVX 实现这个算法，预计会有明显的性能提升。
