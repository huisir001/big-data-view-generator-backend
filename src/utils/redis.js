/*
 * @Description: redis连接
 * @Autor: HuiSir<273250950@qq.com>
 * @Date: 2020-11-09 09:59:34
 * @LastEditTime: 2021-02-22 11:33:43
 */
const Redis = require('ioredis') //此模块已将redis封装为promise
const { Redis: cfg } = require('../../config') //配置文件
const { Print } = require('./logger') //日志

//创建连接
const newRedis = new Redis(cfg)

//打印日志
newRedis.on('connect', () => {
    Print.info('Redis连接成功')
})

//输出
module.exports = newRedis
