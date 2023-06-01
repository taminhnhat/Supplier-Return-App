const mongoose = require('mongoose')

const stockSchema = new mongoose.Schema({
    dateStarted: {
        type: Date,
        required: true
    },
    dateCompleted: {
        type: Date,
        required: true,
        default: Date.now
    },
    data: {
        type: Array,
        required: true
    }
})

module.exports = mongoose.model('history', stockSchema)