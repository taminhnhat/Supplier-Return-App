// express module
const express = require('express')
const app = express()
app.use(express.json())

// http-https
const http = require("http");
const https = require("https");
const fs = require("fs");

// env
require('dotenv').config()

// logger
const morgan = require('morgan')
morgan.token('body', req => {
    return JSON.stringify(req.body)
})
if (process.env.NODE_ENV == 'production')
    app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :body :res[content-length] :response-time ms'))
else if (process.env.NODE_ENV == 'development')
    app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :response-time ms'))
else
    app.use(morgan('common'))
const endPointLog = require('./middlewares/apiLogger.middleware')
app.use(endPointLog)


// authorization
const auth = require('./middlewares/auth.middleware')
app.use(auth)


// routing
const productRouter = require('./routes/product.route')
const stockRouter = require('./routes/stock.route')
// app.use('/api/v1', productRouter)
app.use('/api/v2', stockRouter)


// enable ssl
const privateKey = fs.readFileSync('./src/configs/key.pem', 'utf8');
const certificate = fs.readFileSync('./src/configs/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };


// create server
const httpServer = http.createServer(app)
const httpsServer = https.createServer(credentials, app)


// export
module.exports = httpServer