export function cmp<T>(lhs: T, rhs: T): number {
    return lhs !== rhs ? (lhs < rhs ? -1 : 1) : 0;
}

export function reverse<T>(cmp: (lhs: T, rhs: T) => number): (lhs: T, rhs: T) => number {
    return (lhs, rhs) => -cmp(lhs, rhs);
}
