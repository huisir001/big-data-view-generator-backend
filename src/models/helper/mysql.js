/*
 * @Description:
 * @Autor: HuiSir<273250950@qq.com>
 * @Date: 2021-02-22 11:40:02
 * @LastEditTime: 2021-02-23 21:14:13
 */

const mysql = require('mysql')
const { Print } = require('../../utils/logger') //日志

class Pool {
    constructor() {
        this.pools = {} //缓存池，可连多个ip
    }

    getPool(config) {
        //是否存在对应ip的连接池，不存在创建
        if (!this.pools.hasOwnProperty(config.host)) {
            const myPool = mysql.createPool(config)
            this.pools[config.host] = myPool
            Print.info(`数据库${config.database}连接池初始化成功`)
        }
        const myPool = this.pools[config.host]
        return myPool
    }
}

module.exports = new Pool()
