import React from "react";

type CenteredDivProps = React.PropsWithChildren<{ style: React.CSSProperties }>;

const CenteredDiv: React.FC<CenteredDivProps> = ({ children, style }: CenteredDivProps) => {
    const divStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        ...style
    };

    return (
        <div style={divStyle}>
            {children}
        </div>
    );
};

export default CenteredDiv;