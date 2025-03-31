const mongoose = require('mongoose');

const wasteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  farmerId: { type: String, required: true }, 
  image: { type: String, default: '' }, 
  createdAt: { type: Date, default: Date.now },
});

const Waste = mongoose.model('Waste', wasteSchema);

module.exports = Waste;