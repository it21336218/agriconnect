import React, { useEffect, useState } from 'react';
// import { useAuthStore } from '../store/authStore';
import { useProductStore } from '../store/productStore';
import { Package, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import { ProductModal } from '../components/ProductModal';
import { Product } from '../types';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  // const { user } = useAuthStore();
  const { products, fetchProducts, addProduct, updateProduct, deleteProduct } = useProductStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | undefined>();
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchTotalSales();
  }, [fetchProducts]);

  const fetchTotalSales = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders/total-amount');
      const data = await response.json();
      setTotalSales(data.totalAmount);
    } catch (error) {
      console.error('Error fetching total sales:', error);
      toast.error('Failed to load total sales data');
    }
  };

  const handleAddProduct = async (productData: Partial<Product>, imageFile?: File) => {
    try {
      const formData = new FormData();

      // Append all product fields to FormData
      Object.keys(productData).forEach((key) => {
        formData.append(key, productData[key as keyof Product] as string);
      });

      // Append the image file if it exists
      if (imageFile) {
        formData.append('productImage', imageFile);
      } else {
        // If no image is uploaded, send a default image URL
        formData.append('image', '/uploads/products/default-product-image.jpg');
      }

      // Send the request to the backend
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      const newProduct = await response.json();
      addProduct(newProduct);
      toast.success('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const handleEditProduct = async (productData: Partial<Product>, imageFile?: File) => {
    if (!selectedProduct) return;

    try {
      const formData = new FormData();

      // Append all product fields to FormData
      Object.keys(productData).forEach((key) => {
        formData.append(key, productData[key as keyof Product] as string);
      });

      // Append the image file if it exists
      if (imageFile) {
        formData.append('productImage', imageFile);
      }

      // Send the request to the backend
      const response = await fetch(`http://localhost:5000/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const updatedProduct = await response.json();
      updateProduct(updatedProduct);
      toast.success('Product updated successfully!');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
      toast.success('Product deleted successfully!');
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const lowStockProducts = products.filter(p => p.quantity < 100);

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your waste products and monitor sales
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedProduct(undefined);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Package className="h-10 w-10 text-green-600" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">Total Products</h2>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <TrendingUp className="h-10 w-10 text-green-600" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">Total Sales</h2>
              <p className="text-2xl font-bold">LKR {totalSales.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <AlertCircle className="h-10 w-10 text-yellow-500" />
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900">Low Stock Items</h2>
              <p className="text-2xl font-bold">{lowStockProducts.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Product Inventory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.quantity} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    LKR{product.price}/kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      product.quantity > 100
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.quantity > 100 ? 'In Stock' : 'Low Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => openEditModal(product)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProduct(undefined);
        }}
        onSubmit={selectedProduct ? handleEditProduct : handleAddProduct}
        product={selectedProduct}
      />
    </div>
  );
};

export default AdminDashboard;