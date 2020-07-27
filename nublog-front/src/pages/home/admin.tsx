import React, { useCallback, useState, useEffect, } from "react";

import { useLoading } from "../../hooks";
import * as vo from "../../vo";
import * as csr from "../../api/csr";
import CenteredDiv from "../../components/CenteredDiv";
import TargetBlankA from "../../components/TargetBlankA";
import * as utils from "../../utils";
import * as state from "../../state";

import { useRouter } from "next/router";

import {
    Spin, Avatar, Row, Space, Tabs,
    Table, Modal, Button, Tooltip,
    Result, message, Form, Input, Radio,
} from "antd";
import {
    EditOutlined, DeleteOutlined, InfoCircleOutlined,
    ReloadOutlined, PlusSquareOutlined, ArrowRightOutlined,
    LoadingOutlined
} from "@ant-design/icons";

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

    const reload = useCallback(async () => {
        setArticles(await csr.getAllArticles());
    }, []);

    const handleLoad = useCallback(() => { withLoading(reload, "加载失败"); }, [withLoading, reload]);

    useEffect(() => { handleLoad(); }, [handleLoad]);

    const router = useRouter();

    const [formCreate] = Form.useForm();
    const handleCreate = (): void => {
        formCreate.resetFields();

        const form = (
            <Form form={formCreate} layout="vertical" >
                <Form.Item name="url_key" label="URL 关键字" required rules={[{ required: true }]}>
                    <Input required />
                </Form.Item>
                <Form.Item name="title" label="标题" required rules={[{ required: true }]}>
                    <Input required /></Form.Item>
                <Form.Item name="author" label="作者" required rules={[{ required: true }]}>
                    <Input required /></Form.Item>
                <Form.Item name="summary" label="摘要" required rules={[{ required: true }]}>
                    <Input required /></Form.Item>
                <Form.Item name="content" label="内容" required rules={[{ required: true }]}>
                    <Input.TextArea required rows={10} />
                </Form.Item>
            </Form>
        );

        const submit = async (): Promise<void> => {
            await formCreate.validateFields();
            const data = {
                "url_key": formCreate.getFieldValue("url_key"),
                "title": formCreate.getFieldValue("title"),
                "author": formCreate.getFieldValue("author"),
                "summary": formCreate.getFieldValue("summary"),
                "content": formCreate.getFieldValue("content")
            };

            const sessionId = vo.getSessionId();
            if (sessionId) {
                try {
                    await csr.createArticle(sessionId, data);
                    message.success("操作成功");
                } catch (err) {
                    console.error(err);
                    message.error("操作失败");
                    throw err;
                }
                await reload();
            } else {
                message.error("操作失败，请重新登录");
                router.push("/home/login");
            }
        };

        Modal.confirm({
            icon: null,
            okText: "新增",
            cancelText: "取消",
            content: form,
            onOk: submit,
            style: {
                minWidth: "50%"
            }
        });
    };

    const [formUpdate] = Form.useForm();
    const handleUpdate = async (article: vo.Article): Promise<void> => {
        const form = (
            <Form form={formUpdate} layout="vertical" >
                <Form.Item name="id" label="ID" required><Input required disabled /></Form.Item>
                <Form.Item name="url_key" label="URL 关键字" required><Input required /></Form.Item>
                <Form.Item name="title" label="标题" required><Input required /></Form.Item>
                <Form.Item name="author" label="作者" required><Input required /></Form.Item>
                <Form.Item name="summary" label="摘要" required><Input required /></Form.Item>
                <Form.Item name="content" label="内容" required><Input.TextArea required rows={10} /></Form.Item>
            </Form>
        );

        const submit = async (): Promise<void> => {
            const data = {
                "id": article.id,
                "url_key": formUpdate.getFieldValue("url_key"),
                "title": formUpdate.getFieldValue("title"),
                "author": formUpdate.getFieldValue("author"),
                "summary": formUpdate.getFieldValue("summary"),
                "content": formUpdate.getFieldValue("content")
            };

            const sessionId = vo.getSessionId();
            if (sessionId) {
                try {
                    const ans = await csr.updateArticle(sessionId, data);
                    if (ans.is_updated) {
                        message.success("操作成功");
                    } else {
                        message.warn("操作无效");
                    }
                } catch (err) {
                    console.error(err);
                    message.error("操作失败");
                    throw err;
                }
                await reload();
            } else {
                message.error("操作失败，请重新登录");
                router.push("/home/login");
            }
        };

        try {
            const ans = await csr.getArticleByKey(article.url_key);
            formUpdate.setFieldsValue(ans);
        } catch (err) {
            console.error(err);
            message.error("加载失败");
            return;
        }

        Modal.confirm({
            icon: null,
            okText: "修改",
            cancelText: "取消",
            content: form,
            onOk: submit,
            style: {
                minWidth: "50%"
            }
        });
    };

    const handleDelete = (article: vo.Article): void => {
        const submit = async (): Promise<void> => {
            const sessionId = vo.getSessionId();
            if (sessionId) {
                try {
                    const ans = await csr.deleteArticle(sessionId, article.id);
                    if (ans.is_deleted) {
                        message.success("操作成功");
                    } else {
                        message.warn("操作无效");
                    }
                } catch (err) {
                    console.error(err);
                    message.error("操作失败");
                    throw err;
                }
                await reload();
            } else {
                message.error("操作失败，请重新登录");
                router.push("/home/login");
            }
        };

        Modal.confirm({
            content: `确认删除文章 ${article.title} ？`,
            okText: "确认",
            cancelText: "取消",
            onOk: submit,
        });
    };

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
                        <Button onClick={handleCreate}>
                            <PlusSquareOutlined />
                        </Button>
                    </Tooltip>
                </Space>
            </Row>
            <Spin indicator={<LoadingOutlined />} spinning={loadingState === "loading"} delay={utils.COMMON_WAIT_TIME}>
                <ArticleTable
                    articles={articles}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                />
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
                    title: "最后登录时间", key: "last_login", dataIndex: "last_login",
                    render(lastLogin: string): string {
                        return vo.fmtTime(new Date(lastLogin), true);
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

    const reload = useCallback(async () => {
        const sessionId = vo.getSessionId();
        if (sessionId) {
            setUsers(await csr.getAllUsers(sessionId));
        }
    }, []);

    const handleLoad = useCallback(() => {
        withLoading(reload, "加载失败");
    }, [withLoading, reload]);

    useEffect(() => { handleLoad(); }, [handleLoad]);

    const router = useRouter();

    const [formUpdate] = Form.useForm();
    const handleUpdate = (user: vo.User): void => {
        formUpdate.setFieldsValue({
            id: user.id,
            "role_code": user.role_code
        });

        const form = (
            <Form form={formUpdate}>
                <Form.Item name="id" label="ID" required>
                    <Input required disabled />
                </Form.Item>
                <Form.Item name="role_code" label="角色" required>
                    <Radio.Group>
                        <Radio value={0}>
                            管理员
                        </Radio>
                        <Radio value={1}>
                            读者
                        </Radio>
                    </Radio.Group>
                </Form.Item>
            </Form>
        );

        const submit = async (): Promise<void> => {
            const store = formUpdate.getFieldsValue();
            const data = { id: store.id, "role_code": store.role_code };
            const sessionId = vo.getSessionId();
            if (sessionId) {
                try {
                    const ans = await csr.updateUser(sessionId, data);
                    if (ans.is_updated) {
                        message.success("操作成功");
                    } else {
                        message.warn("操作无效");
                    }
                } catch (err) {
                    console.error(err);
                    message.error("操作失败");
                    throw err;
                }
                await reload();
            } else {
                message.error("操作失败，请重新登录");
                router.push("/home/login");
            }
        };

        Modal.confirm({
            icon: null,
            okText: "修改",
            cancelText: "取消",
            onOk: submit,
            content: form,
        });
    };

    const handleDelete = (user: vo.User): void => {
        const submit = async (): Promise<void> => {
            const sessionId = vo.getSessionId();
            if (sessionId) {
                try {
                    const ans = await csr.deleteUser(sessionId, user.id);
                    if (ans.is_deleted) {
                        message.success("操作成功");
                    } else {
                        message.warn("操作无效");
                    }
                } catch (err) {
                    console.error(err);
                    message.error("操作失败");
                    throw err;
                }
                await reload();
            } else {
                message.error("操作失败，请重新登录");
                router.push("/home/login");
            }
        };

        Modal.confirm({
            content: `确认删除用户 ${user.name} ？`,
            okText: "确认",
            cancelText: "取消",
            onOk: submit,
        });
    };

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
            <Spin indicator={<LoadingOutlined />} spinning={loadingState === "loading"} delay={utils.COMMON_WAIT_TIME}>
                <UserTable
                    users={users}
                    adminUser={adminUser}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
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
            <Spin indicator={<LoadingOutlined />} spinning delay={utils.COMMON_WAIT_TIME} size="large" />
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