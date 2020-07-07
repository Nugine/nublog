export function toReadonly<T>(t: T): Readonly<T> {
    return Object.freeze(t);
}
