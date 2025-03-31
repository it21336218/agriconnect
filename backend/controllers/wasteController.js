const Waste = require('../models/Waste');
const upload = require('./multerConfig');
const multer = require('multer');



// Create a new waste entry
exports.createWaste = async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log the request body
    console.log('Uploaded File:', req.file); // Log the uploaded file

    const { name, type, quantity, price, description, farmerId } = req.body;
    const imagePath = req.file ? req.file.path : '';

    const newWaste = new Waste({
      name,
      type,
      quantity: Number(quantity),
      price: Number(price),
      description,
      farmerId,
      image: imagePath,
    });

    await newWaste.save();
    res.status(201).json(newWaste);
  } catch (error) {
    console.error('Error creating waste entry:', error);
    res.status(500).json({ error: 'Failed to create waste entry' });
  }
};
// Get all waste entries
// When fetching waste entries
exports.getAllWaste = async (req, res) => {
  try {
    const wasteEntries = await Waste.find();
    
    // Map _id to id for frontend compatibility
    const mappedEntries = wasteEntries.map(entry => ({
      id: entry._id,
      name: entry.name,
      type: entry.type,
      quantity: entry.quantity,
      price: entry.price,
      description: entry.description,
      farmerId: entry.farmerId,
      image: entry.image,
      createdAt: entry.createdAt
    }));
    
    res.status(200).json(mappedEntries);
  } catch (error) {
    console.error('Error fetching waste entries:', error);
    res.status(500).json({ error: 'Failed to fetch waste entries' });
  }
};

// Update a waste entry

exports.updateWaste = async (req, res) => {
  try {

    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);

    const wasteId = req.params.id;
    
    if (!wasteId || wasteId === 'undefined') {
      return res.status(400).json({ error: 'Invalid waste ID provided' });
    }
    
    const { name, type, quantity, price, description } = req.body;
    
    // Create update object
    const updateData = {
      name,
      type,
      quantity: Number(quantity),
      price: Number(price),
      description
    };
    
    // Only update the image if a new one was uploaded
    if (req.file) {
      updateData.image = req.file.path;
    }
    
    const updatedWaste = await Waste.findByIdAndUpdate(
      wasteId,
      updateData,
      { new: true }  
    );
    
    if (!updatedWaste) {
      return res.status(404).json({ error: 'Waste entry not found' });
    }
    
    // Map _id to id for frontend compatibility
    const mappedWaste = {
      id: updatedWaste._id,
      name: updatedWaste.name,
      type: updatedWaste.type,
      quantity: updatedWaste.quantity,
      price: updatedWaste.price,
      description: updatedWaste.description,
      farmerId: updatedWaste.farmerId,
      image: updatedWaste.image,
      createdAt: updatedWaste.createdAt
    };
    
    res.status(200).json(mappedWaste);
  } catch (error) {
    console.error('Error updating waste entry:', error);
    res.status(500).json({ error: 'Failed to update waste entry' });
  }
};

// Delete a waste entry
exports.deleteWaste = async (req, res) => {
  try {
    const wasteId = req.params.id;
    
    // Add validation to prevent "undefined" being passed
    if (!wasteId || wasteId === 'undefined') {
      return res.status(400).json({ error: 'Invalid waste ID provided' });
    }
    
    const deletedWaste = await Waste.findByIdAndDelete(wasteId);
    
    if (!deletedWaste) {
      return res.status(404).json({ error: 'Waste entry not found' });
    }
    
    res.status(200).json({ message: 'Waste entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting waste entry:', error);
    res.status(500).json({ error: 'Failed to delete waste entry' });
  }
};