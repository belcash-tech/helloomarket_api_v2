const path = require('path')
const mysql = require('mysql2')
const config = require('dotenv').config({path: path.resolve('./config/.env')}).parsed
const bluebird = require('bluebird')
const _self = module.exports = {
    connection: async () => {
        try {
            let PoolPromise = mysql.createPool({
                connectionLimit: config.DB_CONNECTION_LIMIT,
                host: config.DB_HOSTNAME,
                port: config.DB_PORT,
                user: config.DB_USERNAME,
                password: config.DB_PASSWORD, 
                database: config.DB_DATABASE
            })
            let pool = PoolPromise.promise()
            return pool
        } catch (error) {
            throw new Error(JSON.stringify({ status: 'DB_CONNECTION_ERROR', message: error.message}))
        }
    },
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
            throw new Error(JSON.stringify({ status: 'DB_CONNECTION_ERROR', message: error.message}))
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
            throw new Error(JSON.stringify({ status: 'DB_CONNECTION_ERROR', message: error.message}))
        }
    },
    fetch_all_categories: async () => {
        try {
            let query=`SELECT occ.category_id,occ.image, ifnull(occd.name,concat('Category',occ.category_id)) as name,
            ifnull(occd.name_am, concat('ምድብ ',occ.category_id)) as name_am,ifnull(occd.description, concat('Description for category ', occ.category_id)) as description,
            ifnull(occd.description_am, concat('የምድብ ', occ.category_id, ' ዝርዝር መግለጫ')) as description_am
            FROM oc_category occ, oc_category_description occd
            WHERE occ.category_id=occd.category_id AND occd.language_id=1;`
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
    fetch_category: async (cat_id) => {
        try {
            let query=`SELECT occ.category_id,occ.image, ifnull(occd.name,concat('Category',occ.category_id)) as name,
            ifnull(occd.name_am, concat('ምድብ ',occ.category_id)) as name_am,ifnull(occd.description, concat('Description for category ', occ.category_id)) as description,
            ifnull(occd.description_am, concat('የምድብ ', occ.category_id, ' ዝርዝር መግለጫ')) as description_am
            FROM oc_category occ, oc_category_description occd
            WHERE occ.category_id=occd.category_id AND occd.language_id=1 AND occ.category_id=${cat_id}`
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
            return rows[0]
        } catch (error) {
            console.log(error)
            throw error
        }
    },
    fetch_column_names_of: async (table_name) => {
        try {
            let query = `select * from ${table_name} where 1=0 limit 1`
            console.log(`Query: ${query}`)
            let pool = await _self.connection()
            let [rows, fields] = await pool.query(query)
            let field_names= await fields.map(field => field.name)
            return field_names.sort()
        } catch (error) {
            throw error
        }
    }
}