import { useState } from "react";

import { LoadingState } from "./vo";

import { message } from "antd";

export type UseLoading = [LoadingState, (f: () => Promise<void>, e: string | ((e: unknown) => void)) => Promise<void>];

export function useLoading(init?: LoadingState): UseLoading {
    const [loading, setLoading] = useState(init ?? "initial");
    const withLoading: UseLoading[1] = async (f, e) => {
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
    };

    return [loading, withLoading];
}
