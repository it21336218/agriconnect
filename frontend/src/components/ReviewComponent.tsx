import React, { useEffect, useState } from 'react';
import { useReviewStore } from '../store/reviewStore';
import { useAuthStore } from '../store/authStore';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReviewComponentProps {
  productId: string;
}

const ReviewComponent: React.FC<ReviewComponentProps> = ({ productId }) => {
  const { reviews, fetchReviewsByProduct, addReview, isLoading } = useReviewStore();
  const { user } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  const productReviews = reviews[productId] || [];
  
  useEffect(() => {
    fetchReviewsByProduct(productId);
  }, [fetchReviewsByProduct, productId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to leave a review');
      return;
    }
    
    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5');
      return;
    }
    
    if (comment.trim().length < 3) {
      toast.error('Please enter a comment (minimum 3 characters)');
      return;
    }
    
    const reviewData = {
      productId,
      userId: user.id,
      userName: user.name || 'Anonymous User',
      rating,
      comment
    };
    
    try {
      const result = await addReview(reviewData);
      
      if (result) {
        toast.success('Review added successfully!');
        setComment('');
        setRating(5);
        setShowForm(false);
      } else {
        toast.error('Failed to add review. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };
  
  const calculateAverageRating = () => {
    if (productReviews.length === 0) return '0';
    const sum = productReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / productReviews.length).toFixed(1).toString();
  };
  
  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
      
      <div className="mb-4 flex items-center">
        <div className="flex items-center mr-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                parseFloat(calculateAverageRating()) >= star
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-lg font-medium">
          {calculateAverageRating()} out of 5 ({productReviews.length} reviews)
        </span>
      </div>
      
      {user && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Write a Review
        </button>
      )}
      
      {showForm && (
        <form onSubmit={handleSubmitReview} className="mb-8 bg-gray-50 p-4 rounded-lg">
          <h4 className="text-lg font-medium mb-3">Write Your Review</h4>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 cursor-pointer ${
                    rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Your Review
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Share your experience with this product..."
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 ${
                isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
              } text-white rounded-md`}
            >
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}
      
      {/* Reviews list */}
      <div className="space-y-4">
        {productReviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        ) : (
          productReviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium">{review.userName}</span>
                  <div className="flex items-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          review.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewComponent;