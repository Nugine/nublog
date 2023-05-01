const A: &str = concat!(
    "\n",
"                                                        \u{1b}[31;1ma\u{1b}[0mbcdefg\u{1b}[32;1mh\u{1b}[0m    <<0\n",
"                                                 abcdef\u{1b}[32;1mg\u{1b}[0m\u{1b}[31;1mh\u{1b}[0m      |    <<7\n",
"                                          abcde\u{1b}[32;1mf\u{1b}[0mgh     |       |    <<14\n",
"                                   abcd\u{1b}[32;1me\u{1b}[0mfgh    |       |       |    <<21\n",
"                            abc\u{1b}[32;1md\u{1b}[0mefgh   |       |       |       |    <<28\n",
"                     ab\u{1b}[32;1mc\u{1b}[0mdefgh  |       |       |       |       |    <<35\n",
"              a\u{1b}[32;1mb\u{1b}[0mcdefgh |       |       |       |       |       |    <<42\n",
"       \u{1b}[32;1ma\u{1b}[0mbcdefgh|       |       |       |       |       |       |    <<49\n",
"       |       |       |       |       |       |       |       |                        \n",
"7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m\n",
);

const B: &str = concat!(
    "\n",
"                                                        abcdefg\u{1b}[32;1m0\u{1b}[0m    <<0\n",
"                                                 abcdef\u{1b}[32;1mg\u{1b}[0m0      |    <<7\n",
"                                          abcde\u{1b}[32;1mf\u{1b}[0mg0     |       |    <<14\n",
"                                   abcd\u{1b}[32;1me\u{1b}[0mfg0    |       |       |    <<21\n",
"                            abc\u{1b}[32;1md\u{1b}[0mefg0   |       |       |       |    <<28\n",
"                     ab\u{1b}[32;1mc\u{1b}[0mdefg0  |       |       |       |       |    <<35\n",
"              a\u{1b}[32;1mb\u{1b}[0mcdefg0 |       |       |       |       |       |    <<42\n",
"       \u{1b}[32;1ma\u{1b}[0mbcdefg0|       |       |       |       |       |       |    <<49\n",
"       |       |       |       |       |       |       |       |                        \n",
"7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m\n",
);


const C: &str = concat!(
    "\n",
"                                                               \u{1b}[32;1ma\u{1b}[0mbcdefgh >>7\n",
"                                                      a\u{1b}[32;1mb\u{1b}[0mcdefgh |        <<2\n",
"                                             ab\u{1b}[32;1mc\u{1b}[0mdefgh  |       |        <<11\n",
"                                    abc\u{1b}[32;1md\u{1b}[0mefgh   |       |       |        <<20\n",
"                           abcd\u{1b}[32;1me\u{1b}[0mfgh    |       |       |       |        <<29\n",
"                  abcde\u{1b}[32;1mf\u{1b}[0mgh     |       |       |       |       |        <<38\n",
"         abcdef\u{1b}[32;1mg\u{1b}[0mh      |       |       |       |       |       |        <<47\n",
"abcdefg\u{1b}[32;1mh\u{1b}[0m       |       |       |       |       |       |       |        <<56\n",
"       |       |       |       |       |       |       |       |\n",
"7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m7654321\u{1b}[32;1m0\u{1b}[0m\n",
);

#[test]
fn test() {
    println!("{A}");
    println!("{B}");
    println!("{C}");
}
