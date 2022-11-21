const express = require('express')
const router = express.Router()
const Subscriber = require('../Models/subscriber')
const Stock = require('../Models/stock')
require('dotenv').config({ path: './.env' })
const stockController = require('../Controller/stock.controller')

router
  .route('/')
  .get(stockController.getStock)
  .post(stockController.addStock)
  .delete(stockController.clearStock)

router
  .route('/:id')
  .get(stockController.getStockById)
  .delete(stockController.deleteStockById)

router
  .route('/books/:barcode')
  .get(stockController.getStockByBarcode)
  .delete(stockController.deleteByBarcode)

// Getting One By ID
router.get('/:id', stockController.getStockById)

module.exports = router