import React, { useState, useEffect } from 'react';
import { FaUser, FaBox, FaShoppingBag } from 'react-icons/fa';
import config from './config';

const MyItemsPage = ({ user }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      fetchUserItems(user.id);
    }
  }, [user]);

  const fetchUserItems = async (userId) => {
    try {
      setLoading(true);
      const baseUrl = config.apiUrl;
      
      // First get the user's transactions
      const response = await fetch(`${baseUrl}/transaction/user/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch transactions');
      }
      
      // Filter to only paid transactions
      const paidTransactions = data.payload.filter(tx => tx.status === 'paid');
      
      // Extract unique item IDs
      const itemIds = [...new Set(paidTransactions.map(tx => tx.item_id))];
      
      // Fetch details for each item
      const itemDetailsPromises = itemIds.map(async (itemId) => {
        try {
          const itemResponse = await fetch(`${baseUrl}/item/byId/${itemId}`);
          const itemData = await itemResponse.json();
          
          if (itemData.success) {
            // Find all transactions for this item to calculate quantity owned
            const itemTransactions = paidTransactions.filter(tx => tx.item_id === itemId);
            const quantityOwned = itemTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
            
            // Return item with quantity information
            return {
              ...itemData.payload,
              quantityOwned,
              purchaseDate: new Date(Math.max(...itemTransactions.map(tx => new Date(tx.created_at)))),
            };
          }
          return null;
        } catch (err) {
          console.error(`Error fetching details for item ${itemId}:`, err);
          return null;
        }
      });
      
      // Wait for all item details to be fetched
      const itemDetails = (await Promise.all(itemDetailsPromises)).filter(Boolean);
      
      // Sort by most recent purchase first
      itemDetails.sort((a, b) => b.purchaseDate - a.purchaseDate);
      
      setItems(itemDetails);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching user items:', err);
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return date.toLocaleDateString(undefined, options);
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
            onClick={() => fetchUserItems(user.id)}
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
            <FaUser className="mr-3" /> My Items
          </h1>
          
          <div className="w-32 h-1 bg-blue-600 mb-8 rounded"></div>
          
          {items.length === 0 ? (
            <div className="bg-[#262626] rounded-lg p-10 text-center">
              <FaBox className="mx-auto text-4xl mb-4 text-gray-500" />
              <p className="text-gray-400">You don't own any items yet.</p>
              <button 
                onClick={() => window.location.href = '#products'}
                className="mt-6 px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="bg-[#262626] rounded-lg overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl"
                >
                  <div className="h-48 bg-gray-800 relative overflow-hidden">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No image
                      </div>
                    )}
                    <div className="absolute top-0 right-0 bg-blue-600 text-white px-2 py-1 text-xs rounded-bl-lg">
                      Qty: {item.quantityOwned}
                    </div>
                  </div>
                  <div className="p-4">
                    <h2 className="text-lg font-semibold mb-1 truncate">{item.name}</h2>
                    <p className="text-gray-400 text-sm mb-2 h-12 overflow-hidden">
                      {item.description || 'No description available'}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">${item.price}</span>
                      <span className="text-xs text-gray-400">
                        Purchased: {formatDate(item.purchaseDate)}
                      </span>
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

export default MyItemsPage;