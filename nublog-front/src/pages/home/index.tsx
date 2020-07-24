import React, { useEffect } from "react";

import { Space, Spin, Button, Row, Avatar, Col, message, } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { useRouter } from "next/router";

import * as state from "../../state";
import * as vo from "../../vo";
import * as csr from "../../api/csr";
import * as utils from "../../utils";
import CenteredDiv from "../../components/CenteredDiv";
import TargetBlankA from "../../components/TargetBlankA";
import { LINK_STYLE_NAME } from "../../styles/local";

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

    const isAdmin = user.role_code === vo.RoleCode.ADMIN;

    const handleGotoAdmin = (): void => {
        router.push("/home/admin");
    };

    return (
        <Row justify="center" style={{ width: "100%" }}>
            <Col span={24} lg={12} style={{ display: "flex", justifyContent: "space-between" }}>
                <span
                    style={{
                        display: "inline-flex",
                        justifyContent: "start",
                        alignItems: "center"
                    }}
                >
                    <Space direction="horizontal" className={LINK_STYLE_NAME}>
                        <TargetBlankA href={user.profile_url}>
                            <Avatar shape="square" src={user.avatar_url} />
                        </TargetBlankA>
                        <TargetBlankA href={user.profile_url} style={{ fontSize: "1.5em", color: "inherit" }}>
                            {user.name}
                        </TargetBlankA>
                    </Space>
                </span>
                <span>
                    <Space>
                        {isAdmin ? (
                            <Button type="default" onClick={handleGotoAdmin}>
                                管理
                            </Button>
                        ) : null}
                        <Button type="default" onClick={handleLogout}>
                            登出
                        </Button>
                    </Space>
                </span>
            </Col>
        </Row >
    );
};


const HomeIndex: React.FC = () => {
    const router = useRouter();

    const [user, setUser, loadingState, withLoading] = state.useUserCtx();

    useEffect(() => {
        const sessionId = vo.getSessionId();
        if (sessionId) {
            if (!user) {
                withLoading(async () => {
                    await utils.delay(3000);
                    setUser(await csr.getSelf(sessionId));
                }, (err) => {
                    console.error(err);
                    message.error("加载失败，请重新登录");
                    setTimeout((): void => { router.push("/home/login"); }, 2000);
                });
            }
        } else {
            router.push("/home/login");
        }
    }, [withLoading, setUser, user, router]);

    let inner: JSX.Element | null = null;

    if (loadingState === "loading") {
        inner = (
            <Row justify="center">
                <Spin indicator={<LoadingOutlined/>} spinning delay={utils.COMMON_WAIT_TIME} size="large" />
            </Row>
        );
    }

    if (loadingState === "success") {
        if (user) {
            inner = (<UserHome user={user} />);
        }
    }

    return (
        <CenteredDiv style={{ marginTop: "1em", padding: "0 1.5em", width: "100%" }}>
            {inner}
        </CenteredDiv>
    );
};

export default HomeIndex;
