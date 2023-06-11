const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subCategory: [
    {
      name: {
        type: String,
        required: true,
      },
    },
  ],
});

const Seller = mongoose.model("Category", categorySchema);
module.exports = Seller;
