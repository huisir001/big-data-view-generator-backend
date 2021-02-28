/*
 * @Description: 用户文件Model
 * @Autor: HuiSir<273250950@qq.com>
 * @Date: 2021-02-26 09:14:39
 * @LastEditTime: 2021-02-26 11:57:48
 */
const { DB: dbcfg } = require('../../config') //配置文件
const Pool = require('./helper/mysql').getPool(dbcfg)
const DB = require('./helper/DB')

//如果类型为TEXT不能有默认值
//若字符串不确定长度，且不是很长，一般设为VARCHAR(255)

//Schema
const UserFileSchema = {
    name: {
        //文件名，包含后缀
        type: 'VARCHAR(255)',
        notNull: true,
        default: "''",
    },
    path: {
        //文件路径（相对于静态资源目录）
        type: 'VARCHAR(50)',
        notNull: true,
        default: "''",
    },
    size: {
        //文件大小
        type: 'INT',
        notNull: true,
    },
    type: {
        //文件类型
        type: 'VARCHAR(255)',
    },
    userid: {
        //关联用户
        type: 'VARCHAR(36)',
        notNull: true,
    },
    built_in: {
        //是否内置，默认否
        type: 'TINYINT',
        default: 0,
    },
    create_time: {
        type: 'DATETIME',
        default: 'CURRENT_TIMESTAMP', //默认当前时间
        notNull: true,
    },
}

//建表user_file
module.exports = new DB(Pool, 'user_file', UserFileSchema)
