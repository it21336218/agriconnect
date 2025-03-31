const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  orderNumber: { type: String, required: true },
  customer: { type: String, required: true },
  address: { type: String, required: true },
  items: { type: String, required: true },
  scheduledDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'in_transit', 'delivered'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Delivery', deliverySchema);
