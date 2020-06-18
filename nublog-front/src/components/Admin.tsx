import React, { useState, useEffect } from "react";

import { Tabs, Row, Space, Comment as AntdComment, Avatar, Button, Input, List, Col, message, Alert, Table, Modal, Form } from "antd";
import { css } from "emotion";
import { GithubOutlined, PlusSquareOutlined, CloseSquareOutlined } from "@ant-design/icons";

import *  as vo from "../vo";
import * as csr from "../api/csr";


export interface ManageProps {
    userId: number;
    sessionId: string;
}

const ArticlesManage: React.FC<ManageProps> = ({ userId, sessionId }: ManageProps) => {
    console.debug(userId, sessionId);

    const [modalCreate, setModalCreate] = useState<boolean>(false);
    const [form] = Form.useForm();
    const [articles, setArticles] = useState<vo.ArticleMeta[]>([]);

    useEffect(() => {
        const f = async (): Promise<void> => {
            try {
                const ans = await csr.getAllArticlesMeta();
                setArticles(ans);
            } catch (err) {
                console.error(err);
                message.error("加载失败，请刷新重试");
            }
        };
        f();
    }, []);

    const reload = async (): Promise<void> => {
        try {
            const ans = await csr.getAllArticlesMeta();
            setArticles(ans);
        } catch (err) {
            console.error(err);
            message.error("加载失败，请刷新重试");
        }
    };

    const handleDelete = async (articleId: number): Promise<void> => {
        try {
            await csr.deleteArticle(sessionId, articleId);
        } catch (err) {
            console.error(err);
            message.error("操作失败");
        }

        await reload();
    };

    return (
        <>
            <Row>
                <Button
                    icon={<PlusSquareOutlined />}
                    onClick={(): void => setModalCreate(true)}
                >
                    新增文章
                </Button>
            </Row>
            <Modal
                visible={modalCreate}
                onCancel={(): void => setModalCreate(false)}
                cancelText="取消"
                okText="确定"
            >
                新增文章 对话框
            </Modal>
            <Table
                columns={[
                    { title: "id", key: "id", dataIndex: "id" },
                    { title: "key", key: "article_key", dataIndex: "article_key" },
                    { title: "title", key: "title", dataIndex: "title" },
                    { title: "author", key: "author", dataIndex: "author" },
                    { title: "summary", key: "summary", dataIndex: "summary" },
                    { title: "create_at", key: "create_at", dataIndex: "create_at" },
                    { title: "update_at", key: "update_at", dataIndex: "update_at" },
                    {
                        key: "action-delete", dataIndex: "id",
                        // eslint-disable-next-line react/display-name
                        render: (id: number): JSX.Element => (
                            <Button onClick={(): void => {
                                Modal.confirm({ title: `即将删除文章 id = ${id}`, okText: "确定", cancelText: "取消", onOk: () => handleDelete(id) });
                            }} >
                                删除
                            </Button>
                        )
                    }
                ]}
                rowKey={(r): number => r.id}
                dataSource={articles}
            />
        </>
    );
};

const TagsManage: React.FC<ManageProps> = ({ userId, sessionId }: ManageProps) => {
    console.debug(userId, sessionId);

    const [form] = Form.useForm();
    const [modalCreate, setModalCreate] = useState<boolean>(false);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

    const [tags, setTags] = useState<vo.Tag[]>([]);

    useEffect(() => {
        const f = async (): Promise<void> => {
            try {
                const ans = await csr.getAllTags();
                setTags(ans);
            } catch (err) {
                console.log(err);
                message.error("加载失败，请刷新重试");
            }
        };
        f();
    }, []);

    const reload = async (): Promise<void> => {
        try {
            const ans = await csr.getAllTags();
            setTags(ans);
        } catch (err) {
            console.log(err);
            message.error("加载失败，请刷新重试");
        }
    };

    const handleCreate = async (): Promise<void> => {
        const tagName = form.getFieldValue("name");

        setConfirmLoading(true);
        try {
            await csr.createTag(sessionId, tagName);
            setModalCreate(false);
        } catch (err) {
            console.error(err);
            message.error("操作失败");
        } finally {
            setConfirmLoading(false);
        }

        await reload();
    };

    const handleDelete = async (tagId: number): Promise<void> => {
        try {
            await csr.deleteTag(sessionId, tagId);
        } catch (err) {
            console.error(err);
            message.error("操作失败");
        }
        await reload();
    };

    return (
        <>
            <Button
                icon={<PlusSquareOutlined />}
                onClick={(): void => setModalCreate(true)}
            >
                新增标签
            </Button>
            <Modal
                visible={modalCreate}
                onCancel={(): void => setModalCreate(false)}
                cancelText="取消"
                okText="确定"
                closable={false}
                confirmLoading={confirmLoading}
                onOk={handleCreate}
            >
                <Form form={form}>
                    <Form.Item name="name" label="标签名称" required>
                        <Input required />
                    </Form.Item>
                </Form>
            </Modal>

            <Table
                columns={[
                    { title: "id", key: "id", dataIndex: "id" },
                    { title: "name", key: "name", dataIndex: "name" },
                    {
                        key: "action-delete", dataIndex: "id",
                        // eslint-disable-next-line react/display-name
                        render: (id: number): JSX.Element => (
                            <Button onClick={(): void => {
                                Modal.confirm({ title: `即将删除标签 id = ${id}`, okText: "确定", cancelText: "取消", onOk: () => handleDelete(id) });
                            }} >
                                删除
                            </Button>
                        )
                    }
                ]}
                rowKey={(r): number => r.id}
                dataSource={tags}
            />
        </>
    );
};

const UsersManage: React.FC<ManageProps> = ({ userId, sessionId }: ManageProps) => {
    const [users, setUsers] = useState<vo.User[]>([]);

    const [form] = Form.useForm();
    const [modalCreate, setModalCreate] = useState<boolean>(false);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

    useEffect(() => {
        const f = async (): Promise<void> => {
            try {
                const ans = await csr.getAllUsers(sessionId);
                setUsers(ans);
            } catch (err) {
                console.error(err);
                message.error("加载失败，请刷新重试");
            }
        };
        f();
    }, [sessionId]);

    const reload = async (): Promise<void> => {
        try {
            const ans = await csr.getAllUsers(sessionId);
            setUsers(ans);
        } catch (err) {
            console.error(err);
            message.error("加载失败，请刷新重试");
        }
    };

    const handleCreate = async (): Promise<void> => {
        const roleCode = form.getFieldValue("role_code");
        const name = form.getFieldValue("name");
        const email = form.getFieldValue("email");
        const avatarUrl = form.getFieldValue("avatar_url");
        const profileUrl = form.getFieldValue("profile_url");
        const data = { "role_code": roleCode, name, email, "avatar_url": avatarUrl, "profile_url": profileUrl };
        console.debug(data);

        setConfirmLoading(true);
        try {
            await csr.createUser(sessionId, data);
            setModalCreate(false);
        } catch (err) {
            console.error(err);
            message.error("操作失败");
        }
        finally {
            setConfirmLoading(false);
        }

        await reload();
    };

    const handleDelete = async (targetUserId: number): Promise<void> => {
        try {
            await csr.deleteUser(sessionId, targetUserId);
        } catch (err) {
            console.error(err);
            message.error("操作失败");
        }

        await reload();
    };

    return (
        <>
            <Button
                icon={<PlusSquareOutlined />}
                onClick={(): void => setModalCreate(true)}
            >
                新增用户
            </Button>
            <Modal
                visible={modalCreate}
                onCancel={(): void => setModalCreate(false)}
                cancelText="取消"
                okText="确定"
                closable={false}
                confirmLoading={confirmLoading}
                onOk={handleCreate}
            >
                <Form form={form} initialValues={{ "role_code": 1, name: "", email: "", "avatar_url": "", "profile_url": "" }} >
                    <Form.Item name="role_code" label="角色代码" required>
                        <Input type="number" required />
                    </Form.Item>
                    <Form.Item name="name" label="昵称" required>
                        <Input required />
                    </Form.Item>
                    <Form.Item name="email" label="邮箱" required>
                        <Input required />
                    </Form.Item>
                    <Form.Item name="avatar_url" label="头像 URL" required>
                        <Input required />
                    </Form.Item>
                    <Form.Item name="profile_url" label="主页 URL" required>
                        <Input required />
                    </Form.Item>
                </Form>
            </Modal>
            <Table
                columns={[
                    { title: "id", key: "id", dataIndex: "id" },
                    { title: "role_code", key: "role_code", dataIndex: "role_code" },
                    { title: "name", key: "name", dataIndex: "name" },
                    { title: "email", key: "email", dataIndex: "email" },
                    {
                        title: "avatar", key: "avatar_url", dataIndex: "avatar_url",
                        // eslint-disable-next-line react/display-name
                        render: (avatarUrl: string): JSX.Element => (<Avatar src={avatarUrl} shape="square" />)
                    },
                    {
                        title: "profile", key: "profile_url", dataIndex: "profile_url",
                        // eslint-disable-next-line react/display-name
                        render: (profileUrl: string): JSX.Element => (<a href={profileUrl} target="_blank" rel="noopener noreferrer">{profileUrl}</a>)
                    },
                    {
                        key: "action-delete", dataIndex: "id",
                        // eslint-disable-next-line react/display-name
                        render: (id: number): JSX.Element => (
                            <Button onClick={(): void => {
                                Modal.confirm({ title: `即将删除用户 id = ${id}`, okText: "确定", cancelText: "取消", onOk: () => handleDelete(id) });
                            }} >
                                删除
                            </Button>
                        )
                    }
                ]}
                rowKey={(r): number => r.id}
                dataSource={users}
            />
        </>
    );
};

export interface AdminProps {
    user: vo.User;
}

const Admin: React.FC<AdminProps> = ({ user }: AdminProps) => {
    const sessionId = vo.getSessionId();
    if (!sessionId) {
        return (
            <Alert type="error" message="加载失败，请重新登录" />
        );
    }

    return (
        <Tabs>
            <Tabs.TabPane tab="文章管理" key="articles-manage">
                <ArticlesManage userId={user.id} sessionId={sessionId} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="标签管理" key="tags-manage">
                <TagsManage userId={user.id} sessionId={sessionId} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="用户管理" key="users-manage">
                <UsersManage userId={user.id} sessionId={sessionId} />
            </Tabs.TabPane>
        </Tabs>
    );
};

export default Admin;
