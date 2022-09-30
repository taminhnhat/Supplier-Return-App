const mongoose = require('mongoose')

const tempSchema = new mongoose.Schema({
    count: {
        type: Number,
        required: true
    },
    endPoint: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Temp', tempSchema)