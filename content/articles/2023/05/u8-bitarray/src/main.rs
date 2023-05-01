pub fn bitarray_naive(x: u8) -> [u8; 8] {
    let a = x >> 7;
    let b = (x >> 6) & 1;
    let c = (x >> 5) & 1;
    let d = (x >> 4) & 1;
    let e = (x >> 3) & 1;
    let f = (x >> 2) & 1;
    let g = (x >> 1) & 1;
    let h = x & 1;
    [a, b, c, d, e, f, g, h]
}

fn u64(x: u8) -> u64 {
    x as u64
}

const M: u64 = 0x0101010101010101;

// abcdefgh
pub fn bitarray_ge(x: u8) -> [u8; 8] {
    let m: u64 = 0x0002040810204081;
    let y = ((u64(x & 0xfe) * m) | u64(x)) & M;
    y.to_ne_bytes()
}

// hgfedcba
pub fn bitarray_le(x: u8) -> [u8; 8] {
    let m: u64 = 0x0100804020100804;
    let y = ((u64(x) * m) | u64(x >> 7)) & M;
    y.to_ne_bytes()
}

pub fn bitarray(x: u8) -> [u8; 8] {
    #[cfg(target_endian = "big")]
    return bitarray_ge(x);

    #[cfg(target_endian = "little")]
    return bitarray_le(x);
}

fn main() {
    for x in 0..=255 {
        let mut ge = bitarray_ge(x);
        let le = bitarray_le(x);
        let naive = bitarray_naive(x);

        ge.reverse();

        assert_eq!(ge, naive);
        assert_eq!(le, naive);
        assert_eq!(bitarray(x), naive);
    }
}
