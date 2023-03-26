export function stripSuffix(s: string, suffix: string): string | null {
    if (s.endsWith(suffix)) {
        return s.substring(0, s.length - suffix.length);
    }
    return null;
}

export function hasDuplicate(arr: string[]): boolean {
    return new Set(arr).size !== arr.length;
}

export async function mapJoinAll<T, U>(arr: T[], f: (val: T) => Promise<U>): Promise<U[]> {
    return await Promise.all(arr.map(f));
}
