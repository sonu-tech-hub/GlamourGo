// client/src/pages/user/Wallet.jsx
import React, { useState, useEffect } from 'react';
import { FaWallet, FaMoneyBillWave, FaHistory, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatPrice } from '../../utils/helpers';

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  useEffect(() => {
    fetchWalletData();
  }, []);
  
  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      // Get wallet details
      const walletResponse = await api.get('/users/wallet');
      setBalance(walletResponse.data.balance);
      
      // Get transactions (first page)
      fetchTransactions(1, true);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
      setIsLoading(false);
    }
  };
  
  const fetchTransactions = async (pageNum, replace = false) => {
    try {
      const response = await api.get(`/payments/wallet-transactions?page=${pageNum}&limit=10`);
      
      if (replace) {
        setTransactions(response.data.transactions);
      } else {
        setTransactions(prev => [...prev, ...response.data.transactions]);
      }
      
      setHasMore(response.data.pagination.currentPage < response.data.pagination.totalPages);
      setPage(pageNum);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
      setIsLoading(false);
    }
  };
  
  const loadMoreTransactions = () => {
    if (hasMore && !isLoading) {
      fetchTransactions(page + 1);
    }
  };
  
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and up to 2 decimal places
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAddAmount(value);
    }
  };
  
  const addFunds = async () => {
    // Validate amount
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(addAmount) < 10) {
      toast.error('Minimum amount is ₹10');
      return;
    }
    
    setIsAddingFunds(true);
    
    try {
      // Create payment order
      const response = await api.post('/payments/wallet/add', {
        amount: parseFloat(addAmount)
      });
      
      // In a real app, you would initialize Razorpay payment flow here
      // For this demonstration, we'll simulate successful payment
      
      // Simulate payment verification after 2 seconds
      setTimeout(async () => {
        try {
          // Verify payment (mocked for demo)
          await api.post('/payments/wallet/verify', {
            orderId: response.data.id,
            paymentId: 'mock_payment_id',
            signature: 'mock_signature',
            amount: parseFloat(addAmount) * 100 // Razorpay uses smallest currency unit (paise)
          });
          
          // Refresh wallet data
          fetchWalletData();
          
          toast.success(`₹${addAmount} added to your wallet`);
          setAddAmount('');
        } catch (verifyError) {
          console.error('Error verifying payment:', verifyError);
          toast.error('Payment verification failed');
        } finally {
          setIsAddingFunds(false);
        }
      }, 2000);
    } catch (error) {
      console.error('Error adding funds:', error);
      toast.error(error.response?.data?.message || 'Failed to add funds');
      setIsAddingFunds(false);
    }
  };
  
  return (
    <div className="bg-[#fef4ea] min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#a38772] mb-6">My Wallet</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Wallet Balance Card */}
          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[#fef4ea] flex items-center justify-center mr-4">
                <FaWallet className="text-[#doa189] text-3xl" />
              </div>
              <div>
                <h2 className="text-lg text-gray-600">Your Balance</h2>
                <p className="text-3xl font-bold text-[#a38772]">{formatPrice(balance)}</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              Use your wallet balance to pay for appointments and services. Add funds to your wallet for faster checkout.
            </p>
            
            <div className="bg-[#fef4ea] rounded-lg p-4">
              <h3 className="font-semibold text-[#a38772] mb-2">
                Add Funds to Wallet
              </h3>
              
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-grow">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="text"
                    value={addAmount}
                    onChange={handleAmountChange}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#doa189]"
                    placeholder="Enter amount"
                    disabled={isAddingFunds}
                  />
                </div>
                
                <button
                  onClick={addFunds}
                  disabled={isAddingFunds || !addAmount}
                  className="flex items-center justify-center bg-[#doa189] hover:bg-[#ecdfcf] text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  {isAddingFunds ? (
                    <>
                      <LoadingSpinner size="small" className="mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaMoneyBillWave className="mr-2" />
                      Add Funds
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex gap-3 mt-3">
                {[100, 200, 500, 1000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setAddAmount(amount.toString())}
                    className="flex-1 bg-white border border-gray-300 hover:border-[#doa189] text-gray-700 py-2 rounded-lg transition-colors"
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-[#a38772] mb-4">
              Wallet Benefits
            </h2>
            
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                  <FaArrowUp className="text-green-600 text-sm" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Quick Booking</h3>
                  <p className="text-sm text-gray-600">Book services instantly without entering payment details each time.</p>
                </div>
              </li>
              
              <li className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5">
                  <FaArrowDown className="text-blue-600 text-sm" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Instant Refunds</h3>
                  <p className="text-sm text-gray-600">Get refunds directly to your wallet with no processing time.</p>
                </div>
              </li>
              
              <li className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 mt-0.5">
                  <FaHistory className="text-purple-600 text-sm" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Track Expenses</h3>
                  <p className="text-sm text-gray-600">Monitor your spending on services with detailed transaction history.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-bold text-[#a38772] mb-4 flex items-center">
            <FaHistory className="mr-2" />
            Transaction History
          </h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <LoadingSpinner />
              <p className="text-gray-500 mt-2">Loading transactions...</p>
            </div>
          ) : transactions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(transaction.timestamp), 'MMM d, yyyy • h:mm a')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.type === 'credit' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                          transaction.type === 'credit' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}{formatPrice(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {hasMore && (
                <div className="text-center mt-6">
                  <button
                    onClick={loadMoreTransactions}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-[#doa189] text-[#doa189] rounded-md hover:bg-[#fef4ea] transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="small" className="mr-2" />
                        Loading...
                      </>
                    ) : (
                      'Load More Transactions'
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="flex items-center justify-center">
                <FaHistory className="text-gray-300 text-5xl mb-3" />
              </div>
              <h3 className="text-lg font-medium text-gray-500 mb-1">No Transactions Yet</h3>
              <p className="text-gray-500">
                Your transaction history will appear here after you add funds or make a payment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;