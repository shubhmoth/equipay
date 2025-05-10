import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarIcon, TrendingUpIcon, InfoIcon } from 'lucide-react';

const ExpenseChartWidget = () => {
  const [activeTab, setActiveTab] = useState('month');

  // Mock data for monthly expenses
  const monthData = [
    { day: '1', expense: 850 },
    { day: '5', expense: 1200 },
    { day: '10', expense: 2100 },
    { day: '15', expense: 3500 },
    { day: '20', expense: 4200 },
    { day: '25', expense: 5100 },
    { day: '30', expense: 6500 }
  ];

  // Mock data for yearly expenses
  const yearData = [
    { month: 'Jan', expense: 45000 },
    { month: 'Feb', expense: 52000 },
    { month: 'Mar', expense: 48000 },
    { month: 'Apr', expense: 61000 },
    { month: 'May', expense: 58000 },
    { month: 'Jun', expense: 67000 },
    { month: 'Jul', expense: 72000 },
    { month: 'Aug', expense: 69000 },
    { month: 'Sep', expense: 75000 },
    { month: 'Oct', expense: 80000 },
    { month: 'Nov', expense: 78000 },
    { month: 'Dec', expense: 85000 }
  ];

  const currentData = activeTab === 'month' ? monthData : yearData;
  const dataKey = activeTab === 'month' ? 'day' : 'month';
  const currentPeriod = activeTab === 'month' ? 'December 2025' : 'Year 2025';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const prefix = activeTab === 'month' ? 'Day' : '';
      return (
        <div className="bg-white px-3 py-2 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-xs text-gray-600">{prefix} {label}</p>
          <p className="text-sm font-semibold text-gray-900">₹{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate stats based on active tab
  const totalSpent = currentData[currentData.length - 1].expense;
  const dailyAverage = activeTab === 'month' 
    ? Math.round(totalSpent / 30)
    : Math.round(totalSpent / 365);
  const budgetPercentage = activeTab === 'month' ? 65 : 75;

  return (
    <motion.div 
      className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Expense Trend</h3>
          <span className="flex items-center gap-1 text-sm text-gray-600">
            <CalendarIcon size={14} />
            {currentPeriod}
          </span>
        </div>
        <div className="flex items-center gap-2">
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
          <motion.div 
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <InfoIcon size={16} />
          </motion.div>
        </div>
      </div>

      <div className="h-48 sm:h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={currentData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis 
              dataKey={dataKey}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExpense)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
          <span className="text-xs text-gray-600 block">Total</span>
          <motion.span 
            className="text-sm sm:text-base font-semibold text-gray-900"
            key={`total-${activeTab}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            ₹{totalSpent.toLocaleString()}
          </motion.span>
        </div>
        <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
          <span className="text-xs text-gray-600 block">
            {activeTab === 'month' ? 'Daily' : 'Monthly'}
          </span>
          <motion.span 
            className="text-sm sm:text-base font-semibold text-gray-900"
            key={`average-${activeTab}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          >
            ₹{dailyAverage.toLocaleString()}
          </motion.span>
        </div>
        <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
          <span className="text-xs text-gray-600 block">Budget</span>
          <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
            <motion.div
              key={`budget-${activeTab}`}
              style={{ 
                height: '100%',
                background: '#3B82F6',
                borderRadius: '9999px'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${budgetPercentage}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
          <span className="text-sm font-semibold text-blue-600">{budgetPercentage}%</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpenseChartWidget;