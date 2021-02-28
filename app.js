/*
 * @Description: 中间层入口(中间件)
 * @Autor: HuiSir<273250950@qq.com>
 * @Date: 2020-11-08 23:25:42
 * @LastEditTime: 2021-02-26 00:26:51
 */

const Koa = require('koa')
const app = new Koa()
const fs = require('fs')
const path = require('path')
const koaBody = require('koa-body')
const cors = require('koa2-cors') //解决跨域中间件
const isDev = process.argv.includes('--dev') //开发环境
const filter = require('./src/filter') //过滤器
const router = require('./src/router') //路由
const { StaticFolderDir, RES } = require('./config') //配置
const { Log, Print } = require('./src/utils/logger') //日志
const { formatDate, makeDir } = require('./src/utils/myUtils') //工具

//允许跨域
if (isDev) {
    app.use(cors())
    //打印日志
    Print.info('已配置跨域')
}

//配置返回格式 & 错误捕获
app.use(async (ctx, next) => {
    try {
        //返回格式,默认添加charset=utf-8
        //对象默认为application/json，故此处可不配置
        //后续有特例可重置
        ctx.response.type = 'application/json'
        await next()
    } catch (err) {
        //前台捕获
        const status = err.statusCode || err.status || 500
        ctx.response.status = status
        ctx.response.type = 'application/json'
        ctx.response.body = RES.fail(err.message) //返回错误
        //后台捕获
        const statusWhiteList = [401, 403, 404, 200]
        if (!statusWhiteList.includes(status)) ctx.app.emit('error', err, ctx) //如果错误被try...catch捕获，就不会触发error事件，故需要使用emit方法
    }
})

/* 过滤器 */
app.use(filter)

/* 入参 */
/* 注意以下路径不使用dirname是由于pkg打包后的程序不支持，目前使用相对路径 */
/* 静态资源文件夹由配置文件返回StaticFolderDir */
app.use(
    koaBody({
        multipart: true, //支持文件上传
        formidable: {
            //文件上传配置
            uploadDir: path.join(`${StaticFolderDir}/upload/`), // 设置文件上传目录
            keepExtensions: true, // 保持文件的后缀
            maxFieldsSize: 2 * 1024 * 1024, //文件体积最大值2M(默认值2 * 1024 * 1024)
            multipart: true, //支持多文件上传
            onFileBegin: (_, file) => {
                // 文件上传之前处理

                //配置文件保存路径（存到当前月文件夹中）
                const curMonthStr = formatDate(Date.now(), 'yyyyMM')
                const dir = path.join(
                    `${StaticFolderDir}/upload/${curMonthStr}/`
                )

                // 检查文件夹是否存在如果不存在则新建文件夹
                makeDir(fs, path, dir)

                //配置文件名称及后缀
                const setfileName = Date.now() + path.extname(file.name)

                // 重置 file.path 属性，改变文件上传目录
                file.path = dir + setfileName

                //增加属性便于存储和访问(path为绝对路径不安全)
                file.uploadPath = `upload/${curMonthStr}/${setfileName}`
            },
        },
        onError: (err) => {
            throw err
        },
    })
)

//启动路由
app.use(router.routes())

//打印日志
Print.info('路由启动成功')

//后台错误捕获
app.on('error', (err) => {
    Log.error(err.message)
})

module.exports = app
