export * from "./article";

export function cvtTime(time: Date): string {
    const year = time.getFullYear().toString();
    const month = (time.getMonth() + 1).toString().padStart(2, "0");
    const day = time.getDate();
    return `${year}-${month}-${day}`;
}
