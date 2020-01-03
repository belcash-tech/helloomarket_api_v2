const rp = require('request-promise-native');
const URL = 'https://helloomarket.com/api/getAllProducts.php';
const options = { url: URL, method: 'get', json: true };
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
        return category_response;
      }
    });
    return category_response;
  },
  find_products_in_category: async category_id => {
    let categories = await _self.all_category_products();
    let category_response = {};
    await categories.filter(category => {
      if (category.category_id === category_id) {
        category_response = category;
        return category_response;
      }
    });
    return category_response;
  },
  all_products: async () => {
    let categories = await _self.all_category_products();
    // let products = await _self.objectifier(categories)
    let products = await _self.flatten(categories);
    return products;
  },
  all_category_products: () => {
    return new Promise((resolve, reject) => {
      rp(options)
        .then(data => {
          let stringifiedData = JSON.stringify(data);
          stringifiedData = stringifiedData
            .replace('/[&lt;[A-Za-z0-9s=;:.]*&gt;]*/igm', '')
            .replace('/[/]/igm', '')
            .replace('/[\r\n]*/igm', '')
            .replace('/[\\r\\n]*/igm', '');
          data = JSON.parse(stringifiedData);
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
      product.price = parseFloat(product.price);
      product.vat = parseFloat(product.vat);
      product.price_before_vat = parseFloat(product.price_before_vat);
      console.log(product);
      return product;
    } else {
      return {};
    }
  },
  flatten: categories => {
    let products = [];
    for (cat of categories) {
      let ps = cat.products;
      ps.map(p => {
        let pg = Object.assign({}, cat);
        delete pg.products;
        p.category_id = pg.category_id;
        p.category = pg;
      });
      products = products.concat(ps);
    }
    return products;
  },
  objectifier: async categories => {
    let products = await _self.flatten(categories);
    // const uTable = users.reduce((acc, it) => (acc[it.id] = it, acc), {})
    let id_products = await products.reduce(
      (acc, it) => ((acc[it.product_id] = it), acc),
      {}
    );
    return id_products;
  }
});
