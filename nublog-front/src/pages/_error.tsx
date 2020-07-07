import React from "react";

import CenteredDiv from "../components/CenteredDiv";

const Error500: React.FC = () => {
    return (
        <CenteredDiv style={{ marginTop: "1em" }}>
            <h1 style={{ textAlign: "center" }}>500</h1>
            <p>网站发生错误</p>
        </CenteredDiv>
    );
};

export default Error500;
