const app = require('./app')
require('dotenv').config()
const mongoose = require('mongoose')
const logger = require('./logger/logger')

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
    .catch(err => {
        logger.error('Cannot connect to database', { err: err })
    })

const db = mongoose.connection
db.on('error', (err) => logger.error('Database unknown error', { err: err }))
db.once('open', () => logger.info('Connected to Database'))

const port = Number(process.env.HTTP_PORT)

app.listen(port, (err) => {
    if (err) console.log(err)
    logger.info(`HTTP Server started at port ${port}`)
})