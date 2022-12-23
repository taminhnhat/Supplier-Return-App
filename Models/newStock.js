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
    binId: {
        type: Number,
        required: true
    },
    XCoordinate: {
        type: Number,
        required: true
    },
    YCoordinate: {
        type: Number,
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

module.exports = mongoose.model('newStock', stockSchema)