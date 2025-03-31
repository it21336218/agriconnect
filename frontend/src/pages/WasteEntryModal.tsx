import React from 'react';
import { X } from 'lucide-react';

interface WasteEntry {
  name: string;
  type: string;
  quantity: number;
  price: number;
  description: string;
  image?: File | string; // Add image field (File for new uploads, string for existing URLs)
}

interface WasteEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (wasteData: Partial<WasteEntry>) => void;
  waste?: WasteEntry;
}

const WasteEntryModal: React.FC<WasteEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  waste,
}) => {
  const [formData, setFormData] = React.useState<Partial<WasteEntry>>(
    waste || {
      name: '',
      type: '',
      quantity: 0,
      price: 0,
      description: '',
      image: '', // Initialize image as an empty string
    }
  );

  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  if (!isOpen) return null;

  // Handle file input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file }); // Store the file in formData
      setImagePreview(URL.createObjectURL(file)); // Create a preview URL for the image
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData); // Pass formData (including the image file) to the onSubmit callback
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {waste ? 'Edit Waste Entry' : 'Add Waste Entry'}
          </h2>
          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>
            )}
            {!imagePreview && waste?.image && typeof waste.image === 'string' && (
              <div className="mt-2">
                <img
                  src={waste.image}
                  alt="Existing Waste"
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>

          {/* Type Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>

          {/* Quantity Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity (kg)</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
              min="0"
            />
          </div>

          {/* Price Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Price (LKR/kg)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
              min="0"
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {waste ? 'Update' : 'Add'} Waste Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WasteEntryModal;