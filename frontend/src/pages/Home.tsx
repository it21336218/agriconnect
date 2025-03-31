import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Truck, Package, Users, ShoppingBag } from 'lucide-react';

const Home = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('orders');
  interface Order {
    _id: string;
    customerId: string;
    items: { quantity: number }[];
    totalAmount: number;
    status: string;
    createdAt: string;
  }

  const [orders, setOrders] = useState<Order[]>([]);
  interface Delivery {
    _id: string;
    orderNumber: string;
    customer: string;
    address: string;
    items: number;
    scheduledDate: string;
    status: string;
  }

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState([
    { name: 'Total Orders', value: 'Loading...', icon: ShoppingBag, change: '+12.3%', changeType: 'positive' },
    { name: 'Active Deliveries', value: 'Loading...', icon: Truck, change: '+8.2%', changeType: 'positive' },
    { name: 'Available Products', value: 'Loading...', icon: Package, change: '+3.1%', changeType: 'positive' },
    { name: 'Total Users', value: 'Loading...', icon: Users, change: '+15.3%', changeType: 'positive' }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const userRes = await fetch('http://localhost:5000/api/auth/user-count');
        const productRes = await fetch('http://localhost:5000/api/products/count');
        const deliveryRes = await fetch('http://localhost:5000/api/deliveries/count');
        const ordersRes = await fetch('http://localhost:5000/api/orders/count');

        if (!userRes.ok || !productRes.ok || !deliveryRes.ok || !ordersRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const { userCount } = await userRes.json();  
        const { count } = await productRes.json();   
        const { totalDeliveries, pendingDeliveries, inTransitDeliveries, deliveredDeliveries } = await deliveryRes.json();
        const { totalOrders } = await ordersRes.json();

        setStats([
          { name: 'Total Orders', value: totalOrders, icon: ShoppingBag, change: '+12.3%', changeType: 'positive' },
          { name: 'Total Deliveries', value: totalDeliveries, icon: Truck, change: '+8.2%', changeType: 'positive' },
          { name: 'Pending Deliveries', value: pendingDeliveries, icon: Truck, change: '+5.4%', changeType: 'positive' },
          { name: 'In-Transit Deliveries', value: inTransitDeliveries, icon: Truck, change: '+2.1%', changeType: 'positive' },
          { name: 'Delivered Orders', value: deliveredDeliveries, icon: Truck, change: '+10.5%', changeType: 'positive' },
          { name: 'Available Products', value: count, icon: Package, change: '+3.1%', changeType: 'positive' },
          { name: 'Total Users', value: userCount, icon: Users, change: '+15.3%', changeType: 'positive' }
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []); 

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        // Fetch orders, deliveries, and users data
        const [ordersRes, deliveriesRes, usersRes] = await Promise.all([
          fetch('http://localhost:5000/api/orders/all'),
          fetch('http://localhost:5000/api/deliveries/all'),
          fetch('http://localhost:5000/api/auth/users')
        ]);

        if (!ordersRes.ok || !deliveriesRes.ok || !usersRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const ordersData = await ordersRes.json();
        const deliveriesData = await deliveriesRes.json();
        const usersData = await usersRes.json();

        setOrders(ordersData);
        setDeliveries(deliveriesData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get customer name from user ID
  const getCustomerName = (customerId: string) => {
    const customer = users.find(user => user._id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  // Calculate total items in an order
  const calculateTotalItems = (items: { quantity: number }[]) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your account today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-green-500 rounded-md p-3">
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  item.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('deliveries')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'deliveries'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Deliveries
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users
            </button>
          </nav>
        </div>

        <div className="px-4 py-5 sm:p-6">
          {isLoading ? (
            <div className="text-center py-6">
              <p className="text-gray-500">Loading data...</p>
            </div>
          ) : (
            <>
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Orders</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order._id.substring(0, 8)}...</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getCustomerName(order.customerId)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{calculateTotalItems(order.items)} items</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.totalAmount.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                order.status === 'in_transit' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Deliveries Tab */}
              {activeTab === 'deliveries' && (
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Delivery Status</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Date</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {deliveries.map((delivery) => (
                          <tr key={delivery._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{delivery.orderNumber}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.customer}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.address}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.items}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(delivery.scheduledDate)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                delivery.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                delivery.status === 'in_transit' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {delivery.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === 'users' && (
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">User Accounts</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                                user.role === 'delivery' ? 'bg-blue-100 text-blue-800' : 
                                'bg-green-100 text-green-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;