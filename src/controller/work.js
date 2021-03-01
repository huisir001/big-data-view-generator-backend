/*
 * @Description: 作品控制
 * @Autor: HuiSir<273250950@qq.com>
 * @Date: 2021-02-28 20:51:04
 * @LastEditTime: 2021-03-01 23:01:12
 */
const fs = require('fs')
const path = require('path')
const { StaticFolderDir, ERR, RES } = require('../../config') //配置
const { requireParamsStr, formatDate, makeDir } = require('../utils/myUtils') //工具
const WorkModel = require('../models/Work')

/**
 * @description: 创建作品
 * @param {string} title
 * @param {jsonstring} page_options
 * @param {jsonstring} layers
 * @return {*}
 * @author: HuiSir
 */
const Create = async (ctx) => {
    //通过中间件的传值拿到token中的user信息
    const { id: userid } = ctx.curUserInfo

    // 参数接受
    const Parames = ctx.request.body
    const { title, page_options, layers } = Parames

    //必传项验证
    const rPStr = requireParamsStr({ title, page_options, layers })
    if (rPStr) {
        ERR.e200(rPStr)
        return
    }

    // 创建
    const createRes = await WorkModel.create({ ...Parames, userid })

    if (createRes.id) {
        //返回结果
        ctx.response.body = RES.succ({
            msg: '创建成功',
            data: createRes,
        })
    } else {
        ctx.response.body = RES.fail()
    }
}

/**
 * @description: 通过id删除作品,可删除多个
 * @param {string} workId
 * @return {*}
 * @author: HuiSir
 */
const RemoveById = async (ctx) => {
    const { workId } = ctx.request.body //workId为逗号分隔的id字符串

    //必传项验证
    const rPStr = requireParamsStr({ workId })
    if (rPStr) {
        ERR.e200(rPStr)
        return
    }

    const workArr = workId.split(',')

    const { affectedRows, serverStatus } = await WorkModel.remove({
        id: workArr,
    })

    if (affectedRows == 0) {
        ERR.e200('作品不存在')
        return
    }

    if (serverStatus == 2) {
        ctx.response.body = RES.succ('删除成功')
    } else {
        ctx.response.body = RES.fail()
    }
}

/**
 * @description: 更新作品
 * @param {string} id
 * @param {string} title
 * @param {jsonstring} page_options
 * @param {jsonstring} layers
 * @param {base64String} screenshot
 * @return {*}
 * @author: HuiSir
 */
const Update = async (ctx) => {
    const Parames = ctx.request.body
    const { id, title, page_options, layers, screenshot } = Parames

    //必传项验证
    const rPStr = requireParamsStr({
        id,
        title,
        page_options,
        layers,
        screenshot,
    })
    if (rPStr) {
        ERR.e200(rPStr)
        return
    }

    // 截屏文件处理
    // 过滤data:URL前缀
    const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, '')
    // 转为Buffer数据
    const dataBuffer = Buffer.from(base64Data, 'base64')
    // 文件路径
    const filePath = `screenshot/${id}.${
        screenshot.split(';base64')[0].split('/')[1]
    }`
    // 检查screenshot文件夹是否存在如果不存在则新建文件夹(同步创建)
    makeDir(fs, path, path.join(`${StaticFolderDir}/screenshot/`))
    // 写入文件
    fs.writeFileSync(`${StaticFolderDir}/${filePath}`, dataBuffer)
    // 写完回调
    const { serverStatus } = await WorkModel.update(
        { id }, //where
        {
            ...Parames,
            screenshot: filePath,
            update_time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'), //更新时间
        } //update
    )

    if (serverStatus == 2) {
        ctx.response.body = RES.succ('保存成功')
    } else {
        ctx.response.body = RES.fail()
    }
}

/**
 * @description: 通过id查询单个作品
 * @param {*} id
 * @return {*}
 * @author: HuiSir
 */
const FindById = async (ctx) => {
    const { id } = ctx.request.query //get请求在query中取参

    //必传项验证
    const rPStr = requireParamsStr({ id })
    if (rPStr) {
        ERR.e200(rPStr)
        return
    }

    const res = await WorkModel.findOne({ id })

    if (res && res.id) {
        ctx.response.body = RES.succ({ data: res })
    } else {
        ERR.e200('查询失败')
    }
}

/**
 * @description: 通过id复制单个作品
 * @param {*} id
 * @return {*}
 * @author: HuiSir
 */
const CopyById = async (ctx) => {
    const { id } = ctx.request.body

    //必传项验证
    const rPStr = requireParamsStr({ id })
    if (rPStr) {
        ERR.e200(rPStr)
        return
    }

    // 查询
    const res = await WorkModel.findOne({ id }, '-id -update_time -create_time')

    // 复制
    const copy = await WorkModel.create({ ...res })

    if (copy.id) {
        //返回结果
        ctx.response.body = RES.succ({
            msg: '复制成功',
            data: copy,
        })
    } else {
        ctx.response.body = RES.fail()
    }
}

/**
 * @description: 通过用户id查询多个作品
 * @return {*}
 * @author: HuiSir
 */
const FindByUserid = async (ctx) => {
    //通过中间件的传值拿到token中的user信息
    const { id: userid } = ctx.curUserInfo

    const findRes = await WorkModel.find(
        { userid },
        '-layers -page_options',
        '-update_time'
    )

    ctx.response.body = RES.succ({ data: findRes })
}

module.exports = {
    Create,
    RemoveById,
    Update,
    FindById,
    CopyById,
    FindByUserid,
}
