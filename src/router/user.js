/*
 * @Description: 用户接口层
 * @Autor: HuiSir<273250950@qq.com>
 * @Date: 2020-11-10 16:30:00
 * @LastEditTime: 2021-02-28 22:45:01
 */
const Router = require('@koa/router')
const {
    Signup,
    Login,
    GetUserInfo,
    Logout,
    ResetPass,
    AllUser,
    OnlineUsers,
    RemoveUsersById,
    GetUserNum,
} = require('../controller/user')

const {
    UploadFiles,
    RemoveFilesById,
    UpdateFile,
    FindFilesByUserid,
} = require('../controller/userFile')

// 创建路由实例，设置前缀
const router = new Router({ prefix: '/api/user' })

// 注册路由接口
router
    .post('/signup', Signup)
    .post('/login', Login)
    .get('/getUserInfo', GetUserInfo)
    .post('/logout', Logout)
    .post('/resetPass', ResetPass)
    .post('/removeUsers', RemoveUsersById)
    .get('/allUser', AllUser)
    .get('/onlineUsers', OnlineUsers)
    .get('/getUserNum', GetUserNum)
    .post('/uploadFiles', UploadFiles)
    .post('/removeFilesById', RemoveFilesById)
    .post('/updateFile', UpdateFile)
    .get('/findFilesByUserid', FindFilesByUserid)

module.exports = router
