const path = require('path')
const mysql = require('mysql2')
const config = require('dotenv').config({path: path.resolve('./config/.env')}).parsed
const bluebird = require('bluebird')
const _util = require('underscore')
const htmlReplacePattern = /<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi
const _base_url= 'https://helloomarket.com'
//=[_base_url,'media/300',product.thumbnail].join('/')
module.exports = {
    products: async () => {
        try {
            let query=`SELECT * FROM view_normalized_products`
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
            rows.map((p) => { 
                p.thumbnail=p.image.split('/')[1];
                p.thumbnail=[_base_url,'media/300',p.thumbnail].join('/');
            });
	    rows.map(c => {
                c.description = (_util.unescape(c.description)).replace(htmlReplacePattern, '')
                .replace(/(&amp)/gim, ' and ')
                .replace(/(&nbsp;)*/gim, '')
                .replace(/\r?\n|\r/g, '')
                .trim()
            })

            return rows
        } catch (error) {
            console.log(error)
            throw error
        }
    },
    products_changed_since: async (since) => {
        try {
	    let today=Date.now()
  	    let aday=86400000
	    if(since=== undefined) { since = (new Date(today-(aday*7))).toISOString().slice(0,10); }

            let query=`SELECT * FROM view_normalized_products where date(product_updated_at) between date('${since}') and date(NOW())`
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
            rows.map((p) => { 
                p.thumbnail=p.image.split('/')[1];
                p.thumbnail=[_base_url,'media/300',p.thumbnail].join('/');
            });
	    rows.map(c => {
                c.description = (_util.unescape(c.description)).replace(htmlReplacePattern, '')
                .replace(/(&amp)/gim, ' and ')
                .replace(/(&nbsp;)*/gim, '')
                .replace(/\r?\n|\r/g, '')
                .trim()
            })

            return rows
        } catch (error) {
            console.log(error)
            throw error
        }
    },
    categories_changed_since: async (since) => {
        try {
	    let today=Date.now()
	    let aday=86400000
	    if(since=== undefined) { since = (new Date(today-(aday*7))).toISOString().slice(0,10); }
            //let query=`SELECT * FROM view_category_changes where date(category_updated_at) between date('${since}') and date(NOW())`
	    let query=`SELECT category_id,image,name ,name_am,description,description_am,category_created_at,category_updated_at  FROM view_normalized_categories where date(category_updated_at) between date('${since}') and date(NOW())`

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
	    rows.map(c => {
                c.description = (_util.unescape(c.description)).replace(htmlReplacePattern, '')
                .replace(/(&amp)/gim, ' and ')
                .replace(/(&nbsp;)*/gim, '')
                .replace(/\r?\n|\r/g, '')
                .trim()
            })

            return rows
        } catch (error) {
            console.log(error)
            throw error
        }
    },
    categories: async () => {
        try {
            let query=`SELECT category_id,image,name ,name_am,description,description_am,category_created_at,category_updated_at  FROM view_normalized_categories`
            //console.log(query)
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
            rows.map(c => {
                c.description = (_util.unescape(c.description)).replace(htmlReplacePattern, '')
                .replace(/(&amp)/gim, ' and ')
                .replace(/(&nbsp;)*/gim, '')
                .replace(/\r?\n|\r/g, '')
                .trim()
            })
            return rows
        } catch (error) {
            console.log(error)
            throw error
        }
    },

    recent_products: async () => {
    try {
        let query=`select * from view_product_changes order by product_created_at desc limit 10;`
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
        rows.map(
            d => 
            d.description = (_util.unescape(d.description)
            .replace(htmlReplacePattern, ''))
            .replace(/(&nbsp;)/gim, ' ')
            .replace(/(nbsp;)/gim, ' ')
            .replace(/(nbsp)/gim, ' ')
            .replace(/\r?\n|\r/g, '')
            .replace(/\S+/, ' ')
            .trim()
        );
        return rows          
    }catch (error) {
        console.log(error)
        throw error
    }
    }
}
