import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';

const MetricsCards = ({ metrics }) => {
  const cards = [
    {
      title: 'You are owed',
      amount: metrics.totalOwedToYou,
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-600'
    },
    {
      title: 'You owe',
      amount: metrics.totalYouOwe,
      icon: TrendingDown,
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      textColor: 'text-red-600'
    },
    {
      title: 'Net Balance',
      amount: metrics.netBalance,
      icon: DollarSign,
      color: metrics.netBalance >= 0 ? 'green' : 'red',
      bgColor: metrics.netBalance >= 0 ? 'bg-green-50' : 'bg-red-50',
      iconColor: metrics.netBalance >= 0 ? 'text-green-600' : 'text-red-600',
      textColor: metrics.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Pending Requests',
      amount: metrics.pendingCount,
      icon: Clock,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-600',
      isCount: true
    }
  ];

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{card.title}</p>
              <p className={`text-2xl font-bold ${card.textColor}`}>
                {card.isCount ? (
                  card.amount
                ) : (
                  <>
                    {card.amount < 0 && '-'}₹{Math.abs(card.amount).toLocaleString()}
                  </>
                )}
              </p>
            </div>
            <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
              <card.icon size={24} className={card.iconColor} />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default MetricsCards;