import { create } from 'zustand';
import axios from 'axios';
import { Product } from '../types';

interface ProductState {
  products: Product[];
  totalPrice: number;
  totalOrders: number;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  fetchProducts: () => Promise<void>;
}

const API_URL = 'http://localhost:5000/api/products'; // Replace with your backend URL

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  totalPrice: 0,
  totalOrders: 0, 
  addProduct: async (product) => {
    try {
      const response = await axios.post(API_URL, product);
      set((state) => ({ products: [...state.products, response.data as Product] }));
    } catch (error) {
      console.error('Error adding product:', error);
    }
  },
  updateProduct: async (product) => {
    try {
      const response = await axios.put(`${API_URL}/${product.id}`, product);
      set((state) => ({
        products: state.products.map((p) =>
          p.id === product.id ? response.data as Product : p
        ),
      }));
    } catch (error) {
      console.error('Error updating product:', error);
    }
  },
  deleteProduct: async (productId) => {
    try {
      await axios.delete(`${API_URL}/${productId}`);
      set((state) => ({
        products: state.products.filter((p) => p.id !== productId),
      }));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  },
  fetchProducts: async () => {
    try {
      const response = await axios.get(API_URL);
  
      const mappedProducts = (response.data as Product[]).map((product: Product) => ({
        ...product,
        id: product._id || '',
        createdAt: new Date().toISOString(),
       
      }));
  
      const totalPrice = mappedProducts.reduce((sum, product) => sum + (product.price || 0), 0);
  
      set({ products: mappedProducts });
      console.log('Fetched products:', mappedProducts);
      console.log('Total price of products:', totalPrice);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  },
  fetchTotalOrders: async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders/count');
      set({ totalOrders: (response.data as { totalOrders: number }).totalOrders }); 
    } catch (error) {
      console.error('Error fetching total orders:', error);
    }
  },
}));
  

