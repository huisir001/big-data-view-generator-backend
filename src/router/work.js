/*
 * @Description: 作品接口路由
 * @Autor: HuiSir<273250950@qq.com>
 * @Date: 2021-02-28 20:42:03
 * @LastEditTime: 2021-03-01 23:00:48
 */

const Router = require('@koa/router')
const {
    Create,
    RemoveById,
    Update,
    FindById,
    CopyById,
    FindByUserid,
} = require('../controller/work')

// 创建路由实例，设置前缀
const router = new Router({ prefix: '/api/work' })

// 注册路由接口
router
    .post('/create', Create)
    .post('/removeById', RemoveById)
    .post('/update', Update)
    .post('/copyById', CopyById)
    .get('/findById', FindById)
    .get('/findByUserid', FindByUserid)

module.exports = router
