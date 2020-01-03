
const rp = require('request-promise-native')
const URL='https://helloomarket.com/api/getAllProducts.php'
const options = {url: URL, method:'get', json: true}
const _image_url='https://helloomarket.com/image'
const _base_url ='https://helloomarket.com'
const _self = module.exports = {
  categories: async() => {
    let categories = await _self.all_category_products()
    let sanitized = await categories.filter(cat => delete cat.products)
    return sanitized
  },
  find_category: async (category_id) => {
    let categories = await _self.categories()
    let category_response = {}
    await categories.filter(category => {
      if(category.category_id === category_id){
        category_response=category
        return category_response
      }
    })
    return category_response
  },
  find_products_in_category: async (category_id) => {
    let categories = await _self.all_category_products()
    let category_products = {}
    await categories.filter(category => {
      if(category.category_id === category_id){
        category_products=category
        category_products.products.map(k => {
          k.thumbnail=[_base_url,'media/300',k.image.split('/')[1]].join('/')
        })
        return category_products
      }
    })
    return category_products
  },
  all_products: async() => {
    let category_products = await _self.all_category_products()
    // let products = await _self.objectifier(categories)
    let products = await _self.flatten(category_products)
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
      let product = products[product_id]
      product.thumbnail=product.image.split('/')[1]
      product.thumbnail=[_base_url,'media/300',product.thumbnail].join('/')
      return product
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
        p.category_id=pg.category_id;
        p.category=pg;
        p.thumbnail=[_base_url,'media/300',p.image.split('/')[1]].join('/')
        
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
