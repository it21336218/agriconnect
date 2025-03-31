import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Plus, Edit, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import WasteEntryModal from './WasteEntryModal';

interface WasteEntry {
  id: string;
  name: string;
  type: string;
  quantity: number;
  price: number;
  description: string;
  farmerId: string;
  createdAt: string;
  image?: string | File;
}

const WasteManagement = () => {
  const { user } = useAuthStore();
  const [wasteEntries, setWasteEntries] = useState<WasteEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWaste, setSelectedWaste] = useState<WasteEntry | undefined>();
  //   const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchWasteEntries();
  }, []);

  const fetchWasteEntries = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/waste');
      const data = await response.json();
      setWasteEntries(data);
    } catch (error) {
      console.error('Error fetching waste entries:', error);
      toast.error('Failed to load waste entries');
    }
  };

  const handleAddWaste = async (wasteData: Partial<WasteEntry>) => {
    try {
      const formData = new FormData();
      formData.append('name', wasteData.name || '');
      formData.append('type', wasteData.type || '');
      formData.append('quantity', String(wasteData.quantity || 0));
      formData.append('price', String(wasteData.price || 0));
      formData.append('description', wasteData.description || '');
      formData.append('farmerId', user?.id || ''); // Ensure farmerId is included
      if (wasteData.image instanceof File) {
        formData.append('image', wasteData.image); // Append the image file
      }

      const response = await fetch('http://localhost:5000/api/waste', {
        method: 'POST',
        body: formData, // Use FormData instead of JSON
      });
      console.log('waste:', response);

      if (!response.ok) {
        throw new Error('Failed to add waste entry');
      }

      const newWaste = await response.json();
      setWasteEntries([...wasteEntries, newWaste]);
      toast.success('Waste entry added successfully!');
    } catch (error) {
      console.error('Error adding waste entry:', error);
      toast.error('Failed to add waste entry');
    }
  };

  const handleUpdateWaste = async (wasteData: Partial<WasteEntry>) => {
    if (!selectedWaste) return;

    try {
      const formData = new FormData();
      formData.append('name', wasteData.name || '');
      formData.append('type', wasteData.type || '');
      formData.append('quantity', String(wasteData.quantity || 0));
      formData.append('price', String(wasteData.price || 0));
      formData.append('description', wasteData.description || '');
      if (wasteData.image instanceof File) {
        formData.append('image', wasteData.image); // Append the image file
      }

      const response = await fetch(`http://localhost:5000/api/waste/${selectedWaste.id}`, {
        method: 'PUT',
        body: formData, // Use FormData instead of JSON
      });

      if (!response.ok) {
        throw new Error('Failed to update waste entry');
      }

      const updatedWaste = await response.json();
      setWasteEntries(wasteEntries.map(waste =>
        waste.id === updatedWaste.id ? updatedWaste : waste
      ));
      toast.success('Waste entry updated successfully!');
    } catch (error) {
      console.error('Error updating waste entry:', error);
      toast.error('Failed to update waste entry');
    }
  };

  const handleDeleteWaste = async (wasteId: string) => {
    // Add validation to prevent undefined wasteId
    if (!wasteId) {
      console.error('Cannot delete waste: No waste ID provided');
      toast.error('Failed to delete waste entry: Invalid ID');
      return;
    }

    if (window.confirm('Are you sure you want to delete this waste entry?')) {
      try {
        console.log('Deleting waste with ID:', wasteId); // Debug log

        const response = await fetch(`http://localhost:5000/api/waste/${wasteId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete waste entry');
        }

        setWasteEntries(wasteEntries.filter(waste => waste.id !== wasteId));
        toast.success('Waste entry deleted successfully!');
      } catch (error) {
        console.error('Error deleting waste entry:', error);
        toast.error('Failed to delete waste entry');
      }
    }
  };

  const openEditModal = (waste: WasteEntry) => {
    setSelectedWaste(waste);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Waste Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage waste entries for animal farmers
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => {
              setSelectedWaste(undefined);
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Waste Entry
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Waste Entries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                {user?.role === 'admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wasteEntries.map((waste) => (
                <tr key={waste.id}>
         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {waste.image && (
    <img
      src={
        typeof waste.image === 'string'
          ? `http://localhost:5000/${waste.image.replace(/\\/g, '/')}` // Replace backslashes and prepend backend URL
          : URL.createObjectURL(waste.image)
      }
      alt="Waste"
      className="w-16 h-16 object-cover rounded-md"
    />
  )}
</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {waste.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {waste.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {waste.quantity} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    LKR{waste.price}/kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {waste.description}
                  </td>
                  {user?.role === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => openEditModal(waste)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteWaste(waste.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Waste Entry Modal */}
      {isModalOpen && (
        <WasteEntryModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedWaste(undefined);
          }}
          onSubmit={selectedWaste ? handleUpdateWaste : handleAddWaste}
          waste={selectedWaste}
        />
      )}
    </div>
  );
};

export default WasteManagement;