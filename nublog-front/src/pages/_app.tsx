import React from "react";

import { AppProps } from "next/app";
import { Layout, Col, Row } from "antd";

import "antd/dist/antd.css";

import Footer from "../components/Footer";
import Header from "../components/Header";

import "../style/style.css";

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
                        <Header />
                    </Layout.Header>
                    <Layout.Content style={centerStyle}>
                        <Component {...pageProps} />
                    </Layout.Content>
                    <Layout.Footer style={footerStyle}>
                        <Footer />
                    </Layout.Footer>
                </Layout>
            </Col>
        </Row>
    );
};

export default App;