import React from "react";

import CenteredDiv from "../components/CenteredDiv";
import Head from "next/head";
import { generateTitle } from "../vo";



const Error404: React.FC = () => {
    return (
        <>
            <Head>
                <title>{generateTitle("404")}</title>
            </Head>
            <CenteredDiv style={{ marginTop: "1em" }}>
                <h1 style={{ textAlign: "center" }}>404</h1>
                <p>该页面不存在</p>
            </CenteredDiv>
        </>
    );
};

export default Error404;
