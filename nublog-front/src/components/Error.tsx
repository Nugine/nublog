import React, { useEffect } from "react";
import { Row } from "antd";

export interface ErrorProps {
    statusCode: number;
    title: string;
    description: string;
}

const Error: React.FC<ErrorProps> = ({ statusCode, title, description }: ErrorProps) => {
    useEffect(() => {
        const prev = document.title;
        document.title = `${statusCode}: ${title}`;
        return (): void => { document.title = prev; };
    }, [statusCode, title]);

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h1>{statusCode}</h1>
            <p>{description}</p>
        </div>
    );
};

export default Error;