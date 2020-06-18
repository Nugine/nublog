import React from "react";

import { GithubOutlined, MailOutlined } from "@ant-design/icons";
import { css } from "emotion";
import { Card } from "antd";

import * as config from "../config";

const About: React.FC = () => {

    const containerStyleName = css`
        display: flex;
        flex-grow: 1;
        flex-direction:column;
        justify-content: center;
        align-items: center;

        a {
            color: black;
        }

        a:hover{
            text-decoration: underline;
        }

        span {
            margin-right: 0.5em;
        }
    `;

    return (
        <div className={containerStyleName}>
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
        </div>
    );
};

export default About;
