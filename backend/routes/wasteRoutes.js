const express = require('express');
const wasteController = require('../controllers/wasteController');
const upload = require('../controllers/multerConfig');
const router = express.Router();

// Create a new waste entry
router.post('/', upload.single('image'), wasteController.createWaste);


// Get all waste entries
router.get('/', wasteController.getAllWaste);

// Update a waste entry
router.put('/:id', upload.single('image'), wasteController.updateWaste);

// Delete a waste entry
router.delete('/:id',  wasteController.deleteWaste);

module.exports = router;