import './App.css';
import { useState, useEffect } from 'react';
import ProductsPage from './ProductsPage';
import AuthPage from './AuthPage';
import TopUpPage from './TopUpPage';
import StoresPage from './StoresPage';
import OrdersPage from './OrdersPage';
import MyItemsPage from './MyItemsPage';
import Taskbar from './taskbar';
import Footer from './footer';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('products'); // 'products', 'stores', 'orders', 'myitems', etc.
  const [showTopUp, setShowTopUp] = useState(false);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Fetch the latest user data including balance
        fetchUserData(userData.email);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const fetchUserData = async (email) => {
    try {
      const baseUrl = 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/user/${email}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      if (data.success && data.payload) {
        // Update local storage with the latest user data
        localStorage.setItem('user', JSON.stringify(data.payload));
        setUser(data.payload);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    
    // Fetch complete user data (including balance) after login
    fetchUserData(userData.email);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setShowTopUp(false);
    setCart([]);
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handlePageChange = (page) => {
    setActivePage(page);
  };

  const handleTopUpOpen = () => {
    setShowTopUp(true);
  };

  const handleTopUpClose = () => {
    setShowTopUp(false);
  };

  const handleAddToCart = (item) => {
    setCart((prevCart) => {
      // Check if item is already in cart
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        // Increase quantity if already in cart
        return prevCart.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 } 
            : cartItem
        );
      } else {
        // Add new item with quantity 1
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };
  
  // After a successful checkout, refresh user data to update balance
  const handleCheckoutSuccess = async () => {
    if (user && user.email) {
      await fetchUserData(user.email);
    }
  };

  return (
    <div className="flex flex-col justify-start items-center bg-[#1E1E1E] min-h-screen w-full overflow-hidden">
      {isAuthenticated ? (
        <>
          <Taskbar 
            user={user} 
            onLogout={handleLogout} 
            onPageChange={handlePageChange}
            onTopUpClick={handleTopUpOpen}
            activePage={activePage}
          />
          
          {activePage === 'products' && (
            <ProductsPage 
              user={user}
              onTopUpClick={handleTopUpOpen}
              cart={cart}
              setCart={setCart}
              onCheckoutSuccess={handleCheckoutSuccess}
            />
          )}
          
          {activePage === 'stores' && (
            <StoresPage 
              user={user}
              onAddToCart={handleAddToCart}
            />
          )}
          
          {activePage === 'orders' && (
            <OrdersPage 
              user={user}
            />
          )}
          
          {activePage === 'myitems' && (
            <MyItemsPage 
              user={user}
            />
          )}
          
          <Footer />
          
          {showTopUp && (
            <TopUpPage 
              user={user} 
              onBalanceUpdate={handleUserUpdate}
              onClose={handleTopUpClose}
            />
          )}
        </>
      ) : (
        <AuthPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;