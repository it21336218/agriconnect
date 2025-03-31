import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { ShoppingCart, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
// import { Link } from 'react-router-dom';

// Waste product interface
interface WasteProduct {
  _id: string;
  name: string;
  type: string;
  quantity: number;
  price: number;
  description: string;
  farmerId: string;
  createdAt: string;
  image: string; // Add image field
}

const WasteProducts = () => {
  const { user } = useAuthStore();
  const { items, addItem, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const [wasteProducts, setWasteProducts] = useState<WasteProduct[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    customer: '',
    address: '',
    scheduledDate: '',
    paymentMethod: 'card', // Default to card
    cardDetails: {
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    }
  });

  // Fetch waste products
  useEffect(() => {
    const fetchWasteProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/waste');
        if (!response.ok) {
          throw new Error('Failed to fetch waste products');
        }
        const data = await response.json();
        setWasteProducts(data);
      } catch (error) {
        console.error('Error fetching waste products:', error);
        toast.error('Failed to load waste products');
      }
    };

    fetchWasteProducts();
  }, []);

  // Only show cart for regular users
  const showCart = user?.role === 'user';

  // Get unique waste types for filtering
  const getUniqueTypes = () => {
    const types = wasteProducts.map(product => product.type);
    return ['all', ...Array.from(new Set(types))];
  };

  const wasteTypes = getUniqueTypes();

  const filteredProducts = selectedType === 'all'
    ? wasteProducts
    : wasteProducts.filter(product => product.type === selectedType);

  const handleAddToCart = (product: WasteProduct) => {
    if (!showCart) {
      toast.error('Only animal farmers can add items to cart');
      return;
    }

    // Format the product to match the cart store requirements
    const cartProduct = {
      id: product._id,
      name: product.name,
      category: product.type,
      price: product.price,
      image: product.image ? `http://localhost:5000/${product.image.replace(/\\/g, '/')}` : '/default-waste-image.jpg', // Use actual image or default
      description: product.description,
      quantity: product.quantity,
      farmerId: product.farmerId,
      createdAt: product.createdAt
    };

    addItem(cartProduct, 1);
    toast.success('Added to cart!');
  };

  const handleDeliveryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const initiateCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!user) {
      toast.error('Please log in to complete your purchase');
      return;
    }

    // Pre-fill the customer name if available
    if (user.name) {
      setDeliveryDetails(prev => ({
        ...prev,
        customer: user.name
      }));
    }

    // Show the delivery form
    setShowDeliveryForm(true);
  };

  const handleCheckout = async () => {
    // Validate delivery form
    if (!deliveryDetails.customer || !deliveryDetails.address || !deliveryDetails.scheduledDate) {
      toast.error('Please fill in all delivery details');
      return;
    }
    if (deliveryDetails.paymentMethod === 'card') {
      if (!deliveryDetails.cardDetails.cardNumber ||
        !deliveryDetails.cardDetails.expiryDate ||
        !deliveryDetails.cardDetails.cvv) {
        toast.error('Please fill in all card details');
        return;
      }
    }

    setIsLoading(true);

    try {
      // First, place the order
      const orderData = {
        customerId: user?.id || '',
        items: items.map(item => ({
          productId: item.id,
          quantity: item.cartQuantity,
          price: item.price
        })),
        totalAmount: total(),
        paymentDetails: deliveryDetails.paymentMethod === 'card'
          ? {
            method: "Credit Card",
            cardNumber: deliveryDetails.cardDetails.cardNumber,
            expiryDate: deliveryDetails.cardDetails.expiryDate,
            cvv: deliveryDetails.cardDetails.cvv
          }
          : {
            method: "Cash on Delivery"
          }
      };

      // Create the order
      const orderResponse = await fetch('http://localhost:5000/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to place order');
      }

      const orderResult = await orderResponse.json();
      const orderNumber = orderResult.id || orderResult.orderNumber || `ORD${Date.now()}`;

      // Then, create the delivery
      const deliveryData = {
        orderNumber: orderNumber,
        customer: deliveryDetails.customer,
        address: deliveryDetails.address,
        items: items.map(item => item.name).join(', '),
        scheduledDate: deliveryDetails.scheduledDate
      };

      const deliveryResponse = await fetch('http://localhost:5000/api/deliveries/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deliveryData)
      });

      if (!deliveryResponse.ok) {
        throw new Error('Order placed but delivery setup failed');
      }

      await deliveryResponse.json();

      // Clear the cart and reset forms
      clearCart();
      setShowDeliveryForm(false);
      setDeliveryDetails({
        customer: '',
        address: '',
        scheduledDate: '',
        paymentMethod: 'card',
        cardDetails: {
          cardNumber: '',
          expiryDate: '',
          cvv: ''
        }
      });

      setIsCartOpen(false);

      // Show success message
      toast.success('Order placed and delivery scheduled successfully!');
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong during checkout';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Waste Products</h1>
        {showCart && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart ({items.length})
          </button>
        )}
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <Filter className="w-5 h-5 text-gray-500" />
        <div className="flex flex-wrap gap-2">
          {wasteTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-md ${selectedType === type
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              {type === 'all' ? 'All Types' : type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img
                    src={`http://localhost:5000/${product.image.replace(/\\/g, '/')}`} // Replace backslashes and prepend backend URL
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500">No Image</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="mt-1 text-sm text-gray-600">Type: {product.type}</p>
                <p className="mt-1 text-gray-500">{product.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">LKR{product.price}</span>
                    <span className="text-gray-500">/kg</span>
                  </div>
                  {showCart && (
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Available: {product.quantity} kg
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-8">
            <p className="text-gray-500">No waste products found in this category.</p>
          </div>
        )}
      </div>

      {/* Shopping Cart Sidebar */}
      {showCart && isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
            {/* Cart Header - Fixed at top */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              <button onClick={() => setIsCartOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  {/* Cart Items Section */}
                  <div className="mb-4">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center py-4 border-b">
                        <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-gray-500">No Image</span>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-sm font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500">LKR{item.price}/kg</p>
                          <div className="flex items-center mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(0, item.cartQuantity - 1))}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              -
                            </button>
                            <span className="mx-2">{item.cartQuantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Total Section */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>LKR{total()}</span>
                    </div>
                  </div>

                  {/* Delivery Form Section */}
                  {showDeliveryForm && (
                    <div className="mt-4 pb-20">
                      <h3 className="font-medium mb-2">Delivery Details</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                          <input
                            type="text"
                            name="customer"
                            value={deliveryDetails.customer}
                            onChange={handleDeliveryFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                            placeholder="Enter your full name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Delivery Address</label>
                          <textarea
                            name="address"
                            value={deliveryDetails.address}
                            onChange={handleDeliveryFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                            placeholder="Enter your complete address"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-1">Delivery Date & Time</label>
                          <input
                            type="datetime-local"
                            name="scheduledDate"
                            value={deliveryDetails.scheduledDate}
                            onChange={handleDeliveryFormChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      {/* Payment Method Selection */}
                      <div className="mt-3">
                        <label className="block text-sm text-gray-600 mb-1">Payment Method</label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="card"
                              checked={deliveryDetails.paymentMethod === 'card'}
                              onChange={() => setDeliveryDetails(prev => ({
                                ...prev,
                                paymentMethod: 'card'
                              }))}
                              className="mr-2"
                            />
                            Credit/Debit Card
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="cash"
                              checked={deliveryDetails.paymentMethod === 'cash'}
                              onChange={() => setDeliveryDetails(prev => ({
                                ...prev,
                                paymentMethod: 'cash'
                              }))}
                              className="mr-2"
                            />
                            Cash on Delivery
                          </label>
                        </div>
                      </div>

                      {/* Card Details (Show only if card payment is selected) */}
                      {deliveryDetails.paymentMethod === 'card' && (
                        <div className="mt-2 space-y-2 p-2 border border-gray-200 rounded-md">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Card Number</label>
                            <input
                              type="text"
                              name="cardNumber"
                              value={deliveryDetails.cardDetails.cardNumber}
                              onChange={(e) => setDeliveryDetails(prev => ({
                                ...prev,
                                cardDetails: {
                                  ...prev.cardDetails,
                                  cardNumber: e.target.value
                                }
                              }))}
                              className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                              placeholder="1234 5678 9012 3456"
                            />
                          </div>
                          <div className="flex space-x-3">
                            <div className="w-1/2">
                              <label className="block text-sm text-gray-600 mb-1">Expiry Date</label>
                              <input
                                type="text"
                                name="expiryDate"
                                value={deliveryDetails.cardDetails.expiryDate}
                                onChange={(e) => setDeliveryDetails(prev => ({
                                  ...prev,
                                  cardDetails: {
                                    ...prev.cardDetails,
                                    expiryDate: e.target.value
                                  }
                                }))}
                                className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                                placeholder="MM/YY"
                              />
                            </div>
                            <div className="w-1/2">
                              <label className="block text-sm text-gray-600 mb-1">CVV</label>
                              <input
                                type="text"
                                name="cvv"
                                value={deliveryDetails.cardDetails.cvv}
                                onChange={(e) => setDeliveryDetails(prev => ({
                                  ...prev,
                                  cardDetails: {
                                    ...prev.cardDetails,
                                    cvv: e.target.value
                                  }
                                }))}
                                className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                                placeholder="123"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Bottom Action Buttons - Fixed at bottom */}
            <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
              {items.length > 0 && (
                <>
                  {showDeliveryForm ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowDeliveryForm(false)}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleCheckout}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-2 ${isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'} text-white rounded-md`}
                      >
                        {isLoading ? 'Processing...' : 'Place Order'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={initiateCheckout}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                    >
                      Checkout
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WasteProducts;