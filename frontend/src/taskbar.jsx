import React, { useState, useEffect } from 'react';
import LogoNetlabPlain from './assets/Logo Netlab Plain.svg';
import { FaBars, FaTimes, FaUser, FaShoppingCart, FaSignOutAlt, FaMoneyBillWave, FaStore, FaShoppingBag, FaBox } from 'react-icons/fa';

const Taskbar = ({ user, onLogout, onPageChange, onTopUpClick, activePage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  // Close menu and dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.menu-button')) {
        setIsMenuOpen(false);
      }
      if (showUserDropdown && !event.target.closest('.user-dropdown') && !event.target.closest('.user-button')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, showUserDropdown]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setShowUserDropdown(false);
  };
  
  const handleTopUp = () => {
    if (onTopUpClick) {
      onTopUpClick();
    }
    setShowUserDropdown(false);
    setIsMenuOpen(false);
  };

  const handlePageNav = (page) => {
    if (onPageChange) {
      onPageChange(page);
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-[#262626] border-b-2 border-gray-700 px-4 py-3 md:px-6 flex items-center justify-between w-screen fixed top-0 left-0 z-50">
        {/* Logo section */}
        <div className="flex items-center space-x-2">
          <img
            src={LogoNetlabPlain}
            alt="Netlab Logo"
            className="h-5 w-auto md:h-6"
          />
          <span className="text-white font-semibold hidden sm:inline-block">NETLAB Store</span>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white p-2 focus:outline-none menu-button"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>

        {/* Desktop Navigation links */}
        <ul className="hidden md:flex space-x-6 font-semibold text-sm">
          <li>
            <a
              href="#products"
              className={`hover:text-white hover:drop-shadow-[0_0_5px_#fff] transition duration-150 ease-in-out
                ${activePage === 'products' ? 'text-white' : 'text-gray-300'}`}
              onClick={() => handlePageNav('products')}
            >
              Products
            </a>
          </li>
          <li>
            <a
              href="#stores"
              className={`hover:text-white hover:drop-shadow-[0_0_5px_#fff] transition duration-150 ease-in-out
                ${activePage === 'stores' ? 'text-white' : 'text-gray-300'}`}
              onClick={() => handlePageNav('stores')}
            >
              Stores
            </a>
          </li>
          {user && (
            <>
              <li>
                <a
                  href="#orders"
                  className={`hover:text-white hover:drop-shadow-[0_0_5px_#fff] transition duration-150 ease-in-out
                    ${activePage === 'orders' ? 'text-white' : 'text-gray-300'}`}
                  onClick={() => handlePageNav('orders')}
                >
                  My Orders
                </a>
              </li>
              <li>
                <a
                  href="#myitems"
                  className={`hover:text-white hover:drop-shadow-[0_0_5px_#fff] transition duration-150 ease-in-out
                    ${activePage === 'myitems' ? 'text-white' : 'text-gray-300'}`}
                  onClick={() => handlePageNav('myitems')}
                >
                  My Items
                </a>
              </li>
            </>
          )}
          <li>
            <a
              href="#contact"
              className="text-gray-300 hover:text-white hover:drop-shadow-[0_0_5px_#fff] transition duration-150 ease-in-out"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({
                  top: document.documentElement.scrollHeight,
                  behavior: 'smooth'
                });
              }}
            >
              Contact
            </a>
          </li>
        </ul>

        {/* User Profile Section */}
        {user && (
          <div className="relative ml-4 user-dropdown">
            <button
              className="flex items-center space-x-2 text-white focus:outline-none user-button"
              onClick={toggleUserDropdown}
            >
              <div className="bg-blue-600 rounded-full h-8 w-8 flex items-center justify-center">
                <FaUser />
              </div>
              <span className="hidden md:block text-sm font-medium">{user.name}</span>
            </button>

            {/* User Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[#262626] rounded-md shadow-lg py-1 border border-gray-700 z-50">
                <div className="px-4 py-2 text-sm text-white border-b border-gray-700">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-gray-400 text-xs truncate">{user.email}</p>
                  {user.balance !== undefined && (
                    <p className="text-green-400 mt-1 flex items-center">
                      <span className="mr-1">Balance:</span>
                      <span className="font-medium">${user.balance?.toFixed(2) || "0.00"}</span>
                    </p>
                  )}
                </div>
                <a
                  href="#profile"
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-700"
                  onClick={() => handlePageNav('profile')}
                >
                  Profile
                </a>
                <a
                  href="#topup"
                  className="block px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center"
                  onClick={handleTopUp}
                >
                  <FaMoneyBillWave className="mr-2 text-green-400" />
                  Top Up Balance
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center"
                >
                  <FaSignOutAlt className="mr-2" /> 
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Mobile Navigation Menu - Side Drawer from RIGHT */}
      <div 
        className={`md:hidden fixed top-0 right-0 h-screen w-64 bg-[#262626] shadow-lg z-50 transform transition-transform duration-300 ease-in-out border-l-2 border-gray-700 mobile-menu pt-16 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {user && (
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-blue-600 rounded-full h-10 w-10 flex items-center justify-center">
                <FaUser size={18} />
              </div>
              <div>
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-gray-400 text-xs">{user.email}</p>
              </div>
            </div>
            {user.balance !== undefined && (
              <p className="text-green-400 text-sm mb-2 flex items-center">
                <FaMoneyBillWave className="mr-2" />
                Balance: ${user.balance?.toFixed(2) || "0.00"}
              </p>
            )}
          </div>
        )}

        <ul className="flex flex-col items-start px-6 py-4 space-y-6 font-semibold text-sm">
          <li className="w-full">
            <a
              href="#products"
              className={`hover:text-white hover:drop-shadow-[0_0_5px_#fff] transition duration-150 ease-in-out block py-2
                ${activePage === 'products' ? 'text-white' : 'text-gray-300'}`}
              onClick={() => handlePageNav('products')}
            >
              Products
            </a>
          </li>
          <li className="w-full">
            <a
              href="#stores"
              className={`hover:text-white hover:drop-shadow-[0_0_5px_#fff] transition duration-150 ease-in-out block py-2
                ${activePage === 'stores' ? 'text-white' : 'text-gray-300'}`}
              onClick={() => handlePageNav('stores')}
            >
              <FaStore className="inline mr-2" /> Stores
            </a>
          </li>
          {user && (
            <>
              <li className="w-full">
                <a
                  href="#orders"
                  className={`hover:text-white hover:drop-shadow-[0_0_5px_#fff] transition duration-150 ease-in-out block py-2
                    ${activePage === 'orders' ? 'text-white' : 'text-gray-300'}`}
                  onClick={() => handlePageNav('orders')}
                >
                  <FaShoppingBag className="inline mr-2" /> My Orders
                </a>
              </li>
              <li className="w-full">
                <a
                  href="#myitems"
                  className={`hover:text-white hover:drop-shadow-[0_0_5px_#fff] transition duration-150 ease-in-out block py-2
                    ${activePage === 'myitems' ? 'text-white' : 'text-gray-300'}`}
                  onClick={() => handlePageNav('myitems')}
                >
                  <FaBox className="inline mr-2" /> My Items
                </a>
              </li>
            </>
          )}
          {user && (
            <li className="w-full">
              <a
                href="#topup"
                className="text-white hover:drop-shadow-[0_0_5px_#fff] transition duration-150 ease-in-out flex items-center py-2"
                onClick={handleTopUp}
              >
                <FaMoneyBillWave className="mr-2 text-green-400" />
                Top Up Balance
              </a>
            </li>
          )}
          <li className="w-full">
            <a
              href="#contact"
              className="text-gray-300 hover:text-white hover:drop-shadow-[0_0_5px_#fff] transition duration-150 ease-in-out block py-2"
              onClick={(e) => {
                e.preventDefault();
                toggleMenu();
                window.scrollTo({
                  top: document.documentElement.scrollHeight,
                  behavior: 'smooth'
                });
              }}
            >
              Contact
            </a>
          </li>
          {user && (
            <li className="w-full border-t border-gray-700 pt-4">
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="w-full text-left text-red-400 hover:text-red-300 transition duration-150 ease-in-out flex items-center py-2"
              >
                <FaSignOutAlt className="mr-2" />
                Sign out
              </button>
            </li>
          )}
        </ul>
      </div>

      {/* Overlay when menu is open */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMenu}
        />
      )}
    </>
  );
};

export default Taskbar;