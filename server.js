const app = require('./app')
require('dotenv').config()
const mongoose = require('mongoose')
const logger = require('./logger/logger')

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
    .catch(err => {
        logger.error('Cannot connect to database', { err: err })
    })

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

const port = Number(process.env.HTTP_PORT)

app.httpServer.listen(port, () => {
    logger.info(`HTTP Server started at port ${port}`)
})