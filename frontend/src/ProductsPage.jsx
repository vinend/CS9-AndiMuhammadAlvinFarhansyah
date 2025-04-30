import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaPlus } from 'react-icons/fa';
import config from './config';

const ProductsPage = ({ user, onTopUpClick, cart, setCart, onCheckoutSuccess }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCart, setShowCart] = useState(false);
  const [animatedItems, setAnimatedItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    // Fetch all products
    fetchProducts();
    
    // Fetch store data to get categories
    fetchStores();

    // Add slide-in animation effect when component mounts
    const timer = setTimeout(() => {
      setAnimatedItems(products.map(product => product.id));
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Effect to animate new products when they're loaded
  useEffect(() => {
    if (products.length > 0 && !loading) {
      const timer = setTimeout(() => {
        setAnimatedItems(products.map(product => product.id));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [products, loading]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const endpoint = selectedCategory ? `item/byStoreId/${selectedCategory}` : 'item';
      
      const response = await fetch(config.createApiUrl(endpoint), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Important for CORS with credentials
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch products');
      }
      
      setProducts(data.payload || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Something went wrong');
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await fetch(config.createApiUrl('store/getAll'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.error('Unexpected response format from store endpoint:', data);
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  // When category is changed, refetch products
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const addToCart = (product) => {
    // Create a visual feedback effect when adding to cart
    const productElement = document.getElementById(`product-${product.id}`);
    if (productElement) {
      productElement.classList.add('scale-105');
      setTimeout(() => {
        productElement.classList.remove('scale-105');
      }, 300);
    }

    setCart((prevCart) => {
      // Check if product is already in cart
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Increase quantity if already in cart
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Add new item with quantity 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };

  const checkout = async () => {
    if (!user) {
      alert('Please login to checkout');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      // Process each cart item as a separate transaction
      const createTransactionPromises = cart.map(async (item) => {
        const response = await fetch(config.createApiUrl('transaction/create'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            user_id: user.id,
            item_id: item.id,
            quantity: item.quantity
          })
        });
        
        return response.json();
      });
      
      // Wait for all transactions to be created
      const results = await Promise.all(createTransactionPromises);
      
      // Check if any transactions failed
      const failedTransactions = results.filter(result => !result.success);
      
      if (failedTransactions.length > 0) {
        throw new Error(`Failed to create ${failedTransactions.length} transactions. Reason: ${failedTransactions[0].message}`);
      }
      
      // Process the payment for each created transaction
      const payTransactionPromises = results.map(async (result) => {
        if (result.success && result.payload) {
          const payResponse = await fetch(config.createApiUrl(`transaction/pay/${result.payload.id}`), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          });
          
          return payResponse.json();
        }
        return null;
      });
      
      const paymentResults = await Promise.all(payTransactionPromises);
      const failedPayments = paymentResults.filter(result => result && !result.success);
      
      if (failedPayments.length > 0) {
        alert(`Warning: ${failedPayments.length} payments could not be processed automatically. Please check your orders.`);
      } else {
        alert('Order placed and paid successfully!');
      }
      
      // Clear the cart
      setCart([]);
      setShowCart(false);
      
      // Call the parent component's callback to refresh user data including balance
      if (onCheckoutSuccess) {
        onCheckoutSuccess();
      }
      
      // Refresh products to update stock
      fetchProducts();
    } catch (err) {
      console.error('Checkout error:', err);
      alert(err.message || 'Failed to checkout. Please try again.');
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Card component for product display
  const ProductCard = ({ product, isAnimated }) => (
    <div 
      id={`product-${product.id}`}
      className={`bg-[#262626] rounded-lg overflow-hidden shadow-lg transition-all duration-500 ${
        isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } hover:shadow-2xl`}
    >
      <div className="h-48 bg-gray-800 relative overflow-hidden group">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            onClick={() => addToCart(product)}
            className="px-4 py-2 bg-blue-600 rounded-md shadow-lg transform transition-transform duration-300 hover:scale-105 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={product.stock <= 0}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-1 truncate">{product.name}</h2>
        <p className="text-gray-400 text-sm mb-2 h-12 overflow-hidden">
          {product.description || 'No description available'}
        </p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">${product.price}</span>
          <span className={`text-xs px-2 py-1 rounded ${
            product.stock > 10 ? 'bg-green-900 text-green-200' : 
            product.stock > 0 ? 'bg-orange-900 text-orange-200' : 
            'bg-red-900 text-red-200'
          }`}>
            {product.stock > 10 ? 'In Stock' : 
             product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>
    </div>
  );

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
            onClick={fetchProducts}
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
      {/* Cart button with animation */}
      <div className="fixed top-20 right-4 z-40">
        <button 
          onClick={() => setShowCart(!showCart)}
          className="relative p-3 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 transition-colors transform hover:scale-110 transition-transform duration-300"
        >
          <FaShoppingCart size={20} />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Cart sidebar with improved animation */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-[#262626] shadow-lg z-50 transform transition-all duration-300 ease-in-out ${
          showCart ? 'translate-x-0' : 'translate-x-full'
        } pt-20 pb-32 overflow-y-auto`}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Your Cart</h2>
          
          {cart.length === 0 ? (
            <p className="text-gray-400">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-4 mb-4">
                {cart.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="flex items-start border-b border-gray-700 pb-3 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-16 h-16 bg-gray-800 rounded overflow-hidden flex-shrink-0 mr-3">
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-400">${item.price}</p>
                      <div className="flex items-center mt-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600 transition-colors"
                        >
                          -
                        </button>
                        <span className="mx-2 text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600 transition-colors"
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </button>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto text-xs text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between mb-4">
                  <span>Total:</span>
                  <span className="font-bold">${getTotalPrice().toFixed(2)}</span>
                </div>
                
                {user && user.balance !== undefined && (
                  <div className="mb-4 text-sm">
                    <span>Your Balance:</span>
                    <span className={`ml-2 font-medium ${user.balance >= getTotalPrice() ? 'text-green-400' : 'text-red-400'}`}>
                      ${user.balance.toFixed(2)}
                    </span>
                    {user.balance < getTotalPrice() && (
                      <p className="text-red-400 text-xs mt-1">Insufficient balance. Please top up.</p>
                    )}
                  </div>
                )}
                
                <button 
                  onClick={checkout}
                  className={`w-full py-2 rounded font-medium transition-all duration-300 transform hover:scale-105 
                    ${user && user.balance >= getTotalPrice() 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-600 cursor-not-allowed'}
                  `}
                  disabled={!user || (user.balance !== undefined && user.balance < getTotalPrice())}
                >
                  {!user ? 'Login to Checkout' : 
                   (user.balance !== undefined && user.balance < getTotalPrice()) ? 'Insufficient Balance' : 
                   'Checkout'}
                </button>
                
                {user && user.balance !== undefined && user.balance < getTotalPrice() && (
                  <button 
                    onClick={onTopUpClick}
                    className="block text-center w-full mt-2 py-2 bg-green-600 rounded font-medium hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Top Up Balance
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Overlay when cart is open */}
      {showCart && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setShowCart(false)}
        />
      )}

      {/* Main content with category filter and products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 transform transition-all duration-500 hover:scale-105">
            NETLAB Store Products
          </h1>
          
          <div className="w-32 h-1 bg-blue-600 mb-8 rounded"></div>
          
          {/* Category filter */}
          {categories.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Store Categories</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedCategory === null 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  All
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {products.length === 0 ? (
            <p className="text-center text-gray-400 my-12">No products available at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div 
                  key={product.id} 
                  className="transition-all duration-500"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard 
                    product={product} 
                    isAnimated={animatedItems.includes(product.id)} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add these animations to your CSS
const animationStyles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
`;

// Create a style element and append it to the document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(animationStyles));
  document.head.appendChild(style);
}

export default ProductsPage;