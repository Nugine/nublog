# 在 openEuler 上运行 E2E 测试

## 创建云服务器

在华为云购买一台云服务器用来做临时测试。

规格选鲲鹏通用计算增强型，2核4G。（担心内存只给1G的话有可能跑不动编译器）

操作系统选 "openEuler 20.03 64bit with ARM"。

计费模式选按需计费，带宽选按流量计费。

## 设置 Rust 编译器

打开 <https://rustup.rs/>，复制命令，粘贴运行。

选择默认工具链 (aarch64-unknown-linux-gnu)，等待安装完成。

## 设置镜像源

这里选择上海交通大学镜像源 (SJTUG) <https://mirrors.sjtug.sjtu.edu.cn/>。

搜索 rust，点开帮助，复制粘贴配置。

搜索 crates，点开帮助，复制粘贴配置。

## 编译代码

没用交叉编译，怕踩坑，这里选择源码编译。

确认到环境中默认装了 git，然后把代码从 GitHub 上克隆下来。

```bash
git clone https://github.com/Nugine/s3-server.git
```

运行 `cargo fetch`，下载依赖。

运行 `cargo build --example s3`。


很不幸，编译报错了。

```
  Could not find directory of OpenSSL installation, and this `-sys` crate cannot
  proceed without this knowledge. If OpenSSL is installed and this crate had
  trouble finding it,  you can set the `OPENSSL_DIR` environment variable for the
  compilation process.
```

openSSL 没装，运行 `dnf install openssl-devel` 以安装。

继续 `cargo build --example s3`，编译成功。编译单元量为 251。（这真的是巧合）

![](./2020-09-29_22-19.png)

一次完整的 debug 模式编译需要 2 分 35 秒，release 模式需要 8 分 6 秒。

## 安装 docker

运行 `dnf install docker`，一切正常。

## 构建测试镜像

使用 minio 的 mint 作为端到端测试。

```shell
git clone https://github.com/minio/minio.git -b master --depth=1
```

根据 CI 脚本删除一部分测试组。

修改 Dockerfile.mint，换源。

```dockerfile
RUN  sed -i s@/ports.ubuntu.com/@/mirrors.ustc.edu.cn/@g /etc/apt/sources.list && apt-get clean
```

解决其他被墙的问题。

(1000 years later)

改好之后构建镜像。

```shell
docker build -t minio/mint . -f Dockerfile.mint
```

(2000 years later)

构建完成。

## 运行测试

启动 S3 服务。

```shell
mkdir /tmp/data
./scripts/s3-auth.sh /tmp/data
```

启动 mint 测试。

```shell
./scripts/mint.sh
```

debug 测试结果

```
Running with
SERVER_ENDPOINT:      localhost:8014
ACCESS_KEY:           AKIAIOSFODNN7EXAMPLE
SECRET_KEY:           ***REDACTED***
ENABLE_HTTPS:         0
SERVER_REGION:        us-east-1
MINT_DATA_DIR:        /mint/data
MINT_MODE:            core
ENABLE_VIRTUAL_STYLE: 0

To get logs, run 'docker cp 2483b738580b:/mint/log /tmp/mint-logs'

(1/2) Running mc tests ... done in 5 minutes and 33 seconds
(2/2) Running s3cmd tests ... done in 4 minutes and 12 seconds

All tests ran successfully
```

release 测试结果 （比 debug 快 20 ~ 25 倍）

```
Running with
SERVER_ENDPOINT:      localhost:8014
ACCESS_KEY:           AKIAIOSFODNN7EXAMPLE
SECRET_KEY:           ***REDACTED***
ENABLE_HTTPS:         0
SERVER_REGION:        us-east-1
MINT_DATA_DIR:        /mint/data
MINT_MODE:            core
ENABLE_VIRTUAL_STYLE: 0

To get logs, run 'docker cp 6b1e781741bb:/mint/log /tmp/mint-logs'

(1/2) Running mc tests ... done in 13 seconds
(2/2) Running s3cmd tests ... done in 12 seconds

All tests ran successfully
```

![](./2020-09-29%2022-11-09%20的屏幕截图.png)

