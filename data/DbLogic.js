const path = require('path')
const mysql = require('mysql2')
const config = require('dotenv').config({path: path.resolve('./config/.env')}).parsed
const bluebird = require('bluebird')
module.exports = {
    products_changed_since: async (since) => {
        try {
            let query=`SELECT * FROM view_product_changes where date(product_updated_at) between date('${since}') and date(NOW())`
            console.log(query)
            let PoolPromise = mysql.createPool({
                connectionLimit: config.DB_CONNECTION_LIMIT,
                host: config.DB_HOSTNAME,
                port: config.DB_PORT,
                user: config.DB_USERNAME,
                password: config.DB_PASSWORD, 
                database: config.DB_DATABASE
            })
            let pool = PoolPromise.promise()
            let [rows, fields] = await pool.query(query)
            return rows
        } catch (error) {
            console.log(error)
            throw error
        }
    },
    categories_changed_since: async (since) => {
        try {
            let query=`SELECT * FROM view_category_changes where date(category_updated_at) between date('${since}') and date(NOW())`
            console.log(query)
            let PoolPromise = mysql.createPool({
                connectionLimit: config.DB_CONNECTION_LIMIT,
                host: config.DB_HOSTNAME,
                port: config.DB_PORT,
                user: config.DB_USERNAME,
                password: config.DB_PASSWORD, 
                database: config.DB_DATABASE
            })
            let pool = PoolPromise.promise()
            let [rows, fields] = await pool.query(query)
            return rows
        } catch (error) {
            console.log(error)
            throw error
        }
    }
}