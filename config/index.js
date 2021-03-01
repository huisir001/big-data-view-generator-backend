/*
 * @Description: 项目配置
 * @Autor: HuiSir<273250950@qq.com>
 * @Date: 2020-11-08 23:25:42
 * @LastEditTime: 2021-02-25 21:07:21
 */
const fs = require('fs')
const ini = require('ini')
const { Log, Print } = require('../src/utils/logger') //日志

//读取配置文件
let MAIN_CONF,
    Main_PORT,
    Main_LOGIN_TIMEOUT,
    Main_StaticFolderDir,
    DBPort,
    DBName,
    DBPass,
    DBHost,
    DBUser,
    RedisHost,
    RedisPort,
    RedisPass,
    RedisDBIndex

try {
    //读取
    MAIN_CONF = ini.parse(fs.readFileSync('conf.ini', 'utf-8'))

    //查找配置项
    Main_PORT = MAIN_CONF.Main.port
    Main_LOGIN_TIMEOUT = MAIN_CONF.Main.loginTimeout
    Main_StaticFolderDir = MAIN_CONF.Main.staticFolderDir

    DBHost = MAIN_CONF.Database.host
    DBPort = MAIN_CONF.Database.port
    DBName = MAIN_CONF.Database.name
    DBUser = MAIN_CONF.Database.user
    DBPass = MAIN_CONF.Database.pass

    RedisHost = MAIN_CONF.Redis.host
    RedisPort = MAIN_CONF.Redis.port
    RedisPass = MAIN_CONF.Redis.pass
    RedisDBIndex = MAIN_CONF.Redis.DBIndex

    Print.info('配置文件读取成功')
} catch (error) {
    Log.warn('配置文件读取失败,将使用默认配置 ' + error.message)
}

module.exports = {
    /* 主域 */
    BASE_URL: 'http://127.0.0.1',

    /* 端口 */
    PORT: Main_PORT || 8080,

    /* 静态资源路径 */
    StaticFolderDir: Main_StaticFolderDir || 'resource',

    /* Mysql */
    DB: {
        host: DBHost || '127.0.0.1',
        port: DBPort || 3306,
        database: DBName || 'big-data-view-generator', //数据库名
        user: DBUser || 'root',
        password: DBPass || 'gongxiaohui',
        connectionLimit: 200, //连接数限制
        acquireTimeout: 30000, //连接超时
        multipleStatements: true, //允许传多条sql语句
    },

    /* Redis */
    Redis: {
        port: RedisPort || 6379, // Redis port
        host: RedisHost || '127.0.0.1', // Redis host
        ...(RedisPass ? { password: RedisPass } : {}), //密码
        db: RedisDBIndex || 0, //存到第一个数据库里，默认为0（第一个库），redis默认有16个库
    },

    /* 用户登陆过期时间为半小时（以秒计算） */
    LOGIN_TIMEOUT: Main_LOGIN_TIMEOUT || 60 * 30,

    /* api 开放白名单（无需验证token） */
    OPEN_API_LIST: [
        '/api/user/login',
        '/api/user/signup',
        '/file/visit',
        '/file/downloadOne',
        '/file/downloadZip',
    ],

    /* 接口请求成功返回数据格式 */
    RES: {
        succ(arg) {
            let resData
            if (typeof arg == 'string') {
                resData = {
                    ok: 1,
                    msg: arg,
                }
            } else {
                const { msg = '成功', data, token } = arg || {}
                resData = {
                    ok: 1,
                    msg: msg,
                    ...(data ? { data } : {}),
                    ...(token ? { token } : {}),
                }
            }
            return resData
        },
        fail(msg = '未知错误') {
            return {
                ok: 0,
                msg,
            }
        },
    },

    /* 错误信息 */
    ERR: {
        e200(msg = '请求失败') {
            let err = new Error(msg)
            err.status = 200
            throw err
        },
        e403(msg = '对不起，您暂未登陆') {
            let err = new Error(msg)
            err.status = 403
            throw err
        },
        e401(msg = '登陆超时') {
            let err = new Error(msg)
            err.status = 401
            throw err
        },
        e404(msg = '路径不存在') {
            let err = new Error(msg)
            err.status = 404
            throw err
        },
        e500(msg = '内部服务器错误') {
            let err = new Error(msg)
            err.status = 500
            throw err
        },
        e502(msg = '数据库错误') {
            let err = new Error(msg)
            err.status = 502
            throw err
        },
        e504(msg = '数据库请求超时') {
            let err = new Error(msg)
            err.status = 504
            throw err
        },
    },
}
