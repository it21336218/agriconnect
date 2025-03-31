const Review = require('../models/Review');
const Product = require('../models/Product');

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reviews for a specific product
exports.getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new review
exports.addReview = async (req, res) => {
  try {
    const { productId, userId, userName, rating, comment } = req.body;

    if (!productId || !userId || !rating || !comment) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = new Review({
      productId,
      userId,
      userName: userName || 'Anonymous User',
      rating,
      comment
    });

    const savedReview = await review.save();
    await updateProductRating(productId);

    res.status(201).json(savedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { userId, rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (userId && review.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;

    const updatedReview = await review.save();
    await updateProductRating(review.productId);

    res.json(updatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { userId } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (userId && review.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(req.params.id);
    await updateProductRating(productId);

    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to update product rating
const updateProductRating = async (productId) => {
  const allProductReviews = await Review.find({ productId });
  
  if (allProductReviews.length === 0) {
    await Product.findByIdAndUpdate(productId, { averageRating: 0, reviewCount: 0 });
  } else {
    const totalRating = allProductReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allProductReviews.length;

    await Product.findByIdAndUpdate(productId, {
      averageRating: parseFloat(averageRating.toFixed(1)),
      reviewCount: allProductReviews.length
    });
  }
};
