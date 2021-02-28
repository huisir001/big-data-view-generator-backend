/*
 * @Description: 文件下载接口
 * @Autor: HuiSir<273250950@qq.com>
 * @Date: 2020-11-10 16:30:00
 * @LastEditTime: 2021-02-25 22:51:26
 */
const Router = require('@koa/router')
const { DownloadOne, Visit, DownloadZip } = require('../controller/file')

// 创建路由实例，设置前缀
const router = new Router({ prefix: '/file' })

// 注册路由接口
router
    .get('/downloadOne', DownloadOne) //白名单下载
    .get('/downloadOneSafe', DownloadOne) //安全下载单个文件，需要验证token
    .get('/visit/:p1', Visit) //直接访问文件（一般用于图片展示）参数使用`ctx.params`取
    .get('/visit/:p1/:p2', Visit) //以下给足最多4级目录
    .get('/visit/:p1/:p2/:p3', Visit)
    .get('/visit/:p1/:p2/:p3/:p4', Visit)
    .get('/downloadZip', DownloadZip) //打包下载文件
    .get('/downloadZipSafe', DownloadZip) //打包下载文件(安全)
    .post('/downloadZipSafe', DownloadZip) //打包下载文件(安全)

module.exports = router
