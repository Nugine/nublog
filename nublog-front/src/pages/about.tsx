import React from "react";

import { GithubOutlined, MailOutlined } from "@ant-design/icons";
import { css, cx } from "emotion";
import { Card, Row } from "antd";

import * as config from "../config";
import { LINK_STYLE_NAME } from "../styles/local";

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
        <Row justify="center" className={containerStyleName}>
            <Card bordered={false}>
                <p>
                    <span><GithubOutlined /></span>
                    <a href={config.site.author.githubUrl} rel="noopener noreferrer" target="_blank">{config.site.author.githubUrl}</a>
                </p>
                <p>
                    <span><MailOutlined /></span>
                    <a href={`mailto:${config.site.author.email}`} rel="noopener noreferrer" target="_blank">{config.site.author.email}</a>
                </p>
            </Card>
        </Row>
    );
};

export default About;
