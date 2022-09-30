const express = require('express')
const router = express.Router()
const Subscriber = require('../Models/subscriber')
const Stock = require('../Models/stock')
require('dotenv').config({ path: './.env' })
const stockController = require('../Controller/stock.controller')

router.route('/')
  .get(stockController.getStock)
  .post(stockController.addStock)
  .delete(stockController.clearStock)

router.route('/:barcode')
  .get(stockController.getStockByBarcode)
  .delete(stockController.deleteByBarcode)

router.route('/')

// Getting One By ID
router.get('/:id', stockController.getStockById)

// Updating One
router.patch('/:id', getSubscriberById, async (req, res) => {
  if (req.body.name != null) {
    res.subscriber.name = req.body.name
  }
  if (req.body.subscribedToChannel != null) {
    res.subscriber.subscribedToChannel = req.body.subscribedToChannel
  }
  res.subscriber.stocks = req.body.stocks;
  try {
    const updatedSubscriber = await res.subscriber.save()
    res.json(updatedSubscriber)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

async function getSubscriberById(req, res, next) {
  let stock
  try {
    stock = await Stock.findById(req.params.id)
    if (stock == null) {
      return res.status(404).json({ message: 'Cannot find subscriber' })
    }
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }

  res.subscriber = stock
  next()
}

module.exports = router