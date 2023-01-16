require('dotenv').config()
const morgan = require('morgan')
morgan.token('body', req => {
    return JSON.stringify(req.body)
})

const express = require('express')
const app = express()

app.use(express.json())
if (process.env.NODE_ENV == production)
    app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :body :res[content-length] :response-time ms'))
else if (process.env.NODE_ENV == development)
    app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response-time ms'))
else
    app.use(morgan('common'))

const stockRouter = require('./routes/stock.routes')
app.use('/api/v1', stockRouter)

module.exports = app