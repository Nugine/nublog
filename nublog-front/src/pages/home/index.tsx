import React, { useState, useEffect } from "react";

import { Space, Spin, Alert, Button, Row, Avatar } from "antd";

import { GithubOutlined } from "@ant-design/icons";
import { useRouter } from "next/dist/client/router";

import * as vo from "../../vo";
import * as csr from "../../api/csr";


const HomeIndex: React.FC = () => {
    const [loadingState, setLoadingState] = useState<vo.LoadingState>("initial");

    const [user, setUser] = useState<vo.User | null>(null);

    useEffect(() => {
        const sessionId = localStorage.getItem("x-session-id");
        if (sessionId) {
            const f = async (): Promise<void> => {
                setLoadingState("loading");
                try {
                    const user = await csr.getSelf(sessionId);
                    setUser(user);
                    setLoadingState("success");
                } catch (err) {
                    console.error(err);
                    setLoadingState("error");
                }
            };
            f();
        } else {
            setLoadingState("success");
        }
    }, []);

    let ele: JSX.Element | null = null;

    if (loadingState === "error") {
        ele = (
            <Alert
                message="加载失败，请重新登录"
                type="error"
                showIcon
            />
        );
    }

    if (loadingState === "loading") {
        ele = (
            <Row justify="center">
                <Spin spinning delay={1000} />
            </Row>
        );
    }

    const router = useRouter();

    if (loadingState === "success") {
        if (user === null) {
            const handleLogin = (): void => {
                localStorage.setItem("goback-path", document.location.pathname);
                document.location.pathname = "/api/users/auth/login";
            };

            ele = (
                <Row justify="center">
                    <Button type="default" size="large" icon={<GithubOutlined />} onClick={handleLogin}>登录</Button>
                </Row>
            );
        } else {
            const handleLogout = (): void => {
                localStorage.removeItem("x-session-id");
                router.reload();
            };

            ele = (
                <div>
                    {/* {JSON.stringify(user)} */}

                    <Row justify="space-between" style={{ alignItems: "center" }}>
                        <Row justify="start" style={{ alignItems: "center" }}>
                            <a href={user.profile_url} rel="noreferrer noopener" target="_blank">
                                <Avatar shape="square" src={user.avatar_url} />
                            </a>

                            <span style={{ fontSize: "1.5em", marginLeft: "0.5em" }}>{user.name}</span>
                        </Row>
                        <Button type="default" onClick={handleLogout}>
                            登出
                        </Button>
                    </Row>

                </div>
            );
            // TODO
        }
    }

    return (
        <Space direction="vertical" style={{ width: "100%", padding: "0 1em", marginTop: "1em" }}>

            {ele}

        </Space>
    );
};

export default HomeIndex;
