const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    stocks: {
        type: Array,
        required: true
    }
})
module.exports = mongoose.model('Order', orderSchema)
