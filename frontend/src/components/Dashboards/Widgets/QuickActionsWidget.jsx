import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  PlusCircleIcon, 
  UsersIcon, 
  BarChart3Icon
} from 'lucide-react';

const QuickActionsWidget = () => {
  const actions = [
    {
      id: 1,
      title: 'Add Expense',
      description: 'Record new',
      icon: PlusCircleIcon,
      color: '#3B82F6',
      gradient: 'from-blue-600 to-purple-600'
    },
    {
      id: 2,
      title: 'Split Bill',
      description: 'With friends',
      icon: UsersIcon,
      color: '#10B981',
      gradient: 'from-green-600 to-emerald-600'
    },
    {
      id: 3,
      title: 'Reports',
      description: 'Analytics',
      icon: BarChart3Icon,
      color: '#EC4899',
      gradient: 'from-pink-600 to-rose-600'
    }
  ];

  return (
    <motion.div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-900">Quick Actions</h3>
      </div>

      <div className="space-y-2">
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div 
              className={`w-8 h-8 bg-gradient-to-r ${action.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <action.icon size={16} color="white" />
            </motion.div>
            <div className="text-left">
              <h4 className="text-sm font-medium text-gray-900">{action.title}</h4>
              <p className="text-xs text-gray-500">{action.description}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickActionsWidget;