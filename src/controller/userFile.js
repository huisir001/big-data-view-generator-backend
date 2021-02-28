/*
 * @Description: 用户文件
 * @Autor: HuiSir<273250950@qq.com>
 * @Date: 2021-02-26 10:08:44
 * @LastEditTime: 2021-02-28 22:59:16
 */
const fs = require('fs')
const { StaticFolderDir, ERR, RES } = require('../../config') //配置
const { requireParamsStr } = require('../utils/myUtils') //工具
const UserFileModel = require('../models/UserFile')

/**
 * @description: 上传用户文件
 * @param {file} file 可多选上传
 * @param {number/boolean} built_in 是否内置,0/1
 * @return {*}
 * @author: HuiSir
 */
const UploadFiles = async (ctx) => {
    //通过中间件的传值拿到user
    const { id: userid } = ctx.curUserInfo
    const { file } = ctx.request.files
    const { builtIn = 0 } = ctx.request.body //是否内置（管理员）

    //必传项验证
    const rPStr = requireParamsStr({ file })
    if (rPStr) {
        ERR.e200(rPStr)
        return
    }

    /* 判断file是单文件还是多文件 */
    let fileArrData
    if (file instanceof Array) {
        fileArrData = file.map((item) => {
            return {
                name: item.name,
                path: item.uploadPath,
                size: item.size,
                type: item.type,
                userid,
                built_in: builtIn ? 1 : 0,
            }
        })
    } else {
        fileArrData = [
            {
                name: file.name,
                path: file.uploadPath,
                size: file.size,
                type: file.type,
                userid,
                built_in: builtIn ? 1 : 0,
            },
        ]
    }

    //更新数据库
    const createRes = await UserFileModel.createMany(fileArrData)

    //响应
    if (createRes && createRes instanceof Array && createRes.length > 0) {
        ctx.response.body = RES.succ({ data: createRes, msg: '上传成功' })
    } else {
        ERR.e200('上传失败')
    }
}

/**
 * @description: 通过id删除文件,可删除多个
 * @param {string} fileIds 逗号隔开
 * @return {*}
 */
const RemoveFilesById = async (ctx) => {
    const { fileIds } = ctx.request.body

    //必传项验证
    const rPStr = requireParamsStr({ fileIds })
    if (rPStr) {
        ERR.e200(rPStr)
        return
    }

    const fileIdsArr = fileIds.split(',')

    const removeRes = await UserFileModel.remove(
        {
            id: fileIdsArr,
        },
        true,
        'path'
    )

    if (removeRes.length == 0) {
        ERR.e200('文件不存在')
        return
    }

    //删除盘内文件
    removeRes.forEach((item) => {
        const fileDir = `${StaticFolderDir}/${item.path}` //文件路径
        fs.unlinkSync(fileDir)
    })

    ctx.response.body = RES.succ('删除成功')
}

/**
 * @description: 修改文件
 * @param {string} id 必传项
 * @param {string} name 可选，文件名称
 * @param {string} userid 可选
 * @return {*}
 */
const UpdateFile = async (ctx) => {
    const { id, name, userid } = ctx.request.body

    //必传项验证
    const rPStr = requireParamsStr({ id })
    if (rPStr) {
        ERR.e200(rPStr)
        return
    }

    const { serverStatus } = await UserFileModel.update(
        { id }, //where
        {
            ...(name ? { name } : {}),
            ...(userid ? { userid } : {}),
        } //update
    )

    if (serverStatus == 2) {
        ctx.response.body = RES.succ('修改成功')
    } else {
        ctx.response.body = RES.fail()
    }
}

/**
 * @description: 用userid查文件(非内置文件built_in=0)
 * @return {*}
 */
const FindFilesByUserid = async (ctx) => {
    //通过中间件的传值拿到user
    const { id: userid } = ctx.curUserInfo

    const findRes = await UserFileModel.find(
        { userid, built_in: 0 },
        '-built_in'
    )

    ctx.response.body = RES.succ({ data: findRes })
}

module.exports = {
    UploadFiles,
    RemoveFilesById,
    UpdateFile,
    FindFilesByUserid,
}
