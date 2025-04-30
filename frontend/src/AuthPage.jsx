import React, { useState } from 'react';
import NetlabStoreLogo from './assets/NetlabStore.svg';
import LoginButton from './assets/Login-Button.svg';
import config from './config';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Building the URL properly with URL constructor
      const baseUrl = config.apiUrl;
      const endpoint = isLogin ? '/user/login' : '/user/register'; 
      
      // Create the base URL
      const url = new URL(endpoint, baseUrl);
      
      // Add query parameters
      if (isLogin) {
        url.searchParams.append('email', email);
        url.searchParams.append('password', password);
      } else {
        url.searchParams.append('name', username);
        url.searchParams.append('email', email);
        url.searchParams.append('password', password);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Authentication failed');
      }

      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(result.payload));
      
      // Call the onLogin callback
      onLogin(result.payload);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1E1E1E] text-white relative overflow-hidden">
      <div className="w-80 flex flex-col items-center relative z-10">
        <img 
          src={NetlabStoreLogo} 
          alt="NetlabStore Logo" 
          className="w-80 h-80 mb-8 object-contain"
        />
        
        <div className="w-40 h-1 bg-blue-600 mb-8 rounded"></div>
        
        <form onSubmit={handleAuth} className="w-full flex flex-col items-center">
          {/* Custom input fields - replacing the SVG image */}
          <div className="w-full space-y-4 mb-6">
            {!isLogin && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#262626] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            )}
            
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#262626] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#262626] border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm mb-4 text-center w-full">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="bg-transparent border-0 p-0 cursor-pointer hover:opacity-80 transition-opacity transform transition-transform duration-300 hover:scale-110"
          >
            <img 
              src={LoginButton} 
              alt={isLogin ? "Login" : "Register"} 
              className="w-32 h-auto"
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>
          
          <div className="mt-4 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:underline focus:outline-none"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;