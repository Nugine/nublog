import React from "react";

import { css } from "emotion";

import * as config from "../config";

const Footer: React.FC = () => {
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

export default Footer;
