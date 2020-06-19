import React, { useState, useEffect } from "react";

import { Tabs, Row, Avatar, Button, Input, message, Alert, Table, Modal, Form } from "antd";
import { PlusSquareOutlined, } from "@ant-design/icons";

import *  as vo from "../vo";
import * as csr from "../api/csr";


export interface ManageProps {
    userId: number;
    sessionId: string;
}

const ArticlesManage: React.FC<ManageProps> = ({ userId, sessionId }: ManageProps) => {
    console.debug(userId, sessionId);

    const [modalCreate, setModalCreate] = useState<boolean>(false);
    const [formCreate] = Form.useForm();
    const [articles, setArticles] = useState<vo.ArticleMeta[]>([]);
    const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

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

    const handleCreate = async (): Promise<void> => {
        const articleKey = formCreate.getFieldValue("article_key");
        const title = formCreate.getFieldValue("title");
        const author = formCreate.getFieldValue("author");
        const summary = formCreate.getFieldValue("summary");
        const content = formCreate.getFieldValue("content");

        const data = {
            "article_key": articleKey,
            title, author, summary, content
        };

        setConfirmLoading(true);
        try {
            await csr.createArticle(sessionId, data);
            setModalCreate(false);
        } catch (err) {
            console.error(err);
            message.error("操作失败");
        } finally {
            setConfirmLoading(false);
        }

        await reload();
    };

    const handleDelete = (articleId: number): void => {
        Modal.confirm({
            title: `即将删除文章 id = ${articleId}`,
            okText: "确定", cancelText: "取消",
            onOk: async (): Promise<void> => {
                try {
                    await csr.deleteArticle(sessionId, articleId);
                } catch (err) {
                    console.error(err);
                    message.error("操作失败");
                }

                await reload();
            }
        });
    };

    const [formUpdate] = Form.useForm();
    const [modalUpdate, setModalUpdate] = useState<boolean>(false);
    const [targetArticleId, setTargetArticleId] = useState<number | null>(null);

    const handleUpdate = async (): Promise<void> => {
        const articleKey = formUpdate.getFieldValue("article_key");
        const title = formUpdate.getFieldValue("title");
        const author = formUpdate.getFieldValue("author");
        const summary = formUpdate.getFieldValue("summary");
        const content = formUpdate.getFieldValue("content");
        const data = {
            "article_key": articleKey,
            title, author, summary, content
        };
        if (targetArticleId === null) {
            throw new Error("unexpected UI error");
        }

        setConfirmLoading(true);
        try {
            await csr.updateArticle(sessionId, targetArticleId, data);
            setModalUpdate(false);
        } catch (err) {
            console.error(err);
            message.error("操作失败");
        } finally {
            setConfirmLoading(false);
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
                onOk={handleCreate}
                confirmLoading={confirmLoading}
            >
                <Form form={formCreate} layout="vertical">
                    <Form.Item name="article_key" label="URL 关键字" required><Input required /></Form.Item>
                    <Form.Item name="title" label="标题" required><Input required /></Form.Item>
                    <Form.Item name="author" label="作者" required><Input required /></Form.Item>
                    <Form.Item name="summary" label="摘要" required><Input required /></Form.Item>
                    <Form.Item name="content" label="内容" required><Input.TextArea required rows={10} /></Form.Item>
                </Form>
            </Modal>
            <Modal
                visible={modalUpdate}
                onCancel={(): void => setModalUpdate(false)}
                cancelText="取消"
                okText="确定"
                onOk={handleUpdate}
                confirmLoading={confirmLoading}
            >
                <Form form={formUpdate} layout="vertical" initialValues={{ "article_key": "", title: "", author: "", summary: "", content: "" }}>
                    <Form.Item name="id" label="ID" required>
                        <Input required disabled placeholder={`${targetArticleId}`} />
                    </Form.Item>
                    <Form.Item name="article_key" label="URL 关键字" required><Input required /></Form.Item>
                    <Form.Item name="title" label="标题" required><Input required /></Form.Item>
                    <Form.Item name="author" label="作者" required><Input required /></Form.Item>
                    <Form.Item name="summary" label="摘要" required><Input required /></Form.Item>
                    <Form.Item name="content" label="内容" required><Input.TextArea required rows={10} /></Form.Item>
                </Form>
            </Modal>
            <Table
                columns={[
                    { title: "ID", key: "id", dataIndex: "id" },
                    { title: "URL 关键字", key: "article_key", dataIndex: "article_key" },
                    { title: "标题", key: "title", dataIndex: "title" },
                    { title: "作者", key: "author", dataIndex: "author" },
                    {
                        title: "摘要", key: "summary", dataIndex: "summary",
                        // eslint-disable-next-line react/display-name
                        render: (summary: string): JSX.Element => (
                            <Button onClick={(): void => {
                                Modal.info({
                                    title: "摘要", content: (summary)
                                });
                            }}>
                                查看
                            </Button>
                        )
                    },
                    {
                        title: "内容", key: "content", dataIndex: "article_key",
                        // eslint-disable-next-line react/display-name
                        render: (key: string): JSX.Element => (
                            <a href={`/articles/${key}`} target="_blank" rel="noopener noreferrer">
                                <Button>
                                    跳转
                                </Button>
                            </a>
                        )
                    },
                    {
                        title: "创建时间", key: "create_at", dataIndex: "create_at",
                        render: (time: string): string => vo.fmtTimeDetail(new Date(time))
                    },
                    {
                        title: "更新时间", key: "update_at", dataIndex: "update_at",
                        render: (time: string): string => vo.fmtTimeDetail(new Date(time))
                    },
                    {
                        title: "标签", key: "tags", dataIndex: "tags",
                        // eslint-disable-next-line react/display-name
                        render: (tags: vo.Tag[]): JSX.Element => (
                            <Button onClick={(): void => {
                                Modal.info({
                                    title: "标签", content: (
                                        <Table
                                            columns={[
                                                { title: "ID", key: "id", dataIndex: "id" },
                                                { title: "名称", key: "name", dataIndex: "name" },
                                            ]}
                                            dataSource={tags}
                                        />
                                    )
                                });
                            }}>
                                查看
                            </Button>
                        )
                    },
                    {
                        title: "操作",
                        key: "action", dataIndex: "id",
                        // eslint-disable-next-line react/display-name
                        render: (id: number, record: vo.ArticleMeta): JSX.Element => (
                            <>
                                <Button onClick={async (): Promise<void> => {
                                    try {
                                        const article = await csr.getArticleByKey(record.article_key);
                                        setModalUpdate(true); setTargetArticleId(id); formUpdate.resetFields();
                                        formUpdate.setFieldsValue(article);
                                    } catch (err) {
                                        console.error(err);
                                        message.error("加载失败");
                                    }
                                }}>
                                    修改
                                </Button>
                                <Button onClick={(): void => handleDelete(id)} >
                                    删除
                                </Button>
                            </>
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

    const [formCreate] = Form.useForm();
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
        const tagName = formCreate.getFieldValue("name");

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

    const handleDelete = (tagId: number): void => {
        Modal.confirm({
            title: `即将删除标签 id = ${tagId}`,
            okText: "确定",
            cancelText: "取消",
            onOk: async (): Promise<void> => {
                try {
                    await csr.deleteTag(sessionId, tagId);
                } catch (err) {
                    console.error(err);
                    message.error("操作失败");
                }
                await reload();
            }
        });
    };

    const [modalUpdate, setModalUpdate] = useState<boolean>(false);
    const [formUpdate] = Form.useForm();
    const [targetTagId, setTargetTagId] = useState<number | null>(null);

    const handleUpdate = async (): Promise<void> => {
        const name = formUpdate.getFieldValue("name");
        if (targetTagId === null) {
            throw new Error("unexpected UI error");
        }
        setConfirmLoading(true);
        try {
            await csr.updateTag(sessionId, targetTagId, name);
            setModalUpdate(false);
        } catch (err) {
            console.error(err);
            message.error("操作失败");
        }
        finally {
            setConfirmLoading(false);
        }
        await reload();
    };

    const [modalRelate, setModalRelate] = useState<boolean>(false);
    const [formRelate] = Form.useForm();

    const handleRelate = async (ty: "insert" | "delete"): Promise<void> => {
        const articleId = parseInt(formRelate.getFieldValue("article_id"));
        if (targetTagId === null) {
            throw new Error("unexpected UI error");
        }
        setConfirmLoading(true);
        try {
            if (ty === "insert") {
                await csr.relateTagArticle(sessionId, targetTagId, articleId);
            } else if (ty === "delete") {
                await csr.unrelateTagArticle(sessionId, targetTagId, articleId);
            }
            setModalRelate(false);
        } catch (err) {
            console.error(err);
            message.error("操作失败");
        } finally {
            setConfirmLoading(false);
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
                <Form form={formCreate} layout="vertical">
                    <Form.Item name="name" label="标签名称" required>
                        <Input required />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                visible={modalUpdate}
                onCancel={(): void => setModalUpdate(false)}
                cancelText="取消"
                okText="确定"
                closable={false}
                confirmLoading={confirmLoading}
                onOk={handleUpdate}
            >
                <Form form={formUpdate} layout="vertical" initialValues={{ name: "" }}>
                    <Form.Item name="id" label="ID" required>
                        <Input required disabled placeholder={`${targetTagId}`} />
                    </Form.Item>
                    <Form.Item name="name" label="名称" required>
                        <Input required />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                visible={modalRelate}
                footer={<>
                    <Button onClick={(): void => setModalRelate(false)}>
                        取消
                    </Button>
                    <Button type="primary" loading={confirmLoading} onClick={(): Promise<void> => handleRelate("delete")}>
                        删除
                    </Button>
                    <Button type="primary" loading={confirmLoading} onClick={(): Promise<void> => handleRelate("insert")}>
                        新增
                    </Button>
                </>}
            >
                <Form form={formRelate} layout="vertical" initialValues={{ "article_id": "" }}>
                    <Form.Item name="tag_id" label="标签 ID" required>
                        <Input required disabled placeholder={`${targetTagId}`} />
                    </Form.Item>
                    <Form.Item name="article_id" label="文章 ID" required>
                        <Input required />
                    </Form.Item>
                </Form>
            </Modal>

            <Table
                columns={[
                    { title: "ID", key: "id", dataIndex: "id" },
                    { title: "名称", key: "name", dataIndex: "name" },
                    {
                        title: "操作",
                        key: "action", dataIndex: "id",
                        // eslint-disable-next-line react/display-name
                        render: (id: number): JSX.Element => (
                            <>
                                <Button onClick={(): void => { setModalRelate(true); setTargetTagId(id); formRelate.resetFields(); }}>
                                    关联
                                </Button>
                                <Button onClick={(): void => { setModalUpdate(true); setTargetTagId(id); formUpdate.resetFields(); }}>
                                    修改
                                </Button>
                                <Button onClick={(): void => handleDelete(id)} >
                                    删除
                                </Button>
                            </>
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
        const roleCode = parseInt(form.getFieldValue("role_code"));
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

    const handleDelete = (targetUserId: number): void => {
        Modal.confirm({
            title: `即将删除用户 id = ${targetUserId}`,
            okText: "确定",
            cancelText: "取消",
            onOk: async (): Promise<void> => {
                try {
                    await csr.deleteUser(sessionId, targetUserId);
                } catch (err) {
                    console.error(err);
                    message.error("操作失败");
                }

                await reload();
            }
        });
    };


    const [formUpdate] = Form.useForm();
    const [modalUpdate, setModalUpdate] = useState<boolean>(false);
    const [targetUserId, setTargetTagId] = useState<number | null>(null);

    const handleUpdate = async (): Promise<void> => {
        const roleCode = parseInt(formUpdate.getFieldValue("role_code"));

        if (targetUserId === null) {
            throw new Error("unexpected UI error");
        }
        setConfirmLoading(true);
        try {
            await csr.updateUser(sessionId, targetUserId, roleCode);
            setModalUpdate(false);
        } catch (err) {
            console.error(err);
            message.error("操作失败");
        }
        finally {
            setConfirmLoading(false);
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
                <Form form={form} layout="vertical"
                    initialValues={{ "role_code": 1, name: "", email: "", "avatar_url": "", "profile_url": "" }}
                >
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
            <Modal
                visible={modalUpdate}
                onCancel={(): void => setModalUpdate(false)}
                cancelText="取消"
                okText="确定"
                closable={false}
                confirmLoading={confirmLoading}
                onOk={handleUpdate}
            >
                <Form form={formUpdate} layout="vertical"
                    initialValues={{ "role_code": 1 }}
                >
                    <Form.Item name="id" label="ID" required>
                        <Input required disabled placeholder={`${targetUserId}`} />
                    </Form.Item>
                    <Form.Item name="role_code" label="角色代码" required>
                        <Input type="number" required />
                    </Form.Item>
                </Form>
            </Modal>
            <Table
                columns={[
                    { title: "ID", key: "id", dataIndex: "id" },
                    { title: "角色代码", key: "role_code", dataIndex: "role_code" },
                    { title: "昵称", key: "name", dataIndex: "name" },
                    { title: "邮箱", key: "email", dataIndex: "email" },
                    {
                        title: "头像", key: "avatar_url", dataIndex: "avatar_url",
                        // eslint-disable-next-line react/display-name
                        render: (avatarUrl: string): JSX.Element => (<Avatar src={avatarUrl} shape="square" />)
                    },
                    {
                        title: "主页", key: "profile_url", dataIndex: "profile_url",
                        // eslint-disable-next-line react/display-name
                        render: (profileUrl: string): JSX.Element => (<a href={profileUrl} target="_blank" rel="noopener noreferrer">{profileUrl}</a>)
                    },
                    {
                        title: "操作",
                        key: "action", dataIndex: "id",
                        // eslint-disable-next-line react/display-name
                        render: (id: number): JSX.Element => (
                            <>
                                <Button
                                    onClick={(): void => { setModalUpdate(true); setTargetTagId(id); formUpdate.resetFields(); }}
                                    disabled={id === userId}
                                >
                                    修改
                                </Button>
                                <Button onClick={(): void => handleDelete(id)} >
                                    删除
                                </Button>
                            </>
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
