import React from "react";

import Head from "next/head";

import { GithubOutlined, MailOutlined } from "@ant-design/icons";
import { css, cx } from "emotion";
import { Card, Row } from "antd";

import * as config from "../config";
import { LINK_STYLE_NAME } from "../styles/local";
import TargetBlankA from "../components/TargetBlankA";
import * as vo from "../vo";

const About: React.FC = () => {

    const containerStyleName = cx(
        LINK_STYLE_NAME,
        css`
            span {
                margin-right: 0.5em;
            }

            p {
                font-size: 1.25em;
            }
        `
    );

    return (
        <>
            <Head>
                <title>{vo.generateTitle("关于")}</title>
            </Head>
            <Row justify="center" className={containerStyleName}>
                <Card bordered={false}>
                    <p>
                        <span><GithubOutlined /></span>
                        <TargetBlankA href={config.site.author.githubUrl}>
                            {config.site.author.githubUrl}
                        </TargetBlankA>
                    </p>
                    <p>
                        <span><MailOutlined /></span>
                        <TargetBlankA href={`mailto:${config.site.author.email}`}>
                            {config.site.author.email}
                        </TargetBlankA>
                    </p>
                </Card>
            </Row>
        </>
    );
};

export default About;
