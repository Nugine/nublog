import React, { useRef, useEffect } from "react";

import Prism from "../assets/js/prismjs/prism.js"; // custom bundle

import "katex";
import type { RenderMathInElementOptions } from "katex/dist/contrib/auto-render";
import renderMathInElement from "katex/dist/contrib/auto-render";

import MarkdownIt from "markdown-it";

export const katexOptions: RenderMathInElementOptions = {
    delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true },
        { left: "$", right: "$", display: false },
    ],
    errorColor: "#cc0000",
    throwOnError: false,
    strict: "ignore",
};

export interface MarkdownViewProps {
    source: string;
}

const MarkdownView: React.FC<MarkdownViewProps> = ({ source }: MarkdownViewProps) => {
    const innerHTML = new MarkdownIt().render(source);

    const divRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        setTimeout(() => {
            if (!divRef.current) { return; }
            Prism.highlightAllUnder(divRef.current, false);
            renderMathInElement(divRef.current, katexOptions);
        }, 0);
    }, []);

    return (
        <div
            ref={divRef}
            style={{ width: "100%" }}
            dangerouslySetInnerHTML={{ __html: innerHTML }}
        />
    );
};

export default MarkdownView;