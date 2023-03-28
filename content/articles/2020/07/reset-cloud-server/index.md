---
postDate: "2020-07-28"
---

# 云服务器重置实录

## 备份重置

1. 使用 rsync 拉取重要数据
2. 在云服务控制台中制作系统盘快照
3. 注销网站证书
4. 在云服务控制台中重装系统

## 初始化

1. 重置 root 密码
2. 使用 ssh-copy-id 命令上传 ssh 密钥
3. 更换 sshd 端口

    ```
    su
    netstat -tnlp
    vim /etc/ssh/sshd_config
    service sshd restart
    netstat -tnlp
    ```

4. 更新系统

    ```
    apt update
    apt upgrade
    ```


## 设置环境

### nginx

```
apt install nginx
netstat -tnlp
curl localhost
```

### nodejs

1. 安装 nvm (<https://github.com/nvm-sh/nvm#git-install>)

    ```
    git clone -b master --depth=1 https://github.com/nvm-sh/nvm.git .nvm
    cd .nvm
    source nvm.sh
    nvm install --lts
    ```

    按示例修改 .bashrc

2. 换用淘宝源

    ```
    npm config set registry https://registry.npm.taobao.org
    ```

3. 安装 yarn

    ```
    npm install -g yarn
    ```

4. 安装 pm2

    ```
    yarn global add pm2
    ```

### acme.sh

<https://github.com/acmesh-official/acme.sh/wiki/How-to-install#3-or-git-clone-and-install>

以 root 用户安装

## 建立网站

+ 前端 next
+ 后端 rust
+ 缓存 redis
+ 数据库 pgsql

### pgsql

安装

<https://www.postgresql.org/download/linux/ubuntu/>

```
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install postgresql
```

在配置中更换端口，开放外部连接，以便调试

```
cd /etc/postgresql/12/main/
sudo vim postgresql.conf
sudo vim pg_hba.conf
```

启动服务

```
sudo systemctl start postgresql@12-main
sudo netstat -tnlp
```

通过超级用户新建数据库，新建对应角色并授权。

最后使用本地 PgAdmin 管理远程数据库。

### redis

```
sudo apt install redis
```

### 后端

1. 本地编译 release 版本
2. 使用 scp 命令上传
3. 写好配置文件
4. 用后端初始化 sql 来设置数据库
5. 使用 pm2 启动 server

### 前端

1. 上传源码
2. `yarn install`
3. 写好配置文件
4. 使用 pm2 启动 next 的 SSR

### nginx

1. 先写个最简配置

    ```
    server {
      listen 80;
      root /var/www/html/;
      server_name nugine.xyz;
    }
    ```

2. 申请证书

    ```
    su
    acme.sh --issue -d nugine.xyz --nginx
    ```

3. 复制/链接 证书文件

4. 写完整配置

    ```
    server {
        listen 80;
        server_name nugine.xyz;
        return 301 https://nugine.xyz$request_uri;
    }

    server{
        listen 443 http2;
        server_name nugine.xyz;
        
        ssl on;
        ssl_certificate /etc/nginx/certs/nugine.xyz/fullchain.cer;
        ssl_certificate_key /etc/nginx/certs/nugine.xyz/nugine.xyz.key;

        location / {
            proxy_pass http://localhost:3001;
        }

        location /api/ {
            rewrite ^/api/(.*)$ /$1 break;
            proxy_pass http://localhost:6001;
        }

        access_log /etc/nginx/log/nugine.xyz/access.log;
        error_log /etc/nginx/log/nugine.xyz/error.log;
    }
    ```

## 总结

折腾一次实在是太累了。
