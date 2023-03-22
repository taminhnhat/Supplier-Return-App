const express = require('express')
const router = express.Router()

require('dotenv').config({ path: './.env' })
const stockController = require('../controllers/stock.controller')

router
  .route('/products')
  .get(stockController.getStock)
  .post(stockController.addStock)
  .delete(stockController.clearStock)

router.post('/putToLight', stockController.putToLight)

router.post('/pickToLight', stockController.pickToLight)

router.get('/products/search', stockController.searchProduct)

router.delete('/products/:productId', stockController.deleteProduct)

router
  .route('/configurations')
  .get(stockController.getConfiguration)
  .patch(stockController.config)

router.get('/testLight', stockController.testLight)

router
  .route('/bins/:binId')
  .get(stockController.getBin)
  .delete(stockController.deleteBin)

module.exports = router