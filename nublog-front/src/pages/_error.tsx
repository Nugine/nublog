import React from "react";

import CenteredDiv from "../components/CenteredDiv";
import Head from "next/head";
import { generateTitle } from "../vo";

const Error500: React.FC = () => {
    return (
        <>
            <Head>
                <title>{generateTitle("错误")}</title>
            </Head>
            <CenteredDiv style={{ marginTop: "1em" }}>
                <h1 style={{ textAlign: "center" }}>500</h1>
                <p>网站发生错误</p>
            </CenteredDiv>
        </>
    );
};

export default Error500;
