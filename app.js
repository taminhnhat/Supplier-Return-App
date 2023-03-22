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

// authorization
const auth = require('./middlewares/auth')
app.use(auth)

// routing
const stockRouter = require('./routes/stock.routes')
app.use('/api/v1', stockRouter)

// enable ssl
const privateKey = fs.readFileSync('sslcert/key.pem', 'utf8');
const certificate = fs.readFileSync('sslcert/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// create server
const httpServer = http.createServer(app)
const httpsServer = https.createServer(credentials, app)

// export
module.exports = httpServer