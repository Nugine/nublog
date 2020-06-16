import React from "react";

import Link from "next/link";
import { css,cx } from "emotion";
import { UserOutlined } from "@ant-design/icons";

import * as config from "../config";

const Header: React.FC = () => {
    const containerStyleName = css`
        width: 100%;
        display: flex;
        justify-content: space-between;

        font-size: 16px;

        a {
            outline: 0;
            color: black;
            text-decoration: none;
        }

        a:hover{
            color: black;
            text-decoration: none;
        }
    `;

    const subStyleName = css`
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    const linksStyleName = css`
        a {
            margin-left: 0.5em;
        }
    `;

    return (
        <div className={containerStyleName}>
            <div className={subStyleName} style={{ fontSize: "1.25em" }}>
                <Link href="/">
                    <a>{config.site.title}</a>
                </Link>
            </div>

            <div className={cx(subStyleName,linksStyleName)} >
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
            </div>
        </div>
    );
};

export default Header;
