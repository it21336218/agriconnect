import { create } from 'zustand';
import axios from 'axios';
import { Review } from '../types';

interface ReviewState {
  reviews: Record<string, Review[]>; // productId -> reviews mapping
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<Review | null>;
  fetchReviewsByProduct: (productId: string) => Promise<Review[]>;
  isLoading: boolean;
  error: string | null;
}

const API_URL = 'http://localhost:5000/api/reviews';

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: {},
  isLoading: false,
  error: null,
  
  addReview: async (reviewData) => {
    set({ isLoading: true, error: null });
    try {
      // Make sure all required fields are included
      if (!reviewData.productId || !reviewData.userId || !reviewData.rating || !reviewData.comment) {
        throw new Error('Missing required fields');
      }
      
      const response = await axios.post(API_URL, reviewData);
      const newReview = response.data as Review;
      
      // Update the reviews in the store
      set((state) => ({
        reviews: {
          ...state.reviews,
          [newReview.productId]: [
            ...(state.reviews[newReview.productId] || []),
            newReview
          ]
        },
        isLoading: false
      }));
      
      return newReview;
    } catch (error) {
      console.error('Error adding review:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add review';
      set({ error: errorMessage, isLoading: false });
      return null;
    }
  },
  
  fetchReviewsByProduct: async (productId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/product/${productId}`);
      const productReviews = response.data as Review[];
      
      set((state) => ({
        reviews: {
          ...state.reviews,
          [productId]: productReviews
        },
        isLoading: false
      }));
      
      return productReviews;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reviews';
      set({ error: errorMessage, isLoading: false });
      return [];
    }
  }
}));