const path=require('path')
const config = require('dotenv').config({path: path.resolve('./config/.env')}).parsed
const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const Product = require('./products')
const PORT = process.env.PORT || 9940
app.use(bodyParser.json())

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
