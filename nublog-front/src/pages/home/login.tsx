import React, { useState, useEffect } from "react";

import { Spin, Row, Alert } from "antd";

import * as vo from "../../vo";
import * as csr from "../../api/csr";
import { useRouter } from "next/dist/client/router";

const Login: React.FC = () => {

    const [loadingState, setLoadingState] = useState<vo.LoadingState>("initial");

    const router = useRouter();
    const code = router.query.code;

    useEffect(() => {
        if (typeof code !== "string") {
            setLoadingState("loading");
        } else {
            const f = async (): Promise<void> => {
                setLoadingState("loading");
                try {
                    const session = await csr.initSession(code);
                    localStorage.setItem("x-session-id", session.session_id);
                    setLoadingState("success");
                } catch (err) {
                    console.error(err);
                    setLoadingState("error");
                }
            };
            f();
        }
    }, [code]);


    let ele: JSX.Element | null = null;
    if (loadingState === "loading") {
        ele = (
            <Spin spinning delay={1000} />
        );
    }

    if (loadingState === "error") {
        ele = (
            <Alert
                message="出错了……"
                type="error"
                showIcon
            />
        );
    }

    if (loadingState === "success") {
        const goback = localStorage.getItem("goback-path");
        if (goback) {
            router.push(goback);
        } else {
            router.push("/home");
        }
    }

    return (
        <Row justify="center" style={{ marginTop: "1em" }}>
            {ele}
        </Row>
    );
};

export default Login;