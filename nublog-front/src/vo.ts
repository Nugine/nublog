import * as dto from "./api/dto";

export type Article = dto.QueryArticleRes;
export type User = dto.QueryUserRes;

export function fmtTime(time: Date, withDetail?: boolean): string {
    const year = time.getFullYear().toString();
    const month = (time.getMonth() + 1).toString().padStart(2, "0");
    const day = time.getDate().toString().padStart(2, "0");

    if (!withDetail) {
        return `${year}-${month}-${day}`;
    } else {
        const hours = time.getHours().toString().padStart(2, "0");
        const minutes = time.getMinutes().toString().padStart(2, "0");
        const seconds = time.getSeconds().toString().padStart(2, "0");

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
}

export type LoadingState = "initial" | "loading" | "success" | "error";

export function getSessionId(): string | null {
    return localStorage.getItem("x-session-id");
}

export function removeSessionId(): string | null {
    const ans = localStorage.getItem("x-session-id");
    localStorage.removeItem("x-session-id");
    return ans;
}

export function setSessionId(sessionId: string): void {
    localStorage.setItem("x-session-id", sessionId);
}

export enum RoleCode {
    ADMIN = 0,
    READER = 1
}
