const mongoose = require('mongoose')

const stockSchema = new mongoose.Schema({
    dateStarted: {
        type: String,
        required: true
    },
    dateCompleted: {
        type: String,
        required: true
    },
    data: {
        type: Array,
        required: true
    }
})

module.exports = mongoose.model('history', stockSchema)