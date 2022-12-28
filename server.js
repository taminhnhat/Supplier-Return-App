const app = require('./app')
require('dotenv').config()
const mongoose = require('mongoose')
const stockController = require('./Controller/stock.controller')

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.listen(3000, '192.168.1.42', () => {
    stockController.reload()
    console.log('Server started')
})