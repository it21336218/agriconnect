const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Order CRUD routes
router.post('/create', orderController.createOrder);
router.get('/user/:userId', orderController.getOrdersByUserId);
router.get('/all', orderController.getOrders);
router.get('/count', orderController.countOrders);
router.get('/total-amount', orderController.getTotalAmount);
router.put('/updateOrder', orderController.updateOrder);
router.put('/:orderId/status',orderController.updateOrderStatus);
router.put('/update', orderController.updateOrder2);
router.delete('/cancel/:orderId', orderController.cancelOrder);

module.exports = router;
