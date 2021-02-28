/*
 * 文件下载
 * @Description: 这里是公共的下载接口。若有特殊下载可在其他controller中单独写
 * @Autor: HuiSir<273250950@qq.com>
 * @Date: 2020-11-28 12:39:40
 * @LastEditTime: 2021-02-25 22:59:21
 */

const fs = require('fs')
const path = require('path')
const archiver = require('archiver') //文件打包插件
const { StaticFolderDir, ERR, RES } = require('../../config') //配置
const contentTypes = require('../utils/contentType.json') //常用contentType对照表
const { requireParamsStr, makeDir } = require('../utils/myUtils') //工具

/**
 * @description: 下载单个文件（指定静态资源文件夹中的文件）
 * @param {string} filePath 相对与StaticFolderDir的路径（后台返回）
 * @return {*}
 * @author: HuiSir
 * 这个接口是否验证token，看是否放到白名单。若放到白名单，前端可以直接访问路径下载，无需ajax
 */
const DownloadOne = async (ctx) => {
    //get请求，拿到下载路径
    const { filePath } = ctx.request.query

    //必传项验证
    const rPStr = requireParamsStr({ filePath })
    if (rPStr) {
        ERR.e200(rPStr)
        return
    }

    const path = `${StaticFolderDir}/${filePath}`

    //判断路径是否存在，不存在直接返回
    if (!fs.existsSync(path)) {
        return
    }

    //判断路径是否为文件，若为文件夹，则返回
    const stat = fs.lstatSync(path)
    if (stat.isDirectory()) {
        return
    }

    //此方法修改相应头的`Content-Disposition`为`attachment`类型，意为附件下载
    ctx.attachment(path)

    //以流的形式返回前端
    ctx.response.body = fs.createReadStream(path)
}

/**
 * @description: 直接访问文件（一般用于图片的前端展示）\白名单，无需验证token
 * @return {*}
 * @author: HuiSir
 */
const Visit = async (ctx) => {
    //动态路由取参合并
    const filePath = Object.keys(ctx.params)
            .sort()
            .map((key) => ctx.params[key])
            .join('/'),
        visitPath = `${StaticFolderDir}/${filePath}`

    //判断路径是否存在，不存在直接返回
    if (!fs.existsSync(visitPath)) {
        return
    }

    //判断路径是否为文件，若为文件夹，则返回
    const stat = fs.lstatSync(visitPath)
    if (stat.isDirectory()) {
        return
    }

    //这里需要设置content-type,否则前端接收的文件无法识别
    ctx.response.type = contentTypes[`.${filePath.split('.').pop()}`]

    //以流的形式返回前端
    ctx.response.body = fs.createReadStream(visitPath)
}

/**
 * @description: 打包下载文件（由于打包涉及到文件操作，这里不能为白名单，必须验证token），若不考虑安全问题，也可以用get请求
 * @param {string} filePaths 逗号分隔路径,这里可能打包的文件较多，由于get请求query长度限制，所以要用post方法
 * @return {*}
 * @author: HuiSir
 */
const DownloadZip = async (ctx) => {
    //获取参数(若为get请求，则在query中取)
    //filePaths为逗号分隔的路径字符串
    const filePaths = ctx.request.query.filePaths || ctx.request.body.filePaths

    //必传项验证
    const rPStr = requireParamsStr({ filePaths })
    if (rPStr) {
        ERR.e200(rPStr)
        return
    }

    const zipDir = `${StaticFolderDir}/zip/${Date.now()}.zip` //打包文件路径

    // 检查zip缓存文件夹是否存在如果不存在则新建文件夹(同步创建)
    makeDir(fs, path, path.join(`${StaticFolderDir}/zip/`))

    //创建一最终打包文件的输出流
    const zipWriteStream = fs.createWriteStream(zipDir)

    //生成archiver对象，打包类型为zip
    const zipArchiver = archiver('zip')

    //将打包对象关联写入流（这里类同与读取流的pipe方法，虽然暂时没有文件，但会创建空的zip包）
    zipArchiver.pipe(zipWriteStream)

    //将被打包文件的流依次添加进archiver对象中
    filePaths.split(',').forEach((filePath) => {
        const fullPath = `${StaticFolderDir}/${filePath}`
        //判断路径是否存在
        if (fs.existsSync(fullPath)) {
            //判断路径是否为文件夹，若为文件夹，则整体打包
            const stat = fs.lstatSync(fullPath)
            if (stat.isDirectory()) {
                zipArchiver.directory(fullPath, false) //false不打包路径
            } else {
                zipArchiver.append(fs.createReadStream(fullPath), {
                    name: filePath, //必传项，包内文件路径
                })
            }
        }
    })

    //确认打包
    //promise方法，需要等待打包完成,否则返回前台的是空包
    await zipArchiver.finalize()

    //修改响应头为附件下载
    ctx.attachment(zipDir)

    //转发前台，由于流文件是异步打包，需要等待全部打包完毕,并不是边打包边下载
    ctx.response.body = fs.createReadStream(zipDir)

    //下载完后删除文件(这里只有等待下载完成才会执行删除，无需再监听)
    fs.unlinkSync(zipDir)
}

module.exports = {
    DownloadOne,
    DownloadZip,
    Visit,
}
