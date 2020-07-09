import React from "react";

export type TargetBlankAProps = React.PropsWithChildren<{
    href: string;
    style?: React.CSSProperties;
}>;

const TargetBlankA: React.FC<TargetBlankAProps> = ({ href, style, children }: TargetBlankAProps) => {
    return <a href={href} style={style} rel="noopener noreferrer" target="_blank">{children}</a>;
};

export default TargetBlankA;
