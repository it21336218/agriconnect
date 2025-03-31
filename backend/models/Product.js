const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, enum: ["straw", "husks", "compost"] },
  image: { type: String, required: true },
  averageRating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Product", ProductSchema);
