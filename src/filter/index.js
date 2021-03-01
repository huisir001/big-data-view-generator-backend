/*
 * @Description: 访问过滤器
 * @Autor: HuiSir<273250950@qq.com>
 * @Date: 2021-02-23 10:44:43
 * @LastEditTime: 2021-02-26 13:29:43
 */
const { OPEN_API_LIST, ERR, LOGIN_TIMEOUT } = require('../../config') //引入api白名单及错误抛出配置
const UserModel = require('../models/User') //用户Model
const { decodeToken } = require('../utils/encryptToken') //token解析
const redis = require('../utils/redis') //redis

module.exports = async (ctx, next) => {
    //白名单api直接跳过
    if (OPEN_API_LIST.find((item) => ctx.originalUrl.includes(item))) {
        await next()
        return
    }

    //非API路由阻断
    if (
        ctx.originalUrl.slice(0, 4) !== '/api' &&
        ctx.originalUrl.slice(0, 5) !== '/file'
    ) {
        return
    }

    //获取请求头中的token
    const token = ctx.headers.token
    if (!token) {
		ERR.e403()
        return
    }

    //这里判断token是否合法
    const { userid, loginTime } = decodeToken(token)
    if (!userid || userid.length != 36) {
        ERR.e403()
        return
    }

    //与数据库比对是否有此用户
    const user = await UserModel.findOne({ id: userid })
    if (!user) {
        ERR.e403('用户不存在')
        return
    }

    //使用userid去redis中查询，如果存在且相同，则重置过期时间，next()，如果不存在或不同，则已过期
    const redisToken = await redis.get(userid)
    if (!redisToken || redisToken != token) {
        ERR.e403('抱歉，您的登陆已过期')
    } else {
        await redis.expire(userid, LOGIN_TIMEOUT) //重置过期时间
        ctx.curUserInfo = { ...user, loginTime } //通过ctx向子路由传值
        await next()
    }
}
