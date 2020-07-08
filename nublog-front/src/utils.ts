export function toReadonly<T>(t: T): Readonly<T> {
    return Object.freeze(t);
}

export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), ms);
    });
}
