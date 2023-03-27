use std::fs::File;
use std::io::{self, BufRead, BufReader, Read};
use std::time::{Duration, Instant};

fn time<R>(f: impl FnOnce() -> R) -> (R, Duration) {
    let t0 = Instant::now();
    let ans = f();
    (ans, t0.elapsed())
}

fn test_bytes(reader: &mut impl BufRead) -> io::Result<u8> {
    let mut ans = 0;
    for byte in reader.bytes() {
        ans ^= byte?;
    }
    Ok(ans)
}

fn test_block(reader: &mut impl BufRead) -> io::Result<u8> {
    let mut ans = 0;
    loop {
        match reader.fill_buf()? {
            [] => break,
            buf => {
                buf.iter().for_each(|&byte| ans ^= byte);
                let amt = buf.len();
                reader.consume(amt);
            }
        }
    }
    Ok(ans)
}

fn main() -> io::Result<()> {
    let bytes_ret = {
        let mut reader = BufReader::new(File::open("Cargo.toml")?);
        time(|| test_bytes(&mut reader))
    };

    let block_ret = {
        let mut reader = BufReader::new(File::open("Cargo.toml")?);
        time(|| test_block(&mut reader))
    };

    let _ = dbg!(bytes_ret);
    let _ = dbg!(block_ret);

    Ok(())
}

#[test]
fn test(){
    dbg!(std::mem::size_of::<io::Result<u16>>());
    dbg!(std::mem::size_of::<anyhow::Result<()>>());

}