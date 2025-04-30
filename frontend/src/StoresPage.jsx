import React, { useState, useEffect } from 'react';
import { FaStore, FaShoppingBag, FaMapMarkerAlt } from 'react-icons/fa';

const StoresPage = ({ user, onAddToCart }) => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeItems, setStoreItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatedItems, setAnimatedItems] = useState([]);

  useEffect(() => {
    // Fetch all stores
    fetchStores();
  }, []);

  useEffect(() => {
    // When a store is selected, fetch its items
    if (selectedStore) {
      fetchStoreItems(selectedStore.id);
    } else {
      setStoreItems([]);
    }
  }, [selectedStore]);

  // Effect to animate new items when they're loaded
  useEffect(() => {
    if (storeItems.length > 0 && !loading) {
      const timer = setTimeout(() => {
        setAnimatedItems(storeItems.map(item => item.id));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [storeItems, loading]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const baseUrl = 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/store/getAll`);
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setStores(data);
        // Set the first store as selected if available
        if (data.length > 0) {
          setSelectedStore(data[0]);
        }
      } else {
        setStores([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stores:', err);
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const fetchStoreItems = async (storeId) => {
    try {
      setLoading(true);
      const baseUrl = 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/item/byStoreId/${storeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch store items');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStoreItems(data.payload || []);
      } else {
        setStoreItems([]);
        setError(data.message || 'Failed to fetch store items');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching store items:', err);
      setStoreItems([]);
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
  };

  // Card component for item display
  const ItemCard = ({ item, isAnimated }) => (
    <div 
      id={`item-${item.id}`}
      className={`bg-[#262626] rounded-lg overflow-hidden shadow-lg transition-all duration-500 ${
        isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } hover:shadow-2xl`}
    >
      <div className="h-48 bg-gray-800 relative overflow-hidden group">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            onClick={() => onAddToCart(item)}
            className="px-4 py-2 bg-blue-600 rounded-md shadow-lg transform transition-transform duration-300 hover:scale-105 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={item.stock <= 0}
          >
            {item.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-1 truncate">{item.name}</h2>
        <p className="text-gray-400 text-sm mb-2 h-12 overflow-hidden">
          {item.description || 'No description available'}
        </p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">${item.price}</span>
          <span className={`text-xs px-2 py-1 rounded ${
            item.stock > 10 ? 'bg-green-900 text-green-200' : 
            item.stock > 0 ? 'bg-orange-900 text-orange-200' : 
            'bg-red-900 text-red-200'
          }`}>
            {item.stock > 10 ? 'In Stock' : 
             item.stock > 0 ? 'Low Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>
    </div>
  );

  if (loading && stores.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#1E1E1E] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error && stores.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#1E1E1E] text-white">
        <div className="text-red-500">
          <p>Error: {error}</p>
          <button 
            onClick={fetchStores}
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
          <h1 className="text-3xl font-bold mb-2 transform transition-all duration-500 hover:scale-105">
            NETLAB Stores
          </h1>
          
          <div className="w-32 h-1 bg-blue-600 mb-8 rounded"></div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Store List Sidebar */}
            <div className="md:w-1/4 bg-[#262626] rounded-lg p-4 h-fit">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FaStore className="mr-2" /> Stores
              </h2>
              
              {stores.length === 0 ? (
                <p className="text-gray-400">No stores available.</p>
              ) : (
                <ul className="space-y-2">
                  {stores.map(store => (
                    <li key={store.id}>
                      <button
                        onClick={() => handleStoreSelect(store)}
                        className={`w-full text-left p-3 rounded-md transition-colors flex flex-col ${
                          selectedStore?.id === store.id 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        <span className="font-medium">{store.name}</span>
                        {store.address && (
                          <span className="text-xs mt-1 flex items-center">
                            <FaMapMarkerAlt className="mr-1" /> {store.address}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Store Items */}
            <div className="md:w-3/4">
              {selectedStore ? (
                <div>
                  <div className="bg-[#262626] rounded-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-2">{selectedStore.name}</h2>
                    {selectedStore.address && (
                      <p className="text-gray-400 flex items-center">
                        <FaMapMarkerAlt className="mr-2" /> {selectedStore.address}
                      </p>
                    )}
                  </div>
                  
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                  ) : storeItems.length === 0 ? (
                    <div className="bg-[#262626] rounded-lg p-10 text-center">
                      <FaShoppingBag className="mx-auto text-4xl mb-4 text-gray-500" />
                      <p className="text-gray-400">No items available in this store.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {storeItems.map((item, index) => (
                        <div 
                          key={item.id} 
                          className="transition-all duration-500"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <ItemCard 
                            item={item} 
                            isAnimated={animatedItems.includes(item.id)} 
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#262626] rounded-lg p-10 text-center">
                  <FaStore className="mx-auto text-4xl mb-4 text-gray-500" />
                  <p className="text-gray-400">Select a store to view its items.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoresPage;