const express = require('express')
const router = express.Router()

require('dotenv').config({ path: './.env' })
const stockCtrl = require('../controllers/stock.controller')

router
    .route('/products')
    .get(stockCtrl.getProductList)
    .post(stockCtrl.getSuggestion)
    .delete(stockCtrl.clearStock)

router.get('/stock', stockCtrl.getStock)

router.post('/putToLight', stockCtrl.putToLight)

router.post('/pickToLight', stockCtrl.pickToLight)

router.get('/products/search', stockCtrl.searchProduct)

router.delete('/products/:productId', stockCtrl.deleteProduct)

router
    .route('/configurations')
    .get(stockCtrl.getConfiguration)
    .patch(stockCtrl.config)

router.get('/testLight', stockCtrl.testLight)

router
    .route('/bins/:binId')
    .get(stockCtrl.getBin)
    .delete(stockCtrl.deleteBin)

module.exports = router