import React, { useState, useEffect } from 'react';
import { FaShoppingBag, FaBox, FaCheck, FaClock, FaTimes, FaExclamationTriangle, FaQuestion } from 'react-icons/fa';
import config from './config';

const OrdersPage = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      fetchUserOrders(user.id);
    }
  }, [user]);

  const fetchUserOrders = async (userId) => {
    try {
      setLoading(true);
      
      const response = await fetch(config.createApiUrl(`transaction/user/${userId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch orders');
      }
      
      // Add details from server if they exist, otherwise initialize empty
      let ordersWithDetails = data.payload || [];
      
      // If we need additional details, fetch them one by one
      const ordersWithDetailsPromises = ordersWithDetails.map(async (order) => {
        try {
          // Fetch item details if not included
          if (!order.item) {
            const itemResponse = await fetch(config.createApiUrl(`item/byId/${order.item_id}`), {
              credentials: 'include'
            });
            const itemData = await itemResponse.json();
            if (itemData.success) {
              order.item = itemData.payload;
            }
          }
          return order;
        } catch (err) {
          console.error(`Error fetching details for order ${order.id}:`, err);
          return order;
        }
      });
      
      // Wait for all details to be fetched
      ordersWithDetails = await Promise.all(ordersWithDetailsPromises);
      
      // Sort by created_at (newest first)
      ordersWithDetails.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setOrders(ordersWithDetails);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <FaCheck className="text-green-400" />;
      case 'pending':
        return <FaClock className="text-yellow-400" />;
      case 'cancelled':
        return <FaTimes className="text-red-400" />;
      case 'refunded':
        return <FaExclamationTriangle className="text-orange-400" />;
      default:
        return <FaQuestion className="text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#1E1E1E] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#1E1E1E] text-white">
        <div className="text-red-500">
          <p>Error: {error}</p>
          <button 
            onClick={() => fetchUserOrders(user.id)}
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white pt-16 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 transform transition-all duration-500 hover:scale-105 flex items-center">
            <FaShoppingBag className="mr-3" /> My Orders
          </h1>
          
          <div className="w-32 h-1 bg-blue-600 mb-8 rounded"></div>
          
          {orders.length === 0 ? (
            <div className="bg-[#262626] rounded-lg p-10 text-center">
              <FaBox className="mx-auto text-4xl mb-4 text-gray-500" />
              <p className="text-gray-400">You haven't made any orders yet.</p>
              <button 
                onClick={() => window.location.href = '#products'}
                className="mt-6 px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div 
                  key={order.id}
                  className="bg-[#262626] rounded-lg overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div>
                        <h2 className="text-lg md:text-xl font-semibold mb-1 flex items-center">
                          Order #{order.id.substring(0, 8)}...
                        </h2>
                        <p className="text-sm text-gray-400">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0">
                        <div className="flex items-center bg-[#1E1E1E] rounded-md px-3 py-1">
                          <span className="mr-2">Status:</span>
                          <span className="flex items-center">
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row border-t border-gray-700 pt-4">
                      <div className="md:w-1/4 mb-4 md:mb-0">
                        <div className="w-full h-24 md:h-32 bg-gray-800 rounded overflow-hidden">
                          {order.item && order.item.image_url ? (
                            <img 
                              src={order.item.image_url} 
                              alt={order.item?.name || 'Product'} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              No image
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="md:w-3/4 md:pl-6">
                        <h3 className="text-lg font-medium mb-1">
                          {order.item?.name || 'Product Name Unavailable'}
                        </h3>
                        <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-gray-400 mb-3">
                          <div>
                            <span className="font-medium text-gray-300">Quantity:</span> {order.quantity}
                          </div>
                          <div>
                            <span className="font-medium text-gray-300">Price:</span> ${order.item?.price || (order.total / order.quantity).toFixed(2)}
                          </div>
                          <div>
                            <span className="font-medium text-gray-300">Total:</span> ${order.total?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;