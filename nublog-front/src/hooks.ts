import { useState, useEffect, useCallback } from "react";

import { LoadingState } from "./vo";

import { message } from "antd";

export type UseLoading = [LoadingState, (f: () => Promise<void>, e: string | ((e: unknown) => void)) => Promise<void>];

export function useLoading(init?: LoadingState): UseLoading {
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

export function useCsrData<T>(f: () => Promise<T>): UseCsrData<T> {
    const [loadingState, withLoading] = useLoading();
    const [data, setData] = useState<T | undefined>();
    const [error, setError] = useState<unknown>();

    useEffect(() => {
        withLoading(async () => {
            const ans = await f();
            setData(ans);
        }, (err) => {
            setError(err);
        });
    }, [f, withLoading]);

    if (loadingState === "success" && data !== undefined) {
        return { loadingState, data };
    } else if (loadingState === "error") {
        return { loadingState, error };
    } else if (loadingState === "initial" || loadingState === "loading") {
        return { loadingState };
    } else {
        throw new Error("unreachable");
    }
}