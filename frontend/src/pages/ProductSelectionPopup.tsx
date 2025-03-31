import React, { useState } from 'react';
import { useProductStore } from '../store/productStore';
import { CheckCircle, X } from 'lucide-react';
import { Product } from '../types'; // Import the correct Product type

interface ProductSelectionPopupProps {
  onClose: () => void;
  onConfirm: (selectedProducts: Product[]) => void;
  currentItems: Product[];
}

const ProductSelectionPopup: React.FC<ProductSelectionPopupProps> = ({
  onClose,
  onConfirm,
  currentItems,
}) => {
  const { products } = useProductStore();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(currentItems);

  const toggleProductSelection = (product: Product) => {
    setSelectedProducts((prev) =>
      prev.includes(product)
        ? prev.filter((item) => item !== product) // Deselect if already selected
        : [...prev, product] // Select if not already selected
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Select Products</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => toggleProductSelection(product)}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedProducts.includes(product)
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500">LKR{product.price}/kg</p>
              {selectedProducts.includes(product) && (
                <div className="mt-2 flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Selected</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedProducts)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionPopup;