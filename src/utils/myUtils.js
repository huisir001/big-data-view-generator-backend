/*
 * @Description: 工具
 * @Autor: HuiSir<273250950@qq.com>
 * @Date: 2021-02-24 11:27:51
 * @LastEditTime: 2021-02-25 17:30:42
 */

/**
 * @description: 必传项提示字符串转义
 * @param {object} requireParams
 * @return {string/boolean}
 * @author: HuiSir
 */
exports.requireParamsStr = (requireParams) => {
    let lackParams = []
    for (let key in requireParams) {
        requireParams[key] || lackParams.push(key)
    }
    if (lackParams.length > 0) {
        return `缺失参数：\'${lackParams.join("','")}\'`
    } else {
        return false
    }
}

/**
 * @description: 时间格式化
 * @param {*} timeStamp
 * @param {*} timeType
 * @return {*}
 * @author: HuiSir
 */
exports.formatDate = (timeStamp, timeType) => {
    //统一按24小时制
    if (
        !timeStamp instanceof Date &&
        timeStamp.constructor.name != 'String' &&
        timeStamp.constructor.name != 'Number'
    ) {
        throw new Error(`Type check failed for argument "${timeStamp}".`)
    }
    const date =
        timeStamp instanceof Date ? timeStamp : new Date(parseInt(timeStamp))
    const getFullNum = (num) => (num < 10 ? '0' + num : num) //小于两位补零
    const format = {
        yyyy: date.getFullYear(),
        M: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        m: date.getMinutes(),
        s: date.getSeconds(),
        MM: getFullNum(date.getMonth() + 1),
        dd: getFullNum(date.getDate()),
        hh: getFullNum(date.getHours()),
        mm: getFullNum(date.getMinutes()),
        ss: getFullNum(date.getSeconds()),
        day: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
    }
    let reformat = function (typeStr, str) {
        if (typeStr.includes(str) && typeStr.split(str).length - 1 == 1) {
            return typeStr.replace(str, format[str])
        } else {
            return typeStr
        }
    }

    let result
    for (let key in format) {
        result = reformat(result || timeType || 'yyyy-MM-dd', key)
    }
    return result
}

/**
 * @description: fs同步创建多级目录
 * @param {*} fs
 * @param {*} path
 * @param {*} dirpath 使用path转换的路径,如path.join()来转
 * @return {*}
 * @author: HuiSir
 */
exports.makeDir = (fs, path, dirpath) => {
    if (!fs.existsSync(dirpath)) {
        var pathtmp
        dirpath.split(path.sep).forEach((dirname) => {
            if (pathtmp) {
                pathtmp = path.join(pathtmp, dirname)
            } else {
                //如果在linux系统中，第一个dirname的值为空，所以赋值为"/"
                if (dirname) {
                    pathtmp = dirname
                } else {
                    pathtmp = '/'
                }
            }
            if (!fs.existsSync(pathtmp)) {
                fs.mkdirSync(pathtmp)
            }
        })
    }
}
