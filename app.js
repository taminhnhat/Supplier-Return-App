require('dotenv').config()
const morgan = require('morgan')
morgan.token('body', req => {
    return JSON.stringify(req.body)
})

const express = require('express')
const app = express()

app.use(express.json())
// app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :body :res[content-length] :response-time ms'))
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response-time ms'))

const stockRouter = require('./routes/stock.routes')
app.use('/api/v1', stockRouter)

module.exports = app