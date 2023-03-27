use std::io::{self, Read};
use std::mem;

fn read_and_swap(reader: &mut impl Read, buf: &mut [u8]) -> io::Result<()> {
    let nread: usize = reader.read(buf)?;
    if nread > 1 {
        unsafe {
            let head = buf.as_mut_ptr();
            let tail = buf.as_mut_ptr().add(nread - 1);
            mem::swap(&mut *head, &mut *tail);
        }
    }
    Ok(())
}

pub struct IncorrectReader;

impl Read for IncorrectReader {
    fn read(&mut self, buf: &mut [u8]) -> io::Result<usize> {
        Ok(buf.len() + 4)
    }
}

#[test]
fn test() {
    let mut reader = IncorrectReader;
    let mut buf: [u8; 32] = [0u8; 32];
    read_and_swap(&mut reader, &mut buf).unwrap()
}
