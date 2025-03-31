import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import ReviewComponent from '../components/ReviewComponent';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { products, fetchProducts } = useProductStore();
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      await fetchProducts();
      setIsLoading(false);
    }
    loadData();
  }, [fetchProducts]);
  
  const product = products.find((p) => p.id === productId);
  const showCart = user?.role === 'user';
  
  const handleAddToCart = () => {
    if (!showCart) {
      toast.error('Only animal farmers can add items to cart');
      return;
    }
    if (product) {
      addItem(product, 1);
      toast.success('Added to cart!');
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-10">Loading...</div>;
  }
  
  if (!product) {
    return <div className="text-center py-10">Product not found</div>;
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={`http://localhost:5000${product.image}`}
            alt={product.name}
            className="w-full h-auto object-cover rounded-lg shadow-md"
          />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <div className="flex items-center mb-4">
            <span className="text-3xl font-bold text-gray-900">LKR{product.price}</span>
            <span className="text-gray-500 ml-2">/kg</span>
          </div>
          
          <p className="text-gray-700 mb-6">{product.description}</p>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Category</h3>
            <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              {product.category}
            </span>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Availability</h3>
            <p className="text-gray-700">{product.quantity} kg available</p>
          </div>
          
          {showCart && (
            <button
              onClick={handleAddToCart}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
      
      {/* Reviews section */}
      <ReviewComponent productId={product.id} />
    </div>
  );
};

export default ProductDetail;
