import React, { useState, useEffect, useCallback } from "react";

import { Space, Spin, Alert, Button, Row, Avatar, Tag } from "antd";
import { GithubOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

import * as vo from "../../vo";
import * as csr from "../../api/csr";
import { useCsrData } from "../../hooks";

// const Admin = dynamic(() => import("../../components/Admin"));

interface UserHomeProps {
    user: vo.User;
}

const UserHome: React.FC<UserHomeProps> = ({ user }: UserHomeProps) => {
    const router = useRouter();

    const handleLogout = async (): Promise<void> => {
        const sessionId = vo.removeSessionId();
        if (sessionId) {
            await csr.logout(sessionId);
        }
        router.reload();
    };

    const isAdmin = user.role_code === vo.ADMIN_ROLE_CODE;

    const handleGotoAdmin = (): void => {
        router.push("/home/admin");
    };

    return (
        <Row justify="space-between" style={{ alignItems: "center", flexWrap: "wrap" }}>
            <span
                style={{
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "center"
                }}
            >
                <Space>
                    <a href={user.profile_url} rel="noreferrer noopener" target="_blank">
                        <Avatar shape="square" src={user.avatar_url} />
                    </a>

                    <span style={{ fontSize: "1.5em" }} > {user.name}</span>

                    {isAdmin ? (<Tag>管理员</Tag>) : null}
                </Space>
            </span>
            <span>
                {isAdmin ? (
                    <Button type="default" onClick={handleGotoAdmin}>
                        管理
                    </Button>
                ) : null}
                <Button type="default" onClick={handleLogout}>
                    登出
                </Button>
            </span>
        </Row>
    );
};


const HomeIndex: React.FC = () => {
    const router = useRouter();

    const csrData = useCsrData<vo.User | null>(useCallback(async () => {
        const sessionId = vo.getSessionId();
        if (sessionId) {
            return await csr.getSelf(sessionId);
        } else {
            return null;
        }
    }, []));

    let inner: JSX.Element | null = null;

    if (csrData.loadingState === "error") {
        vo.removeSessionId();
        inner = (
            <Alert
                message="加载失败，请重新登录"
                type="error"
                showIcon
            />
        );
    }

    if (csrData.loadingState === "loading") {
        inner = (
            <Row justify="center">
                <Spin spinning delay={256} size="large" />
            </Row>
        );
    }


    if (csrData.loadingState === "success") {
        const user = csrData.data;

        if (user === null) {
            router.push("/home/login");
        } else {
            inner = (<UserHome user={user} />);
        }
    }

    return (
        <Row justify="center" style={{ padding: "0 1em" }}>
            <Space direction="vertical" style={{ width: "100%", padding: "0 1em", marginTop: "1em" }}>
                {inner}
            </Space>
        </Row>
    );
};

export default HomeIndex;
