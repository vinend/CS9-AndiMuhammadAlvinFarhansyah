import React, { useState, useEffect } from 'react';
import config from './config';

const TopUpPage = ({ user, onBalanceUpdate, onClose }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      setLoading(false);
      return;
    }

    try {
      // Create URL with query parameters
      const url = new URL(config.createApiUrl('user/topUp'));
      url.searchParams.append('id', user.id);
      url.searchParams.append('amount', numAmount);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Top up failed');
      }

      // Update user in localStorage with new balance
      const updatedUser = result.payload;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Call the onBalanceUpdate callback to update the user state in parent component
      if (onBalanceUpdate) {
        onBalanceUpdate(updatedUser);
      }

      setSuccess(`Successfully added $${numAmount.toFixed(2)} to your balance!`);
      setAmount('');
    } catch (err) {
      setError(err.message || 'Failed to top up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="relative bg-[#262626] rounded-lg shadow-xl max-w-md w-full p-6 overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white bg-transparent p-1 rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold mb-1">Top Up Balance</h2>
        <div className="w-16 h-1 bg-blue-600 mb-4 rounded"></div>
        
        <div className="mb-4">
          <p className="text-gray-300">Current Balance: <span className="text-green-400 font-semibold">${user?.balance?.toFixed(2) || '0.00'}</span></p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-30 border border-red-600 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-900 bg-opacity-30 border border-green-600 rounded text-green-400 text-sm">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Amount ($)</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              className="w-full bg-[#1E1E1E] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter amount"
              required
            />
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Top Up'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-sm text-gray-400">
          <p>You can top up your balance with any amount. The funds will be available immediately for purchases.</p>
        </div>
      </div>
    </div>
  );
};

export default TopUpPage;