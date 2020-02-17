const path = require('path')
const mysql = require('mysql2')
const config = require('dotenv').config({
    path: path.resolve('./config/.env')
}).parsed
const bluebird = require('bluebird')
const _util = require('underscore')
const htmlReplacePattern = /<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi
const _base_url = 'https://helloomarket.com'
//=[_base_url,'media/300',product.thumbnail].join('/')
const poolConfig = {
    connectionLimit: config.DB_CONNECTION_LIMIT,
    host: config.DB_HOSTNAME,
    port: config.DB_PORT,
    user: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    typeCast: function (field, next) {
        // console.log(field)
        if (field.type == "DECIMAL" || field.type == "NEWDECIMAL") {
            var value = field.string();
            return (value === null) ? null : Number(value);
        }
        return next();
    }
}
const _self = module.exports = {
    find_product_by_id: async (product_id) => {
        try {
            let query = `SELECT * FROM view_normalized_products where product_id =${product_id}`
            let PoolPromise = mysql.createPool(poolConfig)
            let pool = PoolPromise.promise()
            let [rows, fields] = await pool.query(query)
            return rows
        } catch (error) {
            throw error
        }
    },
    find_product_by_model: async (model) => {
        try {
            let query = `SELECT * FROM view_normalized_products where model =${model}`
            let PoolPromise = mysql.createPool(poolConfig)
            let pool = PoolPromise.promise()
            let [rows, fields] = await pool.query(query)
            return rows
        } catch (error) {
            throw error
        }
    },
    products: async () => {
        try {
            // let query = `SELECT * FROM view_normalized_products`
            let query = `select vnp.*, pj.categories from view_normalized_products vnp inner join view_product_categories_json pj on vnp.product_id = pj.product_id`
            // console.log(query)
            let PoolPromise = mysql.createPool(poolConfig)
            let pool = PoolPromise.promise()
            let [rows, fields] = await pool.query(query)
            rows.map((p) => {
                p.thumbnail = p.image.split('/')[1];
                p.thumbnail = [_base_url, 'media/300', p.thumbnail].join('/');
            });
            rows.map(c => {
                // console.log(c.categories);

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
            let today = Date.now()
            let aday = 86400000
            if (since === undefined) {
                since = (new Date(today - (aday * 7))).toISOString().slice(0, 10);
            }

            let query = `SELECT * FROM view_normalized_products where date(product_updated_at) between date('${since}') and date(NOW())`
            // console.log(query)
            let PoolPromise = mysql.createPool(poolConfig)
            let pool = PoolPromise.promise()
            let [rows, fields] = await pool.query(query)
            rows.map((p) => {
                p.thumbnail = p.image.split('/')[1];
                p.thumbnail = [_base_url, 'media/300', p.thumbnail].join('/');
            });
            rows.map(c => {
                // console.log(c)
                c.category_id = c.category_id.toString();
                c.product_id = c.product_id.toString();
                c.manufacturer_id = c.manufacturer_id.toString();
                c.description = (_util.unescape(c.description)).replace(htmlReplacePattern, '')
                    .replace(/(&amp)/gim, ' and ')
                    .replace(/(&nbsp;)*/gim, '')
                    .replace(/\r?\n|\r/g, '')
                    .trim();
            })

            return rows
        } catch (error) {
            console.log(error)
            throw error
        }
    },
    categories_changed_since: async (since) => {
        try {
            let today = Date.now()
            let aday = 86400000
            if (since === undefined) {
                since = (new Date(today - (aday * 7))).toISOString().slice(0, 10);
            }
            //let query=`SELECT * FROM view_category_changes where date(category_updated_at) between date('${since}') and date(NOW())`
            let query = `SELECT category_id,image,name ,name_am,description,description_am,category_created_at,category_updated_at  FROM view_normalized_categories where date(category_updated_at) between date('${since}') and date(NOW())`
            let PoolPromise = mysql.createPool(poolConfig)
            let pool = PoolPromise.promise()
            let [rows, fields] = await pool.query(query)
            rows.map(c => {
                c.category_id = c.category_id.toString();
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
            let query = `SELECT category_id,image,name ,name_am,description,description_am,category_created_at,category_updated_at  FROM view_normalized_categories`
            //console.log(query)
            let PoolPromise = mysql.createPool(poolConfig)
            let pool = PoolPromise.promise()
            let [rows, fields] = await pool.query(query)
            rows.map(c => {
                c.category_id = c.category_id.toString();
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
            let query = `select * from view_normalized_products order by product_created_at desc limit 10;`
            let PoolPromise = mysql.createPool(poolConfig)
            let pool = PoolPromise.promise()
            let [rows, fields] = await pool.query(query)
            rows.map(d => {
                // console.log(d);
                d.product_id = d.product_id.toString();
                d.category_id = d.category_id.toString();
                d.manufacturer_id = d.manufacturer_id.toString();
		            d.thumbnail = d.image.split('/')[1];
                d.thumbnail = [_base_url, 'media/300', d.thumbnail].join('/');
                d.description = (_util.unescape(d.description).replace(htmlReplacePattern, ''))
                    .replace(/(&nbsp;)/gim, ' ')
                    .replace(/(nbsp;)/gim, ' ')
                    .replace(/(nbsp)/gim, ' ')
                    .replace(/\r?\n|\r/g, '')
                    .replace(/\S+/, ' ')
                    .trim();
            });
            return rows
        } catch (error) {
            console.log(error)
            throw error
        }
    },
    bestselling_products: async(count=10) => {
      try {
          let query = `select * from view_normalized_products order by RAND() limit ${count};`
          let PoolPromise = mysql.createPool(poolConfig)
          let pool = PoolPromise.promise()
          let [rows, fields] = await pool.query(query)
          rows.map(d => {
            d.manufacturer_id = d.manufacturer_id.toString();
            d.thumbnail = d.image.split('/')[1];
            d.thumbnail = [_base_url, 'media/300', d.thumbnail].join('/');
            d.description = (_util.unescape(d.description).replace(htmlReplacePattern, ''))
                .replace(/(&nbsp;)/gim, ' ')
                .replace(/(nbsp;)/gim, ' ')
                .replace(/(nbsp)/gim, ' ')
                .replace(/\r?\n|\r/g, '')
                .replace(/\S+/, ' ')
                .trim();
          })
          return rows;
      } catch (error) {
          console.log(error)
          throw error
      }

    },
    discounted_products: async(count=10) => {
      try {
          let query = `select * from view_normalized_products order by RAND() limit ${count};`
          let PoolPromise = mysql.createPool(poolConfig)
          let pool = PoolPromise.promise()
          let [rows, fields] = await pool.query(query)
          rows.map(d => {
            d.discount = {
              rate: parseFloat(Math.random().toFixed(2))
            };
            d.manufacturer_id = d.manufacturer_id.toString();
            d.thumbnail = d.image.split('/')[1];
            d.thumbnail = [_base_url, 'media/300', d.thumbnail].join('/');
            d.description = (_util.unescape(d.description).replace(htmlReplacePattern, ''))
                .replace(/(&nbsp;)/gim, ' ')
                .replace(/(nbsp;)/gim, ' ')
                .replace(/(nbsp)/gim, ' ')
                .replace(/\r?\n|\r/g, '')
                .replace(/\S+/, ' ')
                .trim();
          });
          console.log(Object.keys(pool))
          return rows;
      } catch (error) {
          console.log(error)
          throw error
      }
    }
}
