import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Menu, X, User } from 'lucide-react';
import axios from 'axios';

export const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    updateUser({
      ...user!,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    });

    setIsProfileOpen(false);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/auth/${user?.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Include the auth token
          },
        });

        const data = response.data as { success: boolean };
        if (data.success) {
          logout();
          navigate('/login'); // Redirect to the login page
          alert('Your account has been deleted successfully.');
        }
      } catch (err) {
        console.error('Error deleting account:', err);
        alert('Failed to delete account. Please try again.');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <nav className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 text-xl font-bold">
                Agri Connect
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">

                {user?.role === 'admin' && (
                  <Link to="/" className="px-3 py-2 rounded-md hover:bg-green-700">
                    Home
                  </Link>
                )}

                {user?.role === 'user' && (
                  <Link to="/home" className="px-3 py-2 rounded-md hover:bg-green-700">
                    Home
                  </Link>
                )}

                {user?.role === 'user' && (
                  <Link to="/waste-products" className="px-3 py-2 rounded-md hover:bg-green-700">
                    Waste Products
                  </Link>
                )}


                {user?.role === 'user' && (
                  <Link to="/marketplace" className="px-3 py-2 rounded-md hover:bg-green-700">
                    Marketplace
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="px-3 py-2 rounded-md hover:bg-green-700">
                    Admin Dashboard
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link to="/Waste" className="px-3 py-2 rounded-md hover:bg-green-700">
                    Waste-Management
                  </Link>
                )}
                {user?.role === 'delivery' && (
                  <Link to="/deliveries" className="px-3 py-2 rounded-md hover:bg-green-700">
                    Deliveries
                  </Link>
                )}
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center px-3 py-2 rounded-md hover:bg-green-700"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-md hover:bg-green-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-green-700"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/home"
                className="block px-3 py-2 rounded-md hover:bg-green-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {user?.role === 'user' && (
                <Link
                  to="/marketplace"
                  className="block px-3 py-2 rounded-md hover:bg-green-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Marketplace
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="block px-3 py-2 rounded-md hover:bg-green-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              {user?.role === 'delivery' && (
                <Link
                  to="/deliveries"
                  className="block px-3 py-2 rounded-md hover:bg-green-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Deliveries
                </Link>
              )}
              <button
                onClick={() => {
                  setIsProfileOpen(true);
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-md hover:bg-green-700"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-md hover:bg-green-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <Outlet />
      </main>

      {/* Profile Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Profile Settings</h2>
              <button onClick={() => setIsProfileOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={user?.name}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={user?.email}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <input
                  type="text"
                  value={user?.role === 'admin' ? 'Farmer (Admin)' : user?.role === 'delivery' ? 'Delivery Personnel' : 'Animal Farmer'}
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                  disabled
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </form>

            {/* Add Delete Account Button */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <button
                onClick={handleDeleteAccount}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-green-600 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center">© 2025 Agri Connect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};