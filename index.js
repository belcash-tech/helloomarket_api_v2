const path=require('path')
const config = require('dotenv').config({path: path.resolve('./config/.env')}).parsed
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const Product = require('./products')
// Swagger settings 
// const expressOasGenerator = require('express-oas-generator')
// expressOasGenerator.init(app, {})
const argv = require('minimist')(process.argv.slice(2))
const subpath = express()
const doc_path = './doc'
app.use("/doc", subpath)
const swagger = require('swagger-node-express').createNew(subpath)
swagger.setApiInfo({
  title: "HelloMarket API v2",
  description: "HelloMarket API for Mobile Application",
  termsOfServiceUrl: "",
  contact: "yared.getachew@belcash.com, biniyam.asfaw@belcash.com",
  license: "MIT",
  licenseUrl: ""
})
app.use(express.static(path.resolve(doc_path)))
// Swagger settings end
const PORT = process.env.PORT || 9940
app.use(bodyParser.json())
// Documentation
swagger.configureSwaggerPaths('', 'doc', '');
// Configure the API domain
const scheme = 'http://'
const domain = 'localhost';
if (argv.domain !== undefined) {
  domain = argv.domain
} else{
  console.log('No --domain=xxx specified, taking default hostname "localhost".')
}

// Set and display the application URL
const applicationUrl = scheme + domain + ':' + PORT
console.log('snapJob API running on ' + applicationUrl)
swagger.configure(applicationUrl, '1.0.0')

app.get('/', (req, res) => {
  console.log('hit')
  res.sendFile(__dirname + `${doc_path}/index.html`)
})
// Documentation end
app.get('/categories', (req, res) => {
  Product.categories()
  .then(categories => {
    res.status(200).json({
      status: 'SUCCESS',
      message: `Found a total of ${categories.length} categories`,
      data: categories
    })
  })
  .catch(err => {
    res.status(500).json(err)
  })
})
app.get('/categories/:id',(req,res)=> {
  let id = req.params['id']
  Product.find_category(id)
  .then(category => {
    console.log(id, Object.entries(category))
    if(Object.entries(category).length === 0 ) {
      res.status(404).json({
        status:'FAIL',
        message: `Unable to find category with id: ${id}`,
        data: {}
      })
    }else {
      res.status(200).json({
        status: 'SUCCESS',
        message: `Found category with id : ${id}`,
        data: category
      })
    }
  })
  .catch(err => {
    res.status(500).json(err)
  })
})
app.get('/categories/:category_id/products',(req, res) => {
  let category_id = req.params['category_id']
  let response ={status: null, code: null, message: null, data:null}
  Product.find_products_in_category(category_id)
  .then(category_products => {
    if(Object.keys(category_products).length === 0){
      response.status='NOT_FOUND'
      response.code=404
      response.message=`Unable to find category with id ${category_id}`
      response.data = {}
      res.status(404).json(response)
    }else {
      response.status='SUCCESS'
      response.code=200
      response.message=`Found category with id ${category_id} and has ${category_products.products.length} products`
      response.data = category_products
      res.status(200).json(response)
    }
  })
  .catch(err => {
    response.status='INTERNAL_SERVER_ERROR'
    response.code=500
    response.message=`We encountered an internal server problem. ${err.message}`
    res.status(500).json(response)
  })
})
app.get('/products',(req,res)=> {
  Product.all_products()
  .then(products => {
    res.status(200).json({
      status: 'SUCCESS',
      message: `Found a total of ${products.length} products`,
      data: products
    })
  })
  .catch(err => {
    res.status(500).json(err)
  })
})
app.get('/products/:id',(req,res)=> {
  let id = req.params['id']
  Product.find_product(id)
  .then(product => {
    if(Object.keys(product).length === 0 ) {
      res.status(404).json({
        status:'FAIL',
        message: `Unable to find product with id: ${id}`,
        data: {}
      })
    }else {
      res.status(200).json({
        status: 'SUCCESS',
        message: `Found product with id : ${id}`,
        data: product
      })
    }
  })
  .catch(err => {
    res.status(500).json(err)
  })
})


app.listen(PORT,()=>{
  console.log(`Server listening on PORT : ${PORT}`)
})
