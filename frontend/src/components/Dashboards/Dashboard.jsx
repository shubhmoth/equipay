import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import ExpenseChartWidget from './Widgets/ExpenseChartWidget';
import SpendAnalyzerWidget from './Widgets/SpendAnalyzerWidget';
import SplitExpensesWidget from './Widgets/SplitExpensesWidget';
import QuickActionsWidget from './Widgets/QuickActionsWidget';
import TopExpensesWidget from './Widgets/TopExpensesWidget';
import TransactionsList from './Widgets/TransactionsList';
import MonthlyBudgetWidget from './Widgets/MonthlyBudgetWidget';
import BillsSubscriptionsWidget from './Widgets/BillsSubscriptionsWidget';
import DebtsOwedWidget from './Widgets/DebtsOwedWidget';

const Dashboard = () => {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = 'Here\'s your financial overview';
  
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="mb-8" variants={itemVariants}>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold text-gray-900"
          >
            Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">John Doe</span>
          </motion.h1>
          <motion.p 
            className="text-gray-600 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {displayedText}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="ml-1"
            >
              |
            </motion.span>
          </motion.p>
        </motion.div>

        <motion.div className="grid grid-cols-12 gap-6" variants={containerVariants}>
          {/* First Row */}
          {/* Expense Chart - spans 4 columns */}
          <motion.div className="col-span-12 md:col-span-4" variants={itemVariants}>
            <ExpenseChartWidget />
          </motion.div>

          {/* Spend Analyzer - spans 4 columns */}
          <motion.div className="col-span-12 md:col-span-4" variants={itemVariants}>
            <SpendAnalyzerWidget />
          </motion.div>

          {/* Split & Actions Column - spans 4 columns */}
          <motion.div className="col-span-12 md:col-span-4 space-y-6" variants={itemVariants}>
            {/* Split Overview - smaller height */}
            <SplitExpensesWidget />
            {/* Quick Actions */}
            <QuickActionsWidget />
          </motion.div>

          {/* Second Row */}
          {/* Top Expenses - spans 6 columns */}
          <motion.div className="col-span-12 md:col-span-6" variants={itemVariants}>
            <TopExpensesWidget />
          </motion.div>

          {/* Recent Transactions - spans 6 columns */}
          <motion.div className="col-span-12 md:col-span-6" variants={itemVariants}>
            <TransactionsList />
          </motion.div>

          {/* Third Row - New Widgets */}
          {/* Monthly Budget - spans 4 columns */}
          <motion.div className="col-span-12 md:col-span-4" variants={itemVariants}>
            <MonthlyBudgetWidget />
          </motion.div>

          {/* Bills & Subscriptions - spans 4 columns */}
          <motion.div className="col-span-12 md:col-span-4" variants={itemVariants}>
            <BillsSubscriptionsWidget />
          </motion.div>

          {/* Debts & Owed - spans 4 columns */}
          <motion.div className="col-span-12 md:col-span-4" variants={itemVariants}>
            <DebtsOwedWidget />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Dashboard Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <span>💰</span>
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Equipay</span>
            </div>
            <p className="text-sm text-gray-500">© 2025 Equipay. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;