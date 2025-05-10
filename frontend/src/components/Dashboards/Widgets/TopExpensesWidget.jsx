import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { CalendarIcon, TrendingUpIcon, PieChartIcon } from 'lucide-react';

const TopExpensesWidget = () => {
  const [activeTab, setActiveTab] = useState('month');

  // Mock data
  const monthlyExpenses = [
    { category: 'Groceries', amount: 8500, percentage: 35, color: '#EF4444' },
    { category: 'Transportation', amount: 4200, percentage: 17, color: '#06B6D4' },
    { category: 'Entertainment', amount: 3500, percentage: 14, color: '#3B82F6' },
    { category: 'Utilities', amount: 2800, percentage: 11, color: '#F97316' },
    { category: 'Dining Out', amount: 2100, percentage: 8, color: '#10B981' }
  ];

  const yearlyExpenses = [
    { category: 'Rent', amount: 120000, percentage: 40, color: '#EF4444' },
    { category: 'Groceries', amount: 85000, percentage: 28, color: '#06B6D4' },
    { category: 'Transportation', amount: 45000, percentage: 15, color: '#3B82F6' },
    { category: 'Healthcare', amount: 25000, percentage: 8, color: '#F97316' },
    { category: 'Shopping', amount: 15000, percentage: 5, color: '#10B981' }
  ];

  const expenses = activeTab === 'month' ? monthlyExpenses : yearlyExpenses;

  return (
    <motion.div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 h-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Top Expenses</h3>
        <div className="bg-gray-100 rounded-lg p-1">
          <div className="flex">
            <motion.button
              className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1 transition-colors ${
                activeTab === 'month' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('month')}
              whileTap={{ scale: 0.95 }}
            >
              <CalendarIcon size={12} />
              <span className="hidden sm:inline">Monthly</span>
              <span className="sm:hidden">M</span>
            </motion.button>
            <motion.button
              className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1 transition-colors ${
                activeTab === 'year' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('year')}
              whileTap={{ scale: 0.95 }}
            >
              <TrendingUpIcon size={12} />
              <span className="hidden sm:inline">Yearly</span>
              <span className="sm:hidden">Y</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
        {expenses.map((expense, index) => (
          <motion.div
            key={expense.category}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ x: 3 }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0" 
                style={{ backgroundColor: expense.color }}
              />
              <span className="text-sm font-medium text-gray-700">{expense.category}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-sm font-semibold text-gray-900 w-16 sm:w-20 text-right">
                ₹{expense.amount.toLocaleString()}
              </span>
              <div className="w-12 sm:w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: expense.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${expense.percentage}%` }}
                  transition={{ delay: index * 0.05 + 0.2, duration: 0.6 }}
                />
              </div>
              <span className="text-xs text-gray-600 w-8 text-right">{expense.percentage}%</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 text-blue-600 text-sm cursor-pointer hover:text-blue-700"
        whileHover={{ x: 5 }}
      >
        <PieChartIcon size={14} />
        <span>View detailed analytics</span>
      </motion.div>
    </motion.div>
  );
};

export default TopExpensesWidget;