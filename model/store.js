const mongoose = require('mongoose')

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    gst: {
        type: Number,
        required: true,
        unique: true,
    },
    logo: {
        type: String,
        required: true
    },
    timings: {
        type: String,
        required: true
    },
    inventories: [{
        ref: 'Inventory',
        type: mongoose.Types.ObjectId
    }]

})

const Seller = mongoose.model('Store', storeSchema)
module.exports = Seller