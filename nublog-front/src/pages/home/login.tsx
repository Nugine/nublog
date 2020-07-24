import React, { useEffect } from "react";

import { useRouter } from "next/router";

import { Row, Button, Spin, Col, Space } from "antd";
import { GithubOutlined } from "@ant-design/icons";
import { css } from "emotion";

import { useLoading } from "../../hooks";
import * as vo from "../../vo";
import * as csr from "../../api/csr";
import * as utils from "../../utils";

const Login: React.FC = () => {
    const router = useRouter();

    const [loadingState, withLoading] = useLoading();

    useEffect(() => {
        const code = router.query.code;
        if (typeof code === "string") {
            withLoading(async () => {
                const session = await csr.initSession(code);
                vo.setSessionId(session.session_id);
            }, "认证失败，正在返回");
        }
    }, [router, withLoading]);

    useEffect(() => {
        if (loadingState === "error") {
            setTimeout(() => {
                router.back();
            }, 2000);
        }
        if (loadingState === "success") {
            const pathname = localStorage.getItem("goback-path") ?? "/home";
            localStorage.removeItem("goback-path");
            router.push(pathname);
        }
    }, [loadingState, router]);

    let inner: JSX.Element | null = null;

    if (loadingState === "initial") {
        const handleLogin = (): void => {
            const sessionId = vo.removeSessionId();
            if (sessionId) {
                csr.logout(sessionId);
            }

            localStorage.setItem("goback-path", document.location.pathname);
            const redirectUri = document.location.origin + document.location.pathname;
            document.location.href = (
                `${document.location.origin}/api/users/login?redirect_uri=${encodeURIComponent(redirectUri)}`
            );
        };

        inner = (
            <Button
                type="default"
                size="large"
                icon={<GithubOutlined />}
                onClick={handleLogin}
            >
                登录
            </Button>
        );
    }

    if (loadingState === "loading") {
        const breathStyleName = css`
            animation-name: breath;
            animation-duration: 1s;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;

            @keyframes breath {
                from {
                    color: inherit;
                }
                50% {
                    color: #40a9ff;
                }
                to {
                    color: inherit;
                }
            }
        `;

        inner = (
            <Col>
                <Space direction="vertical">
                    <Row justify="center">
                        <Spin delay={utils.COMMON_WAIT_TIME} size="large" />
                    </Row>
                    <Row justify="center">
                        <span style={{ fontSize: "1.5em" }} className={breathStyleName}>
                            认证中……
                        </span>
                    </Row>
                </Space>
            </Col>
        );
    }

    return (
        <Row justify="center" style={{ marginTop: "1em" }}>
            {inner}
        </Row>
    );
};

export default Login;
