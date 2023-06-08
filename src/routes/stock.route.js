const express = require('express')
const router = express.Router()
const validator = require('../middlewares/validator.middleware')

require('dotenv').config({ path: './.env' })
const stockCtrl = require('../controllers/stock.controller')

router.get('/stock', stockCtrl.getStock)
router.delete('/stock/clear', stockCtrl.clearStock)
router.post('/putToLight/getSuggestion', stockCtrl.getSuggestion)
router.post('/putToLight', validator.putToLight, stockCtrl.putToLight)
router.post('/putToLight/updateQuantity', stockCtrl.putToLight_updateQuantity)
router.post('/pickToLight', stockCtrl.pickToLight)
router.post('/pickToLight/search', stockCtrl.pickToLight_search)
router.get('/products', stockCtrl.getProductList)
router.get('/products/search', stockCtrl.searchProduct)
router.delete('/products/delete/:productId', stockCtrl.deleteProduct)
router.get('/configurations', stockCtrl.getConfiguration)
router.get('/testLight', stockCtrl.testLight)
router.get('/bin', stockCtrl.getBin)
router.post('/history/create', stockCtrl.createHistory)
router.delete('/history/clear', stockCtrl.clearHistory)
router.get('/orders', stockCtrl.getOrderList)
router.get('/history', stockCtrl.getHistory)

module.exports = router