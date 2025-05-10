import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

const SplitExpensesWidget = () => {
  // Mock data
  const splitData = {
    totalBorrowings: 2500,
    totalReceivables: 3200,
    netAmount: 700,
    pendingRequests: 3
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1 }
  };

  const isPositive = splitData.netAmount > 0;

  return (
    <motion.div 
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 relative overflow-hidden"
      variants={cardVariants}
      whileHover={{ 
        scale: 1.01,
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)"
      }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full -translate-y-16 translate-x-16 opacity-50" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-semibold text-gray-900">Split Overview</h3>
          <motion.div 
            className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-medium border border-amber-200"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            {splitData.pendingRequests} pending
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.div 
            className="bg-gradient-to-br from-rose-50 to-red-50 border border-red-100 rounded-xl p-3 relative overflow-hidden"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-100 rounded-full -translate-y-10 translate-x-10 opacity-30" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <ArrowDownIcon size={16} className="text-red-500" />
              </div>
              <div>
                <span className="text-xs text-gray-600 block mb-0.5">Borrowed</span>
                <div className="text-sm font-bold text-red-600">
                  ₹{splitData.totalBorrowings.toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-gradient-to-br from-emerald-50 to-green-50 border border-green-100 rounded-xl p-3 relative overflow-hidden"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -translate-y-10 translate-x-10 opacity-30" />
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <ArrowUpIcon size={16} className="text-green-500" />
              </div>
              <div>
                <span className="text-xs text-gray-600 block mb-0.5">To Receive</span>
                <div className="text-sm font-bold text-green-600">
                  ₹{splitData.totalReceivables.toLocaleString()}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          className={`rounded-xl p-4 relative overflow-hidden ${
            isPositive 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
              : 'bg-gradient-to-r from-orange-500 to-red-600'
          }`}
          whileHover={{ scale: 1.02 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Animated background pattern */}
          <motion.div 
            className="absolute inset-0 opacity-10"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          />
          
          {/* Floating icon */}
          <motion.div 
            className="absolute top-2 right-2"
            animate={{ 
              y: [0, -5, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {isPositive ? (
              <TrendingUpIcon size={24} className="text-white opacity-20" />
            ) : (
              <TrendingDownIcon size={24} className="text-white opacity-20" />
            )}
          </motion.div>

          <div className="relative z-10 text-center text-white">
            <span className="text-xs font-medium opacity-90 block mb-1">Net Balance</span>
            <motion.div 
              className="text-2xl font-bold mb-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                delay: 0.3
              }}
            >
              {isPositive ? '+' : '-'}₹{Math.abs(splitData.netAmount).toLocaleString()}
            </motion.div>
            <span className="text-xs font-medium opacity-80">
              {isPositive ? 'You are owed' : 'You owe'}
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplitExpensesWidget;