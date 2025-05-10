import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { HandCoinsIcon, ArrowUpIcon, ArrowDownIcon, ClockIcon } from 'lucide-react';

const DebtsOwedWidget = () => {
  const debtsData = {
    debts: [
      { id: 1, name: 'Credit Card - HDFC', amount: 45000, minPayment: 4500, dueDate: '2025-01-15', apr: '42%', icon: '💳' },
      { id: 2, name: 'Personal Loan', amount: 120000, minPayment: 8500, dueDate: '2025-01-05', apr: '16%', icon: '🏦' },
      { id: 3, name: 'Car Loan EMI', amount: 280000, minPayment: 15000, dueDate: '2025-01-01', apr: '9%', icon: '🚗' }
    ],
    owed: [
      { id: 4, name: 'Rent from Tenant', amount: 25000, dueDate: '2025-01-01', status: 'pending', icon: '🏠' },
      { id: 5, name: 'Freelance Project', amount: 35000, dueDate: '2025-12-31', status: 'overdue', icon: '💻' },
      { id: 6, name: 'Friend - Dinner Split', amount: 1200, dueDate: '2025-12-28', status: 'pending', icon: '🍽️' }
    ]
  };

  const totalDebts = debtsData.debts.reduce((sum, debt) => sum + debt.amount, 0);
  const totalOwed = debtsData.owed.reduce((sum, owed) => sum + owed.amount, 0);
  const netPosition = totalOwed - totalDebts;

  const getDaysUntil = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status, daysLeft) => {
    if (status === 'overdue' || daysLeft < 0) return 'text-red-600 bg-red-50';
    if (daysLeft <= 7) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <motion.div 
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <HandCoinsIcon size={20} className="text-indigo-600" />
          <h3 className="text-base font-semibold text-gray-900">Debts & Receivables</h3>
        </div>
      </div>

      {/* Net Position Summary */}
      <div className={`mb-4 p-3 rounded-xl ${
        netPosition >= 0 ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-red-50 to-orange-50'
      }`}>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Net Position</span>
          <span className={`text-lg font-bold ${netPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netPosition >= 0 ? '+' : '-'}₹{Math.abs(netPosition).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>Total Debt: ₹{totalDebts.toLocaleString()}</span>
          <span>Total Owed: ₹{totalOwed.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Top Debts */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <ArrowUpIcon size={14} className="text-red-500" />
            Top Debts
          </h4>
          <div className="space-y-2">
            {debtsData.debts.map((debt, index) => {
              const daysLeft = getDaysUntil(debt.dueDate);
              
              return (
                <motion.div
                  key={debt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-2.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-pointer group"
                  whileHover={{ x: 2 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{debt.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{debt.name}</p>
                        <p className="text-xs text-gray-600">APR: {debt.apr}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-red-600">₹{debt.amount.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <ClockIcon size={10} />
                      {daysLeft} days
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    Min payment: ₹{debt.minPayment.toLocaleString()}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Top Owed */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <ArrowDownIcon size={14} className="text-green-500" />
            Money Owed to You
          </h4>
          <div className="space-y-2">
            {debtsData.owed.map((owed, index) => {
              const daysLeft = getDaysUntil(owed.dueDate);
              const statusStyle = getStatusColor(owed.status, daysLeft);
              
              return (
                <motion.div
                  key={owed.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-2.5 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer group"
                  whileHover={{ x: -2 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{owed.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{owed.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyle}`}>
                          {owed.status === 'overdue' ? 'Overdue' : `Due in ${daysLeft} days`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-green-600">₹{owed.amount.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(owed.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        className="w-full mt-4 p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <HandCoinsIcon size={16} />
        Manage All Debts
      </motion.button>
    </motion.div>
  );
};

export default DebtsOwedWidget;