import React, { useState, useEffect } from "react";

import { Tabs, Row, Space, Comment as AntdComment, Avatar, Button, Input, List, Col, message } from "antd";
import { css } from "emotion";
import { GithubOutlined } from "@ant-design/icons";

import *  as vo from "../vo";
import * as csr from "../api/csr";

export interface AdminProps {
    user: vo.User;
}

const Admin: React.FC<AdminProps> = ({ user }: AdminProps) => {
    return (
        <Tabs>
            <Tabs.TabPane tab="文章管理" key="articles-manage">
                文章管理
            </Tabs.TabPane>
            <Tabs.TabPane tab="标签管理" key="tags-manage">
                标签管理
            </Tabs.TabPane>
            <Tabs.TabPane tab="评论管理" key="comments-manage">
                评论管理
            </Tabs.TabPane>
            <Tabs.TabPane tab="用户管理" key="users-manage">
                用户管理
            </Tabs.TabPane>
        </Tabs>
    );
};

export default Admin;
