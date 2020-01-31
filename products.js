const rp = require('request-promise-native');
const URL = 'https://helloomarket.com/api/getAllProducts.php';
const SLIDES_URL = 'https://helloomarket.com/api/getBannerProducts.php';
const options = {
  url: URL,
  method: 'get',
  json: true
};
const _image_url = 'https://helloomarket.com/image';
const _base_url = 'https://helloomarket.com';
const _self = (module.exports = {
  categories: async () => {
    let categories = await _self.all_category_products();
    let sanitized = await categories.filter(cat => delete cat.products);
    return sanitized;
  },
  find_category: async category_id => {
    let categories = await _self.categories();
    let category_response = {};
    await categories.filter(category => {
      if (category.category_id === category_id) {
        category_response = category;
        category_response.category_id = parseInt(category_response.category_id)
        return category_response;
      }
    });
    return category_response;
  },
  find_products_in_category: async category_id => {
    let categories = await _self.all_category_products();
    let category_products = {};
    await categories.filter(category => {
      if (category.category_id === category_id) {
        category_products = category;
        category_products.products.map(k => {
          //k.product_id = parseInt(k.product_id)
          k.quantity = parseInt(k.quantity)
          //k.manufacturer_id = parseInt(k.manufacturer_id)
          //k.category_id = parseInt(category.category_id)
          k.thumbnail = [_base_url, 'media/300', k.image.split('/')[1]].join(
            '/'
          );
        });
        //category_products.category_id = parseInt(category_products.category_id)
        return category_products;
      }
    });
    return category_products;
  },
  all_products: async () => {
    let category_products = await _self.all_category_products();
    // let products = await _self.objectifier(categories)
    let products = await _self.flatten(category_products);
    products.map(p => { 
	p.thumbnail = [_base_url, 'media/300', p.image.split('/')[1]].join('/');

    });
    return products;
  },
  all_category_products: () => {
    return new Promise((resolve, reject) => {
      rp(options)
        .then(data => {
          resolve(data);
        })
        .catch(err => {
          reject(err);
        });
    });
  },
  find_product: async product_id => {
    let categories = await _self.all_category_products();
    let products = await _self.objectifier(categories);
    if (products.hasOwnProperty(product_id)) {
      let product = products[product_id];
      //product.product_id = parseInt(product.product_id)
      //product.category_id = parseInt(product.category_id)
      //product.manufacturer_id = parseInt(product.manufacturer_id)
      product.quantity = parseInt(product.quantity)
      product.thumbnail = product.image.split('/')[1];
      product.thumbnail = [_base_url, 'media/300', product.thumbnail].join('/');
      return product;
    } else {
      return {};
    }
  },
  slider_images: async () => {
    try {
      let image_options = {
        url: SLIDES_URL,
        method: 'GET',
        json: true
      }
      let slideshow = await rp(image_options)
      console.log(slideshow)
      return slideshow.result
    } catch (error) {
      console.log('SLIDESHOW_ERROR: ', error)
      throw error;
    }
  },
  flatten: categories => {
    let products = [];
    for (cat of categories) {
      let ps = cat.products;
      ps.map(p => {
        let pg = Object.assign({}, cat);
        delete pg.products;
        //p.category_id = parseInt(pg.category_id);
        //p.product_id = parseInt(p.product_id);
        //pg.category_id = parseInt(pg.category_id);
        //p.manufacturer_id = parseInt(p.manufacturer_id);
        p.quantity = parseInt(p.quantity)
        p.category = pg;
        p.thumbnail = [_base_url, 'media/300', p.image.split('/')[1]].join('/');
      });
      products = products.concat(ps);
    }
    return products;
  },
  objectifier: async categories => {
    let products = await _self.flatten(categories);
    // const uTable = users.reduce((acc, it) => (acc[it.id] = it, acc), {})
    let id_products = await products.reduce(
      (acc, it) => ((acc[it.product_id] = it), acc), {}
    );
    return id_products;
  }
});
