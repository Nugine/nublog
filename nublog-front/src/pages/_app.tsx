import React from "react";

import "../styles/global.css";
import * as config from "../config";
import { LINK_STYLE_NAME } from "../util";

import { AppProps } from "next/app";
import Link from "next/link";

import "antd/dist/antd.css";
import { Layout, Col, Row, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { css } from "emotion";

const AppHeader: React.FC = () => {
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
                        文章
                    </a>
                </Link>

                <Link href="/about">
                    <a>
                        关于
                    </a>
                </Link>

                <Link href="/home">
                    <a>
                        <UserOutlined />
                    </a>
                </Link>
            </Space>
        </Row>
    );
};

const AppFooter: React.FC = () => {
    const nowYear = new Date().getFullYear();
    const startYear = config.site.startYear;
    const time = startYear < nowYear ? `${startYear}` : `${startYear} - ${nowYear}`;
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
    );
};

export default App;

