const express = require('express')
const router = express.Router()

require('dotenv').config({ path: './.env' })
const stockCtrl = require('../controllers/stock.controller')

router.get('/stock', stockCtrl.getStock)
router.delete('/stock/clear', stockCtrl.clearStock)
router.post('/putToLight/getSuggestion', stockCtrl.getSuggestion)
router.post('/putToLight', stockCtrl.putToLight)
router.post('/pickToLight', stockCtrl.pickToLight)
router.get('/products', stockCtrl.getProductList)
router.get('/products/search', stockCtrl.searchProduct)
router.delete('/products/delete/:productId', stockCtrl.deleteProduct)
router.get('/configurations', stockCtrl.getConfiguration)
router.get('/testLight', stockCtrl.testLight)
router.get('/bin', stockCtrl.getBin)
router.delete('/bin/delete', stockCtrl.getBin)

module.exports = router