import React from "react";

import Link from "next/link";
import { css } from "emotion";
import { UserOutlined } from "@ant-design/icons";

import * as config from "../config";
import { Row, Space } from "antd";

const Header: React.FC = () => {
    const linksStyleName = css`
        a {
            color: black;
        }

        a:hover{
            text-decoration: underline;
        }
    `;

    return (
        <Row justify="space-between">
            <div style={{ fontSize: "1.5em" }}>
                <Link href="/">
                    <a style={{ color: "black", }}>{config.site.title}</a>
                </Link>
            </div>
            <Space direction="horizontal" className={linksStyleName}>
                <Link href="/articles">
                    <a>文章</a>
                </Link>

                <Link href="/tags">
                    <a>标签</a>
                </Link>

                <Link href="/about">
                    <a>关于</a>
                </Link>

                <Link href="/my">
                    <a><UserOutlined /></a>
                </Link>
            </Space>
        </Row>
    );
};

export default Header;
