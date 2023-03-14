const app = require('./app')
require('dotenv').config()
const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
    .catch(err => {
        console.log(err)
    })

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

const port = Number(process.env.HTTP_PORT)

app.httpServer.listen(port, () => {
    console.log(`HTTP Server started at port ${port}`)
})