const mongoose = require('mongoose')

const inventorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    sellingPrice: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true
    },
    images: [{
        type: String,
    }]

})

const Seller = mongoose.model('Inventory', inventorySchema)
module.exports = Seller