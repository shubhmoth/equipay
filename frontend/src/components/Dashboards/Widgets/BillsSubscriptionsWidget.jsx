import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { CalendarDaysIcon, BellIcon, CheckCircleIcon, AlertTriangleIcon } from 'lucide-react';

const BillsSubscriptionsWidget = () => {
  const billsData = {
    upcoming: [
      { id: 1, name: 'Netflix', amount: 649, dueDate: '2025-12-30', status: 'pending', icon: '📺', color: '#E50914' },
      { id: 2, name: 'Electricity Bill', amount: 3200, dueDate: '2025-12-28', status: 'pending', icon: '⚡', color: '#F59E0B' },
      { id: 3, name: 'Home Rent', amount: 25000, dueDate: '2025-01-01', status: 'pending', icon: '🏠', color: '#3B82F6' },
      { id: 4, name: 'Internet', amount: 899, dueDate: '2025-01-05', status: 'pending', icon: '🌐', color: '#10B981' }
    ],
    recent: [
      { id: 5, name: 'Spotify', amount: 119, paidDate: '2025-12-15', status: 'paid', icon: '🎵', color: '#1DB954' },
      { id: 6, name: 'Gym Membership', amount: 1500, paidDate: '2025-12-10', status: 'paid', icon: '💪', color: '#EC4899' }
    ]
  };

  const calculateDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateColor = (daysLeft) => {
    if (daysLeft <= 2) return 'text-red-600';
    if (daysLeft <= 7) return 'text-yellow-600';
    return 'text-green-600';
  };

  const totalUpcoming = billsData.upcoming.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <motion.div 
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <CalendarDaysIcon size={20} className="text-purple-600" />
          <h3 className="text-base font-semibold text-gray-900">Bills & Subscriptions</h3>
        </div>
        <motion.button
          className="p-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <BellIcon size={16} />
        </motion.button>
      </div>

      {/* Upcoming Bills Total */}
      <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total Due This Month</span>
          <span className="text-lg font-bold text-orange-600">
            ₹{totalUpcoming.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Upcoming Bills */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <AlertTriangleIcon size={14} className="text-orange-500" />
          Upcoming Bills
        </h4>
        <div className="space-y-2">
          {billsData.upcoming.map((bill, index) => {
            const daysLeft = calculateDaysLeft(bill.dueDate);
            
            return (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                whileHover={{ x: 2 }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${bill.color}20` }}
                  >
                    {bill.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{bill.name}</p>
                    <p className={`text-xs font-semibold ${getDueDateColor(daysLeft)}`}>
                      {daysLeft === 0 ? 'Due today' : 
                       daysLeft === 1 ? 'Due tomorrow' : 
                       daysLeft < 0 ? 'Overdue' : 
                       `Due in ${daysLeft} days`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₹{bill.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Payments */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <CheckCircleIcon size={14} className="text-green-500" />
          Recent Payments
        </h4>
        <div className="space-y-2">
          {billsData.recent.map((bill, index) => (
            <motion.div
              key={bill.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.2 }}
              className="flex items-center justify-between p-2 rounded-lg bg-green-50 bg-opacity-50"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm opacity-60"
                  style={{ backgroundColor: `${bill.color}20` }}
                >
                  {bill.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{bill.name}</p>
                  <p className="text-xs text-gray-500">Paid on {new Date(bill.paidDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">₹{bill.amount.toLocaleString()}</span>
                <CheckCircleIcon size={16} className="text-green-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default BillsSubscriptionsWidget;