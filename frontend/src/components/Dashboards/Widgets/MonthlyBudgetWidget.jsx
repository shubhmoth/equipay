import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { PiggyBankIcon, AlertCircleIcon, CalendarIcon, TrendingDownIcon } from 'lucide-react';

const MonthlyBudgetWidget = () => {
  const budgetData = {
    totalBudget: 75000,
    totalSpent: 48750,
    remaining: 26250,
    categories: [
      { name: 'Food & Dining', budget: 15000, spent: 12500, icon: '🍽️' },
      { name: 'Transportation', budget: 8000, spent: 6200, icon: '🚗' },
      { name: 'Shopping', budget: 12000, spent: 11800, icon: '🛍️' },
      { name: 'Entertainment', budget: 10000, spent: 5500, icon: '🎬' },
      { name: 'Bills & Utilities', budget: 20000, spent: 8750, icon: '💡' }
    ]
  };

  // Calculate daily stats
  const today = new Date();
  const currentDate = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - currentDate;
  const avgDailySpend = Math.round(budgetData.totalSpent / currentDate);
  const dailyBudgetRemaining = daysRemaining > 0 ? Math.round(budgetData.remaining / daysRemaining) : 0;

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const overallPercentage = (budgetData.totalSpent / budgetData.totalBudget) * 100;

  return (
    <motion.div 
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <PiggyBankIcon size={18} className="text-blue-600" />
          <h3 className="text-base font-semibold text-gray-900">Monthly Budget</h3>
        </div>
        <span className="text-xs text-gray-500">Dec 2025</span>
      </div>

      {/* Overall Budget Progress */}
      <div className="mb-3 p-2.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-medium text-gray-700">Overall Budget</span>
          <span className="text-sm font-bold text-gray-900">
            ₹{budgetData.totalSpent.toLocaleString()} / ₹{budgetData.totalBudget.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1.5">
          <motion.div 
            className={`h-2.5 rounded-full ${getProgressColor(overallPercentage)}`}
            initial={{ width: 0 }}
            animate={{ width: `${overallPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>{overallPercentage.toFixed(1)}% used</span>
          <span>₹{budgetData.remaining.toLocaleString()} left</span>
        </div>
      </div>

      {/* Daily Stats Row */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-orange-50 p-2 rounded-lg">
          <div className="flex items-center gap-1.5 mb-0.5">
            <TrendingDownIcon size={12} className="text-orange-600" />
            <span className="text-xs text-gray-600">Daily Average</span>
          </div>
          <p className="text-sm font-bold text-orange-700">₹{avgDailySpend.toLocaleString()}/day</p>
        </div>
        <div className="bg-green-50 p-2 rounded-lg">
          <div className="flex items-center gap-1.5 mb-0.5">
            <CalendarIcon size={12} className="text-green-600" />
            <span className="text-xs text-gray-600">Daily Budget</span>
          </div>
          <p className="text-sm font-bold text-green-700">₹{dailyBudgetRemaining.toLocaleString()}/day</p>
          <p className="text-xs text-gray-500">{daysRemaining} days left</p>
        </div>
      </div>

      {/* Category Breakdowns */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {budgetData.categories.map((category, index) => {
          const percentage = (category.spent / category.budget) * 100;
          const isOverBudget = percentage > 100;
          
          return (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">{category.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                  {isOverBudget && (
                    <AlertCircleIcon size={14} className="text-red-500" />
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  ₹{category.spent.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-1">
                <motion.div 
                  className={`h-1.5 rounded-full ${getProgressColor(percentage)} transition-all duration-300`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentage, 100)}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Budget Status Alert */}
      <motion.div 
        className={`mt-3 p-2 rounded-lg text-xs ${
          overallPercentage >= 90 ? 'bg-red-50 text-red-800' :
          overallPercentage >= 75 ? 'bg-yellow-50 text-yellow-800' :
          'bg-green-50 text-green-800'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="font-medium">
          {overallPercentage >= 90 ? 
            '⚠️ Budget limit approaching!' :
            overallPercentage >= 75 ? 
            '📊 Track your spending carefully.' :
            '✨ You\'re on track!'}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default MonthlyBudgetWidget;