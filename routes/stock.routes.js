const express = require('express')
const router = express.Router()
require('dotenv').config({ path: './.env' })
const stockController = require('../Controller/stock.controller')

router
  .route('/')
  .get(stockController.getStock)
  .post(stockController.addStock)
  .delete(stockController.clearStock)

router
  .route('/putToLight')
  .post(stockController.putToLight)

router
  .route('/pickToLight')
  .post(stockController.pickToLight)

router
  .route('/configurations')
  .get(stockController.getConfigurations)

router
  .route('/books/search')
  .get(stockController.getStockByBarcode)
  .delete(stockController.removeBooksInStock)

router
  .route('/:id')
  .get(stockController.getStockById)
  .delete(stockController.deleteStockById)

module.exports = router