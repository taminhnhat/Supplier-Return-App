const mongoose = require('mongoose')

const stockSchema = new mongoose.Schema({
    binId: {
        type: Number,
        required: true
    },
    coordinate: {
        startPoint: {
            type: Number,
            required: true
        },
        endPoint: {
            type: Number,
            required: true
        },
        X_index: {
            type: Number,
            required: true
        },
        Y_index: {
            type: Number,
            required: true
        }
    },
    stocks: {
        type: Array,
        required: true,
        default: []
    },
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now
    }
})

module.exports = mongoose.model('Stock', stockSchema)