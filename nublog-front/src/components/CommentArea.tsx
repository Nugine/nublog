import React, { useState, useEffect } from "react";

import { Row, Space, Comment as AntdComment, Avatar, Button, Input, List, Col, message } from "antd";
import { css } from "emotion";
import { GithubOutlined } from "@ant-design/icons";

import *  as vo from "../vo";
import * as csr from "../api/csr";

export interface CommentEditorProps {
    user: vo.User | null;
    onCreateComment: (content: string) => void;
    onCancelReply: () => void;
    replyToName: string | null;
}

const CommentEditor: React.FC<CommentEditorProps> = ({ user, onCreateComment, onCancelReply, replyToName }: CommentEditorProps) => {
    const [comment, setComment] = useState<string>("");

    let ele: JSX.Element | null = null;
    if (user) {
        ele = (
            <Row justify="center" style={{ alignItems: "center" }}>
                <Space style={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1 }}>
                    <a href={user.profile_url} rel="noreferrer noopener" target="_blank">
                        <Avatar shape="square" src={user.avatar_url} />
                    </a>
                    <span style={{ fontSize: "1.25em" }}>{user.name}</span>
                    <Input style={{ flexGrow: 1 }}
                        onChange={(e): void => setComment(e.target.value)}
                        addonBefore={replyToName ? (
                            <span style={{ cursor: "pointer" }} onClick={onCancelReply}>{`回复 @${replyToName}`}</span>
                        ) : null}
                    />
                    <Button type="default" size="large" onClick={(): void => onCreateComment(comment)} disabled={comment.length == 0}>发表评论</Button>
                </Space>
            </Row>
        );

    } else {
        const handleLogin = (): void => {
            localStorage.setItem("goback-path", document.location.pathname);
            document.location.pathname = "/api/users/auth/login";
        };

        ele = (
            <Row justify="center">
                <Button type="default" size="large" icon={<GithubOutlined />} onClick={handleLogin}>登录</Button>
            </Row>
        );
    }

    return ele;
};

export interface CommentAreaProps {
    articleId: number;
}

const CommentArea: React.FC<CommentAreaProps> = ({ articleId }: CommentAreaProps) => {
    const [user, setUser] = useState<vo.User | null>(null);

    const [comments, setComments] = useState<vo.Comment[] | null>(null);

    const [replyTo, setReplyTo] = useState<number | null>(null);


    useEffect(() => {
        const sessionId = localStorage.getItem("x-session-id");
        if (sessionId) {
            const f = async (): Promise<void> => {
                try {
                    const user = await csr.getSelf(sessionId);
                    setUser(user);
                } catch (err) {
                    console.error(err);
                    message.error("加载失败");
                }
            };
            f();
        }

        const loadComments = async (): Promise<void> => {
            try {
                const ans = await csr.getArticleComments(articleId);
                setComments(ans);
            } catch (err) {
                console.error(err);
                message.error("加载失败");
            }
        };

        loadComments();
    }, [articleId]);

    const handleCreateComment = async (content: string): Promise<void> => {
        const sessionId = vo.getSessionId();
        if (sessionId && user) {
            try {
                const id = await csr.createComment(sessionId, articleId, user.id, content, replyTo);
                setComments(prev => {
                    const newComment: vo.Comment = {
                        id,
                        "article_id": articleId,
                        "user_id": user.id,
                        content,
                        "reply_to": replyTo,
                        "user_name": user.name,
                        "user_avatar_url": user.avatar_url,
                        "create_at": new Date().toISOString()
                    };
                    if (prev) {
                        return [newComment, ...prev];
                    } else {
                        return [newComment];
                    }
                });
            } catch (err) {
                console.error(err);
                message.error("操作失败");
            }
        }
    };

    const handleReply = (commentId: number): void => {
        setReplyTo(commentId);
    };

    const handleDelete = async (commentId: number): Promise<void> => {
        const sessionId = vo.getSessionId();
        if (sessionId) {
            try {
                await csr.deleteComment(sessionId, commentId);
                setComments(prev => prev === null ? null : prev.filter(c => c.id !== commentId));
            } catch (err) {
                console.error(err);
                message.error("操作失败");
            }
        }
    };

    const replyToName = replyTo !== null ?
        ((comments ?? []).find(c => c.id === replyTo)?.user_name ?? null)
        : null;

    const isAdmin = user?.role_code === 0;

    return (
        <>
            <CommentEditor
                user={user}
                onCreateComment={handleCreateComment}
                onCancelReply={(): void => setReplyTo(null)}
                replyToName={replyToName}
            />
            <Row justify="center">
                <Col span={24} lg={16}>
                    <List style={{ width: "100%" }}>
                        {(comments ?? []).map(comment => {
                            const replyToName = (comments ?? []).find(c => c.id === comment.reply_to)?.user_name;

                            const canDelete = (isAdmin || user?.id === comment.id) && (!(comments ?? []).find(c => c.reply_to === comment.id));

                            return (
                                < AntdComment
                                    key={comment.id}
                                    datetime={vo.fmtTimeDetail(new Date(comment.create_at))}
                                    avatar={
                                        <Avatar
                                            src={comment.user_avatar_url}
                                            shape="square"
                                            className={css`img {border-radius:2px !important;}`}
                                        />
                                    }
                                    author={comment.user_name}
                                    content={
                                        <>
                                            {replyToName ? (<span>回复 @{replyToName}：</span>) : null}
                                            <span>{comment.content}</span>
                                        </>
                                    }
                                    actions={[
                                        (<span key="replyTo" onClick={(): void => handleReply(comment.id)}>回复</span>),
                                        canDelete ? (<span key="deleteComment" onClick={(): Promise<void> => handleDelete(comment.id)}>删除</span>) : null
                                    ]}
                                />
                            );
                        })}
                    </List>
                </Col>
            </Row>
        </>
    );
};

export default CommentArea;