import React, { useEffect, } from "react";

import "../styles/global.css";
import "katex/dist/katex.min.css";

import * as config from "../config";
import { LINK_STYLE_NAME } from "../styles/local";
import * as vo from "../vo";
import * as csr from "../api/csr";
import * as state from "../state";

import { AppProps } from "next/app";
import Link from "next/link";
import Head from "next/head";

import "antd/dist/antd.css";
import { Layout, Col, Row, Space, Tooltip, Avatar } from "antd";
import { LoginOutlined, UserOutlined, } from "@ant-design/icons";
import { css } from "emotion";

const AppHeader: React.FC = () => {
    const [user, setUser, loadingState, withLoading] = state.useUserCtx();

    useEffect(() => {
        const sessionId = vo.getSessionId();
        if (sessionId) {
            if (!user) {
                withLoading(async () => {
                    setUser(await csr.getSelf(sessionId));
                }, (err) => {
                    console.error(err);
                });
            }
        }
    }, [withLoading, setUser, user]);

    return (
        <Row justify="space-between" className={LINK_STYLE_NAME}>
            <div style={{ fontSize: "1.5em" }}>
                <Link href="/">
                    <a>{config.site.title}</a>
                </Link>
            </div>
            <Space direction="horizontal">
                <Link href="/articles">
                    <a>
                        归档
                    </a>
                </Link>

                <Link href="/about">
                    <a>
                        关于
                    </a>
                </Link>

                {((): JSX.Element => {
                    if (loadingState === "success" && user) {
                        return (
                            <Link href="/home">
                                <a>
                                    <Avatar shape="square" src={user.avatar_url} size="small" icon={<UserOutlined/>}/>
                                </a>
                            </Link>
                        );
                    }
                    return (
                        <Link href="/home/login">
                            <a>
                                <Tooltip title="登录">
                                    <LoginOutlined />
                                </Tooltip>
                            </a>
                        </Link>
                    );
                })()}
            </Space>
        </Row>
    );
};

const AppFooter: React.FC = () => {
    const nowYear = new Date().getFullYear();
    const startYear = config.site.startYear;
    const time = (startYear >= nowYear) ? `${startYear}` : `${startYear} - ${nowYear}`;
    const copyright = `© ${time} ${config.site.author.nickName}.`;

    const styleName = css`
        width: 100%;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        font-size: 0.75em;

        p {
            margin: 0;
        }

        span {
            margin: 0 0.5em;
        }

        a {
            outline: 0;
            color: inherit;
        }

        a:hover {
            text-decoration: underline;
        }
    `;

    return (
        <div className={styleName}>
            <p><span>{copyright}</span></p>
            <p>
                <a target="_blank" rel="noreferrer" href={config.beian.icp.url}>
                    <span>{config.beian.icp.text}</span>
                </a>
                <a target="_blank" rel="noreferrer" href={config.beian.gov.url}>
                    <span>{config.beian.gov.text}</span>
                </a>
            </p>
        </div>
    );
};

const App: React.FC<AppProps> = ({ Component, pageProps }: AppProps) => {
    const layoutStyle = {
        minHeight: "100vh"
    };

    const headerStyle = {
        backgroundColor: "white",
        padding: "0 1.5em",
        borderBottom: "1px solid #eaeaea",
    };

    const centerStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        flexGrow: 1,
        backgroundColor: "white"
    };

    const footerStyle = {
        backgroundColor: "white",
        padding: "0.5em 0",
    };

    return (
        <>
            <Head>
                <link rel="icon" href="/favicon.ico"></link>
            </Head>
            <state.UserProvider>
                <Row justify="center" style={layoutStyle}>
                    <Col xs={24} sm={24} md={16} lg={16} xl={16} xxl={16}>
                        <Layout style={layoutStyle}>
                            <Layout.Header style={headerStyle}>
                                <AppHeader />
                            </Layout.Header>
                            <Layout.Content style={centerStyle}>
                                <Component {...pageProps} />
                            </Layout.Content>
                            <Layout.Footer style={footerStyle}>
                                <AppFooter />
                            </Layout.Footer>
                        </Layout>
                    </Col>
                </Row>
            </state.UserProvider>
        </>
    );
};

export default App;

