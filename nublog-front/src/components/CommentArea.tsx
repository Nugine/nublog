import React from "react";

import { Card, Row, Space, Typography } from "antd";
import Link from "next/link";
import { css } from "emotion";

import *  as vo from "../vo";

const CommentEditor: React.FC = () => {
    return (
        <div>评论编辑器</div>
    );
};

export type CommentAreaProps = {};

const CommentArea: React.FC<CommentAreaProps> = (props: CommentAreaProps) => {
    return (
        <div>
            <CommentEditor />
            <div>评论区</div>
        </div>
    );
};

export default CommentArea;