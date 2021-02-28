# big-data-view-generator-backend

## 介绍

大数据视图生成器后端程序

使用 koa+mysql 开发 NodeJS 后端服务器

## 环境支持

需要预先安装 mysql 及 redis，并配置全局环境变量

## api 接口文件夹说明

1. 此文件夹放置前台请求的接口模块
2. 小项目的话，可以只有一级路由，也就是一个接口一个路由文件（接口名和路由名相同）
3. 大项目的话，可能会存在子路由，可以分出子路由文件夹，或者一个路由文件中编写多个子路由的代码
4. 涉及到接口安全性问题：一般不做开放型接口，通过 token 判断登陆状态。只有登陆后接口才能跑通，否则返回 403 错误（请求被拒绝）
5. 若 token 失效，则返 401 错误
7. 执行 pkg 打包时，注意先去 https://github.com/vercel/pkg-fetch/releases 下载对应 pkg-fetch 资源，下载后替换`C:\Users\Administrator\.pkg-cache\vx.x`目录下相应文件（需改名）

## Build Setup

```bash
# install dependencies
npm install

# serve with hot reload at http://127.0.0.1:8080
npm run dev

# test with hot reload at http://yourhost.com:8888
npm run pro-test

# build for win development at http://127.0.0.1:8080
npm run pkg-win-dev

# build for win production
npm run pkg-win

# build for linux OS production
npm run pkg-linux

# build for mac OS production
npm run pkg-macos
```

## pkg 打包后执行说明

1. 打包后生成的可执行文件可直接在相应的操作系统中运行，但可能会打开终端在前台执行，不会在后台执行。
2. 程序启动后会在相应目录生成 `logs` 文件夹用于存放日志文件，生成 `conf.ini` 配置文件用来对程序进行配置。
3. 如果操作系统中安装了 `node` 环境，可以使用 pm2 来执行和管理程序，如 `pm2 satart xxx.exe`。
4. linux 操作系统没有 node 环境，想要在后台执行程序，终端执行 `nohup 程序路径 &`
5. win 操作系统没有 node 环境，想要在后台执行程序，执行 `npm run pkg-win` 打包后，会另外生成 `nohub.vbs` 脚本，直接执行即可。关闭执行 `close.vbs`
6. 生产环境打包后会生成配置文件 `conf.ini` 请注意配置。
