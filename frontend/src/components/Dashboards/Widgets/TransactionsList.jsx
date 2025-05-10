import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  ArrowUpRightIcon, 
  ArrowDownLeftIcon, 
  ShoppingCartIcon,
  CoffeeIcon,
  BusIcon,
  HomeIcon,
  UsersIcon,
  MoreHorizontalIcon
} from 'lucide-react';

const TransactionsList = () => {
  // Mock data
  const transactions = [
    {
      id: 1,
      type: 'expense',
      category: 'Groceries',
      description: 'Whole Foods Market',
      amount: 2500,
      date: '2025-12-28',
      time: '2:30 PM',
      icon: ShoppingCartIcon,
      color: '#EF4444'
    },
    {
      id: 2,
      type: 'receivable',
      category: 'Split Bill',
      description: 'Dinner with friends',
      amount: 850,
      date: '2025-12-27',
      time: '8:45 PM',
      icon: UsersIcon,
      color: '#06B6D4'
    },
    {
      id: 3,
      type: 'expense',
      category: 'Transportation',
      description: 'Uber ride',
      amount: 320,
      date: '2025-12-27',
      time: '5:15 PM',
      icon: BusIcon,
      color: '#3B82F6'
    },
    {
      id: 4,
      type: 'borrowing',
      category: 'Rent Split',
      description: 'Monthly rent - John',
      amount: 15000,
      date: '2025-12-26',
      time: '10:00 AM',
      icon: HomeIcon,
      color: '#F97316'
    }
  ];

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'expense':
        return <ArrowUpRightIcon size={10} />;
      case 'receivable':
      case 'borrowing':
        return <ArrowDownLeftIcon size={10} />;
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 h-full relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full -translate-y-24 translate-x-24 opacity-30" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>
            <p className="text-xs text-gray-500 mt-0.5">Your latest activity</p>
          </div>
          <motion.button 
            className="group flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All
            <MoreHorizontalIcon size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
          </motion.button>
        </div>

        <div className="space-y-2">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              className="group relative flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-300 cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4 }}
            >
              {/* Left side gradient accent */}
              <motion.div 
                className="absolute left-0 top-0 bottom-0 w-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: transaction.color }}
                initial={{ scaleY: 0 }}
                whileHover={{ scaleY: 1 }}
                transition={{ duration: 0.3 }}
              />
              
              <div className="flex items-center gap-3">
                <motion.div 
                  className="relative w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: `${transaction.color}10`, border: `1px solid ${transaction.color}20` }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <transaction.icon size={24} color={transaction.color} />
                  {/* Transaction type indicator */}
                  <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-sm ${
                    transaction.type === 'expense' ? 'bg-red-500' : 'bg-green-500'
                  } text-white`}>
                    {getTransactionIcon(transaction.type)}
                  </div>
                </motion.div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{transaction.description}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span>{transaction.category}</span>
                    <span className="text-gray-300">•</span>
                    <span>{formatDate(transaction.date)}</span>
                    <span className="text-gray-300">•</span>
                    <span>{transaction.time}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <motion.div 
                  className={`text-sm font-bold ${
                    transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.05 + 0.2, type: "spring", stiffness: 200 }}
                >
                  {transaction.type === 'expense' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                </motion.div>
                <motion.div 
                  className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ y: 5 }}
                  animate={{ y: 0 }}
                >
                  Click to view details
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* More transactions indicator */}
        <motion.div 
          className="mt-3 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-1">
            <div className="w-1 h-1 rounded-full bg-gray-300 animate-pulse" />
            <div className="w-1 h-1 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-1 h-1 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TransactionsList;