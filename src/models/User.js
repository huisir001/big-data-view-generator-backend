/*
 * @Description: 用户Model
 * @Autor: HuiSir<273250950@qq.com>
 * @Date: 2021-02-22 17:10:21
 * @LastEditTime: 2021-02-26 14:45:26
 */
const { DB: dbcfg } = require('../../config') //配置文件
const Pool = require('./helper/mysql').getPool(dbcfg)
const DB = require('./helper/DB')

//注意：数据库字段习惯用下划线，不用驼峰
//若字符串不确定长度，且不是很长，一般设为VARCHAR(255)

//Schema（模式/架构）对象
const UserSchema = {
    username: {
        type: 'VARCHAR(255)', //数据类型（mysql基本数据类型）
        notNull: true, //NOT NULL
    },
    password: {
        type: 'VARCHAR(255)',
        notNull: true,
    },
    sex: {
        type: 'TINYINT', //0为女性，1为男性
        default: 0, //默认值
        //default: `'str'`, //若默认值为字符串则带单引号
    },
    state: {
        type: 'TINYINT', //小整数
        default: 0,
    },
    create_time: {
        type: 'DATETIME',
        default: 'CURRENT_TIMESTAMP', //默认当前时间
        notNull: true,
    },
}

module.exports = new DB(Pool, 'user', UserSchema)
