const Order = require('../models/OrderModel');
const Payment = require('../models/paymentModel');

// Create order and initiate payment
exports.createOrder = async (req, res) => {
  try {
    const { customerId, items, totalAmount, paymentDetails } = req.body;
    const order = new Order({
      customerId,
      items,
      totalAmount,
      status: 'pending',
    });

    const savedOrder = await order.save();

    const payment = new Payment({
      orderId: savedOrder._id,
      amount: totalAmount,
      status: 'pending',
      paymentDetails,
    });

    await payment.save();

    res.status(201).json({ message: 'Order and payment initiated', order: savedOrder });
  } catch (err) {
    res.status(500).json({ message: 'Error creating order', error: err });
  }
};

// Read orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { orderId, items, totalAmount } = req.body;


    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

   
    if (items) order.items = items;
    if (totalAmount) order.totalAmount = totalAmount;

  
    const updatedOrder = await order.save();

    res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (err) {
    res.status(500).json({ message: 'Error updating order', error: err });
  }
};

// Update order and payment status
exports.updateOrder2 = async (req, res) => {
  try {
    const { orderId, status, paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    const payment = await Payment.findOneAndUpdate({ orderId }, { status: paymentStatus }, { new: true });

    res.status(200).json({ message: 'Order and payment status updated', order, payment });
  } catch (err) {
    res.status(500).json({ message: 'Error updating order', error: err });
  }
};

// Delete order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    await Order.findByIdAndDelete(orderId);
    await Payment.findOneAndDelete({ orderId });

    res.status(200).json({ message: 'Order and payment cancelled' });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling order', error: err });
  }
};


exports.getOrdersByUserId = async (req, res) => {
  const { userId } = req.params; // Get userId from route parameter

  try {
    // Find orders by userId
    const orders = await Order.find({ customerId: userId });

    // If no orders found
    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    return res.status(200).json({
      message: 'Orders retrieved successfully',
      orders
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching orders', error });
  }
};

exports.countOrders = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    res.status(200).json({ totalOrders });
  } catch (error) {
    console.error('Error counting orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTotalAmount = async (req, res) => {
  try {
    const totalAmount = await Payment.aggregate([
      {
        $group: {
          _id: null, 
          totalAmount: { $sum: '$amount' } 
        }
      }
    ]);

   
    if (!totalAmount.length) {
      return res.status(404).json({ message: 'No payments found' });
    }

    return res.status(200).json({ totalAmount: totalAmount[0].totalAmount });
  } catch (error) {
    console.error('Error calculating total payment amount:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params; 
    const { status } = req.body; 

    
    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }


    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true } 
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status updated successfully', updatedOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};