import React, { useCallback, useState, useEffect, useRef } from "react";

import { useLoading } from "../../hooks";
import * as vo from "../../vo";
import * as csr from "../../api/csr";
import CenteredDiv from "../../components/CenteredDiv";
import * as utils from "../../utils";
import * as state from "../../state";

import { useRouter } from "next/router";

import { Spin, Avatar, Row, Space, Tabs, Table, Modal, Button, Tooltip, Result, message, } from "antd";
import { EditOutlined, DeleteOutlined, InfoCircleOutlined, ReloadOutlined, PlusSquareOutlined, ArrowRightOutlined } from "@ant-design/icons";
import TargetBlankA from "../../components/TargetBlankA";

interface ArticleTableProps {
    articles: vo.Article[];
    onUpdate: (article: vo.Article) => void;
    onDelete: (article: vo.Article) => void;
}

const ArticleTable: React.FC<ArticleTableProps> = (props: ArticleTableProps) => {
    const renderTime = (time: string): string => vo.fmtTime(new Date(time), true);

    return (
        <Table
            dataSource={props.articles}
            rowKey={(r): number => r.id}
            columns={[
                { title: "ID", key: "id", dataIndex: "id" },
                { title: "URL 关键字", key: "url_key", dataIndex: "url_key" },
                { title: "标题", key: "title", dataIndex: "title" },
                { title: "作者", key: "author", dataIndex: "author" },
                { title: "创建时间", key: "created_at", dataIndex: "created_at", render: renderTime },
                { title: "更新时间", key: "updated_at", dataIndex: "updated_at", render: renderTime },
                {
                    title: "操作",
                    key: "action", dataIndex: "id",
                    render(_id: number, record: vo.Article): JSX.Element {
                        return (
                            <Space>
                                <Tooltip title="摘要">
                                    <Button onClick={(): void => {
                                        Modal.info({
                                            title: "摘要", content: (record.summary)
                                        });
                                    }}>
                                        <InfoCircleOutlined />
                                    </Button>
                                </Tooltip>
                                <TargetBlankA href={`/articles/${record.url_key}/`}>
                                    <Tooltip title="打开">
                                        <Button>
                                            <ArrowRightOutlined />
                                        </Button>
                                    </Tooltip>
                                </TargetBlankA>
                                <Tooltip title="修改">
                                    <Button onClick={(): void => props.onUpdate(record)}>
                                        <EditOutlined />
                                    </Button>
                                </Tooltip>
                                <Tooltip title="删除">
                                    <Button onClick={(): void => props.onDelete(record)} >
                                        <DeleteOutlined />
                                    </Button>
                                </Tooltip>
                            </Space>
                        );
                    }
                }
            ]}
        />
    );
};

type AdminPaneProps = {};

const ArticlesAdmin: React.FC<AdminPaneProps> = () => {
    const [articles, setArticles] = useState<vo.Article[]>([]);
    const [loadingState, withLoading] = useLoading();

    const handleLoad = useCallback(() => {
        withLoading(async () => {
            await utils.delay(1000); // FIXME
            setArticles(await csr.getAllArticles());
        }, "加载失败");
    }, [setArticles, withLoading]);

    useEffect(() => { handleLoad(); }, [handleLoad]);

    return (
        <>
            <Row justify="space-between">
                <Space>
                    <Tooltip title="刷新">
                        <Button onClick={handleLoad}>
                            <ReloadOutlined />
                        </Button>
                    </Tooltip>
                    <Tooltip title="新增">
                        <Button>
                            <PlusSquareOutlined />
                        </Button>
                    </Tooltip>
                </Space>
            </Row>
            <Spin spinning={loadingState === "loading"} delay={utils.COMMON_WAIT_TIME}>
                <ArticleTable articles={articles} onUpdate={console.log} onDelete={console.log} />
            </Spin>
        </>
    );
};

interface UserTableProps {
    users: vo.User[];
    adminUser: vo.User;
    onUpdate: (user: vo.User) => void;
    onDelete: (user: vo.User) => void;
}

const UserTable: React.FC<UserTableProps> = (props: UserTableProps) => {
    return (
        <Table
            dataSource={props.users}
            rowKey={(r): number => r.id}
            columns={[
                { title: "ID", key: "id", dataIndex: "id" },
                {
                    title: "角色", key: "role_code", dataIndex: "role_code",
                    render: (roleCode: vo.RoleCode): string => {
                        if (roleCode === vo.RoleCode.ADMIN) {
                            return "管理员";
                        }
                        if (roleCode === vo.RoleCode.READER) {
                            return "读者";
                        }
                        throw new Error("unreachable");
                    }
                },
                {
                    title: "头像", key: "avatar_url", dataIndex: "avatar_url",
                    render(avatarUrl: string): JSX.Element {
                        return <Avatar src={avatarUrl} shape="square" />;
                    }
                },
                { title: "昵称", key: "name", dataIndex: "name" },
                {
                    title: "邮箱", key: "email", dataIndex: "email",
                    render(email: string): JSX.Element {
                        return (
                            <TargetBlankA href={`mailto:${email}`}>
                                {email}
                            </TargetBlankA>
                        );
                    }
                },
                {
                    title: "主页", key: "profile_url", dataIndex: "profile_url",
                    render(profileUrl: string): JSX.Element {
                        return (
                            <TargetBlankA href={profileUrl}>
                                {profileUrl}
                            </TargetBlankA>
                        );
                    }
                },
                {
                    title: "操作",
                    key: "action", dataIndex: "id",
                    render(id: number, record: vo.User): JSX.Element {
                        return (
                            <Space>
                                <Tooltip title="修改">
                                    <Button onClick={(): void => props.onUpdate(record)}>
                                        <EditOutlined />
                                    </Button>
                                </Tooltip>
                                <Tooltip title="删除">
                                    <Button
                                        onClick={(): void => props.onDelete(record)}
                                        disabled={id == props.adminUser.id}
                                    >
                                        <DeleteOutlined />
                                    </Button>
                                </Tooltip>
                            </Space>
                        );
                    }
                }
            ]}
        />
    );
};

type UsersAdminProps = {
    adminUser: vo.User;
} & AdminPaneProps;

const UsersAdmin: React.FC<UsersAdminProps> = ({ adminUser }: UsersAdminProps) => {
    const [users, setUsers] = useState<vo.User[]>([]);
    const [loadingState, withLoading] = useLoading();

    const handleLoad = useCallback(() => {
        withLoading(async () => {
            await utils.delay(1000);
            const sessionId = vo.getSessionId();
            if (sessionId) {
                setUsers(await csr.getAllUsers(sessionId));
            }
        }, "加载失败");
    }, [withLoading]);

    useEffect(() => { handleLoad(); }, [handleLoad]);

    return (
        <>
            <Row>
                <Space>
                    <Tooltip title="刷新">
                        <Button onClick={handleLoad}>
                            <ReloadOutlined />
                        </Button>
                    </Tooltip>
                </Space>
            </Row>
            <Spin spinning={loadingState === "loading"} delay={utils.COMMON_WAIT_TIME}>
                <UserTable
                    users={users}
                    adminUser={adminUser}
                    onUpdate={console.log}
                    onDelete={console.log}
                />
            </Spin>
        </>
    );
};

interface AdminProps {
    adminUser: vo.User;
}

const Admin: React.FC<AdminProps> = ({ adminUser }: AdminProps) => {
    return (
        <>
            <Row style={{ width: "100%" }} justify="center">
                <Tabs
                    style={{ width: "100%" }}
                >
                    <Tabs.TabPane tab="文章管理" key="admin-articles">
                        <ArticlesAdmin />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="用户管理" key="admin-users">
                        <UsersAdmin adminUser={adminUser} />
                    </Tabs.TabPane>
                </Tabs>
            </Row>
        </>
    );
};

const AdminEntry: React.FC = () => {
    const router = useRouter();

    const [user, setUser, loadingState, withLoading] = state.useUserCtx();

    useEffect(() => {
        const sessionId = vo.getSessionId();
        if (sessionId) {
            if (!user) {
                withLoading(async () => {
                    setUser(await csr.getSelf(sessionId));
                }, (err) => {
                    console.error(err);
                    message.error("加载失败，请重新登录");
                    setTimeout(() => {
                        router.push("/home/login");
                    }, 2000);
                });
            }
        } else {
            router.push("/home/login");
        }
    }, [router, user, setUser, withLoading]);

    let inner: JSX.Element | null = null;

    if (loadingState === "loading") {
        inner = (
            <Spin spinning delay={utils.COMMON_WAIT_TIME} size="large" />
        );
    }

    if (loadingState === "success") {
        if (user) {
            if (user.role_code === vo.RoleCode.ADMIN) {
                inner = (
                    <Admin adminUser={user} />
                );
            } else {
                inner = (
                    <Result status="error" title="错误" subTitle="您无权访问本页面" />
                );
            }
        }
    }

    return (
        <CenteredDiv style={{ marginTop: "1em", padding: "0 1.5em" }}>
            {inner}
        </CenteredDiv>
    );
};

export default AdminEntry;