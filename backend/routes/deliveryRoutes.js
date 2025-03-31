const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

// Delivery CRUD routes
router.post('/create', deliveryController.createDelivery);
router.get('/all', deliveryController.getDeliveries);
router.put('/update', deliveryController.updateDelivery);
router.put('/:id/status', deliveryController.updateDeliveryStatus);
router.delete('/delete/:deliveryId', deliveryController.deleteDelivery);
router.get('/count', deliveryController.countDeliveries);

module.exports = router;
