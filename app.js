require('dotenv').config()
const morgan = require('morgan')

const express = require('express')
const app = express()

app.use(express.json())
app.use(morgan('common'))

const stockRouter = require('./routes/stock.routes')
app.use('/api/v1/stocks', stockRouter)

module.exports = app