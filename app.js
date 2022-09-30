require('dotenv').config()

const express = require('express')
const app = express()

app.use(express.json())

const stockRouter = require('./routes/stock.routes')
app.use('/stocks', stockRouter)

module.exports = app