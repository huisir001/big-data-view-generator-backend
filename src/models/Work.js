/*
 * @Description: 作品表
 * @Autor: HuiSir<273250950@qq.com>
 * @Date: 2021-02-28 20:31:17
 * @LastEditTime: 2021-03-01 23:00:58
 */
const { DB: dbcfg } = require('../../config') //配置文件
const Pool = require('./helper/mysql').getPool(dbcfg)
const DB = require('./helper/DB')

//如果类型为TEXT不能有默认值
//若字符串不确定长度，且不是很长，一般设为VARCHAR(255)

//Schema
const WorkSchema = {
    title: {
        // 标题
        type: 'VARCHAR(255)',
        default: "''",
        notNull: true,
    },
    page_options: {
        // 页面信息(JSON字符串)
        type: 'TEXT',
        notNull: true,
    },
    layers: {
        // 图层信息(JSON字符串)
        type: 'TEXT',
        notNull: true,
    },
    screenshot: {
        // 截图文件路径（相对于静态资源目录）
        type: 'VARCHAR(255)',
    },
    userid: {
        //关联用户
        type: 'VARCHAR(36)',
        notNull: true,
    },
    update_time: {
        // 更新时间
        type: 'DATETIME',
        default: 'CURRENT_TIMESTAMP', //默认当前时间
        notNull: true,
    },
    create_time: {
        type: 'DATETIME',
        default: 'CURRENT_TIMESTAMP', //默认当前时间
        notNull: true,
    },
}

//建表user_file
module.exports = new DB(Pool, 'work', WorkSchema)
