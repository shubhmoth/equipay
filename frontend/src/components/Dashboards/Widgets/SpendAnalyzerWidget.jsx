import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { CalendarIcon, TrendingUpIcon, TrendingDownIcon, WalletIcon } from 'lucide-react';

const SpendAnalyzerWidget = () => {
  const [activeTab, setActiveTab] = useState('month');
  const [activeIndex, setActiveIndex] = useState(null);

  const monthData = {
    categories: [
      { name: 'Groceries', value: 35, amount: 8500, color: '#3B82F6' },
      { name: 'Transportation', value: 17, amount: 4200, color: '#10B981' },
      { name: 'Entertainment', value: 14, amount: 3500, color: '#F59E0B' },
      { name: 'Others', value: 34, amount: 8300, color: '#6B7280' }
    ],
    topSpends: [
      { name: 'Rent Pay', amount: 8000, category: 'Housing' },
      { name: 'Shopping', amount: 2500, category: 'Entertainment' },
      { name: 'Phone Bill', amount: 1200, category: 'Utilities' },
      { name: 'Groceries', amount: 850, category: 'Food' },
      { name: 'Netflix', amount: 649, category: 'Entertainment' }
    ],
    totalSpend: 24500,
    percentChange: 12.5,
    highestCategory: 'Groceries',
    savingsOpportunity: 'Transportation'
  };

  const yearData = {
    categories: [
      { name: 'Rent', value: 40, amount: 120000, color: '#EF4444' },
      { name: 'Groceries', value: 28, amount: 85000, color: '#3B82F6' },
      { name: 'Transportation', value: 15, amount: 45000, color: '#10B981' },
      { name: 'Others', value: 17, amount: 50000, color: '#6B7280' }
    ],
    topSpends: [
      { name: 'Yearly Rent', amount: 120000, category: 'Housing' },
      { name: 'Car Loan', amount: 48000, category: 'Transportation' },
      { name: 'Shopping', amount: 35000, category: 'Entertainment' },
      { name: 'Medical', amount: 15000, category: 'Healthcare' },
      { name: 'Insurance', amount: 12000, category: 'Finance' }
    ],
    totalSpend: 300000,
    percentChange: -5.2,
    highestCategory: 'Rent',
    savingsOpportunity: 'Shopping'
  };

  const currentData = activeTab === 'month' ? monthData : yearData;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white px-3 py-2 border border-gray-200 rounded-lg shadow-lg"
        >
          <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">₹{payload[0].payload.amount.toLocaleString()}</p>
          <p className="text-xs text-gray-500">{payload[0].value}%</p>
        </motion.div>
      );
    }
    return null;
  };

  const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
            cursor: 'pointer'
          }}
        />
        <text 
          x={cx} 
          y={cy - 10} 
          textAnchor="middle" 
          fill="#374151"
          fontSize="14"
          fontWeight="600"
        >
          {payload.name}
        </text>
        <text 
          x={cx} 
          y={cy + 10} 
          textAnchor="middle" 
          fill="#374151"
          fontSize="18"
          fontWeight="700"
        >
          {`${percent}%`}
        </text>
      </g>
    );
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
        <h3 className="text-base font-semibold text-gray-900">Spend Analyzer</h3>
        <div className="bg-gray-100 rounded-lg p-1">
          <div className="flex">
            <motion.button
              className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                activeTab === 'month' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('month')}
              whileTap={{ scale: 0.95 }}
            >
              <CalendarIcon size={10} />
              Monthly
            </motion.button>
            <motion.button
              className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                activeTab === 'year' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('year')}
              whileTap={{ scale: 0.95 }}
            >
              <TrendingUpIcon size={10} />
              Yearly
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        {/* Left Stats */}
        <div className="space-y-2">
          <motion.div 
            className="text-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-gray-500 block text-xs">Total Spend</span>
            <span className="font-bold text-gray-900">₹{currentData.totalSpend.toLocaleString()}</span>
          </motion.div>
          <motion.div 
            className="text-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-gray-500 block text-xs">vs Last Period</span>
            <span className={`font-bold flex items-center gap-1 ${
              currentData.percentChange > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {currentData.percentChange > 0 ? (
                <TrendingUpIcon size={12} />
              ) : (
                <TrendingDownIcon size={12} />
              )}
              {Math.abs(currentData.percentChange)}%
            </span>
          </motion.div>
        </div>

        {/* Pie Chart */}
        <AnimatePresence mode="wait">
          <motion.div 
            className="h-36 w-36"
            key={activeTab}
            initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 180 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={currentData.categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={55}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                >
                  {currentData.categories.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{
                        filter: activeIndex === index ? 'brightness(1.1)' : 'brightness(1)',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>

        {/* Right Stats */}
        <div className="space-y-2">
          <motion.div 
            className="text-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-gray-500 block text-xs">Highest</span>
            <span className="font-bold text-gray-900">{currentData.highestCategory}</span>
          </motion.div>
          <motion.div 
            className="text-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-gray-500 block text-xs">Save on</span>
            <span className="font-bold text-blue-600">{currentData.savingsOpportunity}</span>
          </motion.div>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-900">Top 5 Expenses</h4>
          <WalletIcon size={14} className="text-gray-400" />
        </div>
        <div className="space-y-1.5">
          {currentData.topSpends.map((spend, index) => (
            <motion.div
              key={spend.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="flex items-center justify-between p-1.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{spend.name}</p>
                <p className="text-xs text-gray-500">{spend.category}</p>
              </div>
              <motion.span 
                className="text-sm font-semibold text-gray-900"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 + 0.2, type: "spring" }}
              >
                ₹{spend.amount.toLocaleString()}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SpendAnalyzerWidget;