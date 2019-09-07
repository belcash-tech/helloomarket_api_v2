
const rp = require('request-promise-native')
const URL='https://helloomarket.com/api/getAllProducts.php'
const options = {url: URL, method:'get', json: true}
const _self = module.exports = {
    all_products: async() => {
        let categories = await _self.all_category_products()
        // let products = await _self.objectifier(categories)
        let products = await _self.flatten(categories)
        return products
    },
    all_category_products: () => {
        return new Promise((resolve, reject)=>{
            rp(options)
            .then(data => {
                resolve(data)
            })
            .catch(err => {
                reject(err)
            })
        })
    },
    find_product: async (product_id) => {
        let categories = await _self.all_category_products()
        let products = await _self.objectifier(categories)
        if(products.hasOwnProperty(product_id)){
            return products[product_id]
        }else {
            return {}
        }
    },
    flatten: (categories) => {
        let products=[]
        for(cat of categories) { 
            let ps=cat.products; 
            ps.map(p => { 
                let pg=Object.assign({},cat);
                delete pg.products
                p.category=pg; 
            }); 
            products=products.concat(ps)
        }
        return products
    },
    objectifier: async(categories) => {
        let products = await _self.flatten(categories)
        // const uTable = users.reduce((acc, it) => (acc[it.id] = it, acc), {})
        let id_products = await products.reduce((acc,it) => (acc[it.product_id]=it,acc),{})
        return id_products
    }
    
}
