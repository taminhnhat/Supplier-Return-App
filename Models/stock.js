const mongoose = require('mongoose')

const stockSchema = new mongoose.Schema({
    startPoint: {
        type: Number,
        required: true
    },
    endPoint: {
        type: Number,
        required: true
    },
    index: {
        type: Number,
        required: true
    },
    lightColor: {
        type: String,
        required: true
    },
    stocks: {
        type: Array,
        required: false,
        default: []
    },
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now
    }
})

module.exports = mongoose.model('Stock', stockSchema)