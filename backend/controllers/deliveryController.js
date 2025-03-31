const Delivery = require('../models/deliveryModel');

// Create a new delivery record
exports.createDelivery = async (req, res) => {
  try {
    const { orderNumber, customer, address, items, scheduledDate } = req.body;
    const delivery = new Delivery({
      orderNumber,
      customer,
      address,
      items,
      scheduledDate,
      status: 'pending',
    });

    const savedDelivery = await delivery.save();
    res.status(201).json({ message: 'Delivery created', delivery: savedDelivery });
  } catch (err) {
    res.status(500).json({ message: 'Error creating delivery', error: err });
  }
};

// Get all deliveries
exports.getDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find();
    res.status(200).json(deliveries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching deliveries', error: err });
  }
};

// Update delivery status
exports.updateDelivery = async (req, res) => {
  try {
    const { deliveryId, status } = req.body;
    const updatedDelivery = await Delivery.findByIdAndUpdate(deliveryId, { status }, { new: true });
    res.status(200).json({ message: 'Delivery status updated', delivery: updatedDelivery });
  } catch (err) {
    res.status(500).json({ message: 'Error updating delivery', error: err });
  }
};

// Delete delivery record
exports.deleteDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    await Delivery.findByIdAndDelete(deliveryId);
    res.status(200).json({ message: 'Delivery record deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting delivery', error: err });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  const { id } = req.params; 
  const { status } = req.body; 

  try {
    
    if (!['pending', 'in_transit', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

  
    const updatedDelivery = await Delivery.findByIdAndUpdate(
      id,
      { status },
      { new: true } 
    );

 
    if (!updatedDelivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    return res.status(200).json({
      message: 'Delivery status updated successfully',
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating delivery status', error });
  }
};


exports.countDeliveries = async (req, res) => {
  try {
      // Get the count of all deliveries
      const totalDeliveries = await Delivery.countDocuments();

      // Get the count of deliveries by status
      const pendingDeliveries = await Delivery.countDocuments({ status: 'pending' });
      const inTransitDeliveries = await Delivery.countDocuments({ status: 'in_transit' });
      const deliveredDeliveries = await Delivery.countDocuments({ status: 'delivered' });

      res.status(200).json({
          totalDeliveries,
          pendingDeliveries,
          inTransitDeliveries,
          deliveredDeliveries
      });
  } catch (error) {
      res.status(500).json({ message: 'Error retrieving delivery count', error });
  }
};
