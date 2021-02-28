/*
 * @Description: 用户控制层
 * @Autor: HuiSir<273250950@qq.com>
 * @Date: 2020-11-09 09:59:34
 * @LastEditTime: 2021-02-28 22:56:19
 */

const { LOGIN_TIMEOUT, ERR, RES } = require('../../config') //配置
const { creatToken, encrypt } = require('../utils/encryptToken') //加密
const { requireParamsStr } = require('../utils/myUtils') //工具
const redis = require('../utils/redis') //redis缓存
const UserModel = require('../models/User')

/*
 * POST请求头数据格式须为：multipart/form-data、x-www-form-urlencoded 或 application/json 才能使用ctx.request.body接收
 * get请求query数据使用ctx.query或ctx.request.query直接获取对象，无需转义querystring
 */

/**
 * @description: 注册，密码进行加密
 * @param {string} username require
 * @param {string} password require
 * @param {string} sex
 * @return {*}
 */
const Signup = async (ctx) => {
    let postData = ctx.request.body //post数据
    const { username, password } = postData
    //这里默认账号密码验证在前端完成

    //必传项验证
    const rPStr = requireParamsStr({ username, password })
    if (rPStr) {
        ERR.e200(rPStr)
        return
    }

    let findRes = await UserModel.findOne({ username }) //比对

    if (!findRes) {
        //不存在
        postData.password = encrypt(password) //密码加密
        const createRes = await UserModel.create(postData, '-password') //新增,不返回密码
        //返回结果
        ctx.response.body = RES.succ({
            msg: '注册成功',
            data: createRes,
        })
    } else {
        ERR.e200('用户名已存在')
    }
}

/**
 * @description: 登录
 * @param {string} username require
 * @param {string} password require
 * @return {*}
 */
const Login = async (ctx) => {
    let { username, password } = ctx.request.body

    //必传项验证
    const rPStr = requireParamsStr({ username, password })
    if (rPStr) {
        ERR.e200(rPStr)
        return
    }

    //与数据库比对
    const res = await UserModel.findOne(
        { username, password: encrypt(password) },
        '-password'
    )

    if (res) {
        const token = creatToken(res.id)

        //这里将token存到redis(key为userid，value为token)
        //一个用户只有一条缓存，便于查询当前登陆用户数
        //注意配置失效时间
        const saveToken = await redis.set(res.id, token, 'EX', LOGIN_TIMEOUT)

        //缓存成功则返回，否则报错
        if (saveToken == 'OK') {
            ctx.response.body = RES.succ({ data: res, token, msg: '登录成功' })
        } else {
            ctx.response.body = RES.fail()
        }
    } else {
        ERR.e401('用户名或密码错误')
    }
}

/**
 * @description: 通过token获取用户信息
 * @return {*}
 */
const GetUserInfo = async (ctx) => {
    //通过中间件的传值拿到用户信息，这里拷贝一下
    const userInfo = JSON.parse(JSON.stringify(ctx.curUserInfo))

    //删除不需要的字段
    delete userInfo.password
    delete userInfo.loginTime

    //响应
    ctx.response.body = RES.succ({ data: userInfo })
}

/**
 * @description: 注销登陆
 * @return {*}
 */
const Logout = async (ctx) => {
    //通过中间件的传值拿到token中的user信息，这里无需再次解析token
    const { id: userid } = ctx.curUserInfo

    //将用户从redis中删除
    const delToken = await redis.del(userid)

    //删除成功则返回，否则报错
    if (delToken == '1') {
        ctx.response.body = RES.succ('注销登陆成功')
    } else {
        ctx.response.body = RES.fail()
    }
}

/**
 * @description: 修改密码（重置密码后将登陆状态变为未登陆）
 * @param {string} oldPass require
 * @param {string} newPass require
 * @return {*}
 */
const ResetPass = async (ctx) => {
    //通过中间件的传值拿到token中的user信息，这里无需再次解析token
    const { id: userid, password: rightOldPass } = ctx.curUserInfo

    const { oldPass, newPass } = ctx.request.body

    //必传项验证
    const rPStr = requireParamsStr({ oldPass, newPass })
    if (rPStr) {
        ERR.e200(rPStr)
        return
    }

    //比对旧密码
    if (oldPass !== rightOldPass) {
        ERR.e200('旧密码不正确')
        return
    }

    if (oldPass === newPass) {
        ERR.e200('新密码不能与旧密码相同')
        return
    }

    //密码格式校验(可前端校验)
    //...

    //修改密码
    const resetPass = await UserModel.update(
        { id: userid },
        { password: encrypt(newPass) }
    )

    if (resetPass.changedRows == 1) {
        //将用户从redis中删除,登陆状态变为未登陆
        const delToken = await redis.del(userid)

        if (delToken == '1') {
            ctx.response.body = RES.succ('修改密码成功')
        } else {
            ctx.response.body = RES.fail()
        }
    }
}

/**
 * @description: 所有用户
 * @return {*}
 */
const AllUser = async (ctx) => {
    //注意：这里必须使用await形式将异步转换为同步，要不然不能够返回数据
    let users = await UserModel.find({}, '-password')
    ctx.response.body = RES.succ({ data: users })
    //处理错误在app.js中使用了中间件，这里不需要再次捕获
}

// 当前在线用户 GET (获取当前redis缓存中的用户)
const OnlineUsers = async (ctx) => {
    //查询缓存userid
    const getRedisUsers = await redis.keys('*') //用户数组

    //读取user数据(多值查询)
    let users = await UserModel.find({ id: getRedisUsers }, '-password')

    ctx.response.body = RES.succ({ data: users })
}

/**
 * @description: 通过id删除用户,可删除多个
 * @param {string} userids 逗号隔开
 * @return {*}
 */
const RemoveUsersById = async (ctx) => {
    const { userids } = ctx.request.body //userids为逗号分隔的id字符串

    //必传项验证
    const rPStr = requireParamsStr({ userids })
    if (rPStr) {
        ERR.e200(rPStr)
        return
    }

    const usersArr = userids.split(',')

    const { affectedRows, serverStatus } = await UserModel.remove({
        id: usersArr,
    })

    if (affectedRows == 0) {
        ERR.e200('用户不存在')
        return
    }

    if (serverStatus == 2) {
        ctx.response.body = RES.succ('删除成功')
    } else {
        ctx.response.body = RES.fail()
    }
}

/**
 * @description: 获取用户总数
 * @return {*}
 */
const GetUserNum = async (ctx) => {
    const userNumRes = await UserModel.count()
    if (userNumRes && userNumRes.hasOwnProperty('count')) {
        ctx.response.body = RES.succ({ data: userNumRes })
    } else {
        ctx.response.body = RES.fail()
    }
}

module.exports = {
    Signup,
    Login,
    GetUserInfo,
    Logout,
    AllUser,
    ResetPass,
    OnlineUsers,
    RemoveUsersById,
    GetUserNum,
}
