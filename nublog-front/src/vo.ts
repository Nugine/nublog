export type { DateTimeString, ArticleMeta, Tag, Article, Comment } from "./api/dto";
export type { User } from "./api/dto";

export function cvtTime(time: Date): string {
    const year = time.getFullYear().toString();
    const month = (time.getMonth() + 1).toString().padStart(2, "0");
    const day = time.getDate();
    return `${year}-${month}-${day}`;
}

export type LoadingState = "initial" | "loading" | "success" | "error";

export function fmtTimeDetail(time: Date): string {
    const year = time.getFullYear().toString();
    const month = (time.getMonth() + 1).toString().padStart(2, "0");
    const day = time.getDate();

    const hours = time.getHours().toString().padStart(2, "0");
    const minutes = time.getMinutes().toString().padStart(2, "0");
    const seconds = time.getSeconds().toString().padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function setSessionId(sessionId: string): void {
    localStorage.setItem("x-session-id", sessionId);
}

export function getSessionId(): string | null {
    return localStorage.getItem("x-session-id");
}