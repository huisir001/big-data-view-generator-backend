/*
 * @Description: 路由中间件（中转）
 * @Autor: HuiSir<273250950@qq.com>
 * @Date: 2020-11-09 09:59:34
 * @LastEditTime: 2021-02-25 16:16:30
 */

const Router = require('@koa/router')
const router = new Router()

/* 路由 */
const User = require('./user')
const File = require('./file')

// 启动路由和中间件
router.use(User.routes(), User.allowedMethods())
router.use(File.routes(), File.allowedMethods())

module.exports = router
