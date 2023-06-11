const mongoose = require('mongoose')

const sellerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    bussinessName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    stores: [{
        ref: 'Store',
        type: mongoose.Types.ObjectId
    }]

})

const Seller = mongoose.model('Seller', sellerSchema)
module.exports = Seller