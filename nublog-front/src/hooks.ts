import { useState, useCallback } from "react";

import * as vo from "./vo";

import { message } from "antd";

export type UseLoading = [vo.LoadingState, (f: () => Promise<void>, e: string | ((e: unknown) => void)) => Promise<void>];

export function useLoading(init?: vo.LoadingState): UseLoading {
    const [loading, setLoading] = useState(init ?? "initial");
    const withLoading: UseLoading[1] = useCallback(async (f, e) => {
        setLoading("loading");
        try {
            await f();
            setLoading("success");
        } catch (err) {
            setLoading("error");

            if (typeof e === "function") {
                e(err);
            } else if (typeof e === "string") {
                console.error(err);
                message.error(e);
            }
        }
    }, [setLoading]);

    return [loading, withLoading];
}

export type UseCsrData<T> = {
    loadingState: "initial" | "loading";
} | {
    loadingState: "success";
    data: T;
} | {
    loadingState: "error";
    error: unknown;
};

export type UseUser = [
    vo.User | null,
    (u: vo.User) => void,
    vo.LoadingState,
    (f: () => Promise<void>, e: string | ((e: unknown) => void)) => Promise<void>,
];

export function useUser(): UseUser {
    const u = useState<vo.User | null>(null);
    const l = useLoading();
    return [...u, ...l];
}