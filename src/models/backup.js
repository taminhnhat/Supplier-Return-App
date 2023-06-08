const mongoose = require('mongoose')

const backupSchema = new mongoose.Schema({
    lightCursor: {
        type: Number,
        required: true,
        default: 0
    },
    binIndex: {
        type: Number,
        required: true,
        default: 0
    },
    binIndex_X: {
        type: Number,
        required: true,
        default: 0
    },
    binIndex_Y: {
        type: Number,
        required: true,
        default: 0
    },
    orders: {
        type: Array,
        required: true,
        default: []
    },
    startTime: {
        type: String,
        required: false
    },
    started: {
        type: Boolean,
        required: false
    },
    vendor: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('backup', backupSchema)