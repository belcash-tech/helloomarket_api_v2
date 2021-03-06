const PORT = process.env.PORT || 9940;
const path = require('path');
const _ = require('lodash');
const Product = require('./products');
const Agent = require('./agents');
const config = require('dotenv').config({
  path: path.resolve('./config/.env')
})
.parsed;
const DbLogic = require('./data/DbLogic');
const doc_path = path.resolve('./doc/doc.json');

const bodyParser = require('body-parser');
const express = require('express');
const expressOasGenerator = require('express-oas-generator');
const app = express();

app.use(bodyParser.json());
const getDurationInMilliseconds = start => {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;
  const diff = process.hrtime(start);
  
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};
app.use((req, res, next) => {
  const stats = {
    started: null,
    finished: null,
    duration: null
  };
  console.log(`${req.method} ${req.originalUrl} [STARTED]`);
  const start = process.hrtime();
  stats.started = getDurationInMilliseconds(start);
  res.on('finish', () => {
    const durationInMilliseconds = getDurationInMilliseconds(start);
    console.log(
      `${req.method} ${
        req.originalUrl
      } [FINISHED] ${durationInMilliseconds.toLocaleString()} ms`
      );
    });
    res.on('close', () => {
      const durationInMilliseconds = getDurationInMilliseconds(start);
      console.log(
        `${req.method} ${
          req.originalUrl
        } [CLOSED] ${durationInMilliseconds.toLocaleString()} ms`
        );
      });
      next();
    });
    
    app.get('/categories', (req, res) => {
      //Product.categories()
      DbLogic.categories()
      .then(categories => {
        
        res.status(200).json({
          status: 'SUCCESS',
          message: `Found a total of ${categories.length} categories`,
          data: categories
        });
      })
      .catch(err => {
        res.status(500).json(err);
      });
    });
    app.get('/categories/:id', (req, res) => {
      let id = req.params['id'];
      Product.find_category(id)
      .then(category => {
        //console.log(id, Object.entries(category));
        if (Object.entries(category).length === 0) {
          res.status(404).json({
            status: 'FAIL',
            message: `Unable to find category with id: ${id}`,
            data: {}
          });
        } else {
          res.status(200).json({
            status: 'SUCCESS',
            message: `Found category with id : ${id}`,
            data: category
          });
        }
      })
      .catch(err => {
        res.status(500).json(err);
      });
    });
    app.get('/categories/:category_id/products', (req, res) => {
      let category_id = req.params['category_id'];
      let response = {
        status: null,
        code: null,
        message: null,
        data: null
      };
      Product.find_products_in_category(category_id)
      .then(category_products => {
        if (Object.keys(category_products).length === 0) {
          response.status = 'NOT_FOUND';
          response.code = 404;
          response.message = `Unable to find category with id ${category_id}`;
          response.data = {};
          res.status(404).json(response);
        } else {
          response.status = 'SUCCESS';
          response.code = 200;
          response.message = `Found category with id ${category_id} and has ${category_products.products.length} products`;
          response.data = category_products;
          res.status(200).json(response);
        }
      })
      .catch(err => {
        response.status = 'INTERNAL_SERVER_ERROR';
        response.code = 500;
        response.message = `We encountered an internal server problem. ${err.message}`;
        res.status(500).json(response);
      });
    });
    app.get('/awesome', (req, res) => {
      DbLogic.products()
      .then(products => {
        console.log(products.length);
        res.status(200).json({
          status: 'SUCCESS',
          message: `Found a total of ${products.length} products`,
          data: products
        });
      })
      .catch(err => {
        res.status(500).json(err);
      });
    });
    app.get('/products', (req, res) => {
      Product.all_products()
      .then(products => {
        console.log(products.length);
        res.status(200).json({
          status: 'SUCCESS',
          message: `Found a total of ${products.length} products`,
          data: products
        });
      })
      .catch(err => {
        res.status(500).json(err);
      });
    });
    app.get('/products/:id', (req, res) => {
      let id = req.params['id'];
      Product.find_product(id)
      .then(product => {
        if (Object.keys(product).length === 0) {
          res.status(404).json({
            status: 'FAIL',
            message: `Unable to find product with id: ${id}`,
            data: {}
          });
        } else {
          res.status(200).json({
            status: 'SUCCESS',
            message: `Found product with id : ${id}`,
            data: product
          });
        }
      })
      .catch(err => {
        res.status(500).json(err);
      });
    });
    app.get('/products/model/:model', (req, res) => {
      let model = req.params['model'];
      Product.find_product_by_model(model)
      .then(product => {
        if (Object.keys(product).length === 0) {
          res.status(404).json({
            status: 'FAIL',
            message: `Unable to find product with model: ${model}`,
            data: {}
          });
        } else {
          res.status(200).json({
            status: 'SUCCESS',
            message: `Found product with id : ${model}`,
            data: product
          });
        }
      })
      .catch(err => {
        res.status(500).json(err);
      });
    });
    app.get('/slider', (req, res) => {
      Product.slider_images().then(data => {
        res.status(200).json({
          status: 'SUCCESS',
          message: `Found a total of ${data.length} categories`,
          data_size: data.length,
          data: data
        });
      })
      .catch(err => {
        res.status(500).json({
          status: 'FAILED',
          message: err.message,
          data: null
        });
      });
    });
    app.get('/changed/categories', (req, res) => {
      let since_date = req.query.since;
      DbLogic.categories_changed_since(since_date)
      .then(data => {
        res.status(200).json({
          status: 'SUCCESS',
          message: `Found a total of ${data.length} categories`,
          data_size: data.length,
          data: data
        });
      })
      .catch(err => {
        res.status(500).json({
          status: 'FAILED',
          message: err.message,
          data: null
        });
      });
    });
    app.get('/changed/products', (req, res) => {
      let since_date = req.query.since;
      DbLogic.products_changed_since(since_date)
      .then(data => {
        //console.log(data);
        res.status(200).json({
          status: 'SUCCESS',
          message: `Found a total of ${data.length} products`,
          data_size: data.length,
          data: data
        });
      })
      .catch(err => {
        res.status(500).json({
          status: 'FAILED',
          message: err.message,
          data: null
        });
      });
    });
    app.get('/recent/products', (req, res) => {
      let since_date = req.query.since;
      DbLogic.recent_products()
      .then(data => {
        res.status(200).json({
          status: 'SUCCESS',
          message: `Found a total of ${data.length} products`,
          data_size: data.length,
          data: data
        });
      })
      .catch(err => {
        res.status(500).json({
          status: 'FAILED',
          message: err.message,
          data: null
        });
      });
    });
    
    app.get('/agents/:agent_id', (req, res) => {
      // console.log(req.query)
      let agent_id = req.params['agent_id'];
      Agent.find_agent(agent_id)
      .then(data => {
        res.status(200).json(data);
      })
      .catch(err => {
        res.status(500).json(err);
      });
    });
    app.get('/agents', (req, res) => {
      // console.log(req.query)
      if (req.query.hasOwnProperty('agent_id')) {
        let agent_id = req.query.agent_id;
        Agent.find_agent(agent_id)
        .then(data => {
          res.status(200).json(data);
        })
        .catch(err => {
          res.status(500).json(err);
        });
      } else {
        res.status(400).json({
          message: 'agent_id parameter needs to be passed'
        });
      }
    });
    app.get('/bestselling/products', (req, res) => {
      DbLogic.bestselling_products().then(data => {
        if(data.length === 0){
          res.status(200).json({
            status: 'NO_CONTENT',
            message: 'There are no records currently. Please try again later',
            data_size: data.length,
            data: data
          })
        }else {
          res.status(200).json({
            status: 'SUCCESS',
            message: `Found ${data.length} records`,
            data_size: data.length,
            data: data
          })     
        }
      })
      .catch(err => {
        res.status(500).json({
          status: 'FAILED',
          message: err.message,
          data: null
        });
      });
    });
    app.get('/discounted/products', (req, res) => {
      DbLogic.discounted_products().then(data => {
        if(data.length === 0){
          res.status(200).json({
            status: 'NO_CONTENT',
            message: 'There are no records currently. Please try again later',
            data_size: data.length,
            data: data
          })
        }else {
          res.status(200).json({
            status: 'SUCCESS',
            message: `Found ${data.length} records`,
            data: data
          })     
        }
      })
      .catch(err => {
        res.status(500).json({
          status: 'FAILED',
          message: err.message,
          data: null
        });
      });
    });
    app.get('/all_products', (req, res) => {
      DbLogic.products_with_categories().then(data => {
        if(data.length === 0){
          res.status(200).json({
            status: 'NO_CONTENT',
            message: 'There are no records currently. Please try again later',
            data_size: data.length,
            data: data
          })
        }else {
          res.status(200).json({
            status: 'SUCCESS',
            message: `Found ${data.length} records`,
            data: data
          })     
        }
      })
      .catch(err => {
        res.status(500).json({
          status: 'FAILED',
          message: err.message,
          data: null
        });
      });
    });
    
    app.listen(PORT, () => {
      console.log(`Server listening on PORT : ${PORT}`);
    });
    