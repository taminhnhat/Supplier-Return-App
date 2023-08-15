const mongoose = require('mongoose')

const stockSchema = new mongoose.Schema({
    binId: {
        type: Number,
        required: true
    },
    binName: {
        type: String,
        required: true
    },
    binWidth: {
        type: String,
        required: false
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
    stock: [{
        productId: { type: String, required: true },
        users: { type: Array, required: true }
    }],
    dateCreated: {
        type: Date,
        required: true,
        default: Date.now
    }
})

module.exports = mongoose.model('UpdateStock', stockSchema)