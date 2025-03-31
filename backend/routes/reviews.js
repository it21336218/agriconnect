const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');


router.get('/', reviewController.getAllReviews);
router.get('/product/:productId', reviewController.getReviewsByProduct);
router.post('/', reviewController.addReview);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

module.exports = router;
