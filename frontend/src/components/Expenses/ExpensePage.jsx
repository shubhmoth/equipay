import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Download, 
  Filter, 
  Search, 
  Calendar, 
  Tag, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  X, 
  Upload,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Car,
  Home,
  Utensils,
  Gamepad2,
  Heart,
  GraduationCap,
  Plane,
  Settings,
  Eye,
  FileText,
  PieChart,
  BarChart3
} from 'lucide-react';

const ExpensesPage = () => {
  // State management
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [viewMode, setViewMode] = useState('list'); // list, grid, analytics

  // Form states
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    receipt: null
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '💰',
    color: '#3B82F6'
  });

  // Mock data initialization
  useEffect(() => {
    // Initialize categories
    const defaultCategories = [
      { id: 1, name: 'Food & Dining', icon: '🍽️', color: '#EF4444', count: 12 },
      { id: 2, name: 'Transportation', icon: '🚗', color: '#3B82F6', count: 8 },
      { id: 3, name: 'Shopping', icon: '🛍️', color: '#8B5CF6', count: 15 },
      { id: 4, name: 'Entertainment', icon: '🎬', color: '#10B981', count: 6 },
      { id: 5, name: 'Healthcare', icon: '🏥', color: '#F59E0B', count: 4 },
      { id: 6, name: 'Education', icon: '📚', color: '#6366F1', count: 3 },
      { id: 7, name: 'Travel', icon: '✈️', color: '#EC4899', count: 2 },
      { id: 8, name: 'Bills & Utilities', icon: '💡', color: '#14B8A6', count: 9 }
    ];

    // Initialize expenses
    const mockExpenses = [
      {
        id: 1,
        title: 'Grocery Shopping',
        amount: 2500,
        category: 'Food & Dining',
        categoryId: 1,
        description: 'Weekly groceries from Whole Foods Market including fresh vegetables, fruits, and dairy products',
        date: '2024-12-28',
        time: '14:30',
        receipt: null,
        tags: ['grocery', 'weekly'],
        paymentMethod: 'Credit Card'
      },
      {
        id: 2,
        title: 'Uber to Airport',
        amount: 850,
        category: 'Transportation',
        categoryId: 2,
        description: 'Uber ride to the airport for business trip',
        date: '2024-12-27',
        time: '08:15',
        receipt: null,
        tags: ['business', 'travel'],
        paymentMethod: 'Cash'
      },
      {
        id: 3,
        title: 'Netflix Subscription',
        amount: 649,
        category: 'Entertainment',
        categoryId: 4,
        description: 'Monthly Netflix premium subscription',
        date: '2024-12-26',
        time: '12:00',
        receipt: null,
        tags: ['subscription', 'monthly'],
        paymentMethod: 'Auto-pay'
      },
      {
        id: 4,
        title: 'Coffee Shop',
        amount: 320,
        category: 'Food & Dining',
        categoryId: 1,
        description: 'Latte and croissant at Starbucks',
        date: '2024-12-26',
        time: '09:45',
        receipt: null,
        tags: ['coffee', 'breakfast'],
        paymentMethod: 'Debit Card'
      },
      {
        id: 5,
        title: 'Electricity Bill',
        amount: 3200,
        category: 'Bills & Utilities',
        categoryId: 8,
        description: 'Monthly electricity bill payment',
        date: '2024-12-25',
        time: '16:20',
        receipt: null,
        tags: ['utility', 'monthly'],
        paymentMethod: 'Bank Transfer'
      }
    ];

    setCategories(defaultCategories);
    setExpenses(mockExpenses);
  }, []);

  // Helper functions
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getCategoryIcon = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.icon : '💰';
  };

  const getCategoryColor = (categoryName) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category ? category.color : '#6B7280';
  };

  // Filter and search logic
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const today = new Date();
      const expenseDate = new Date(expense.date);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      switch (dateRange) {
        case 'today':
          matchesDate = expenseDate.toDateString() === today.toDateString();
          break;
        case 'week':
          matchesDate = expenseDate >= weekAgo;
          break;
        case 'month':
          matchesDate = expenseDate.getMonth() === today.getMonth() && 
                       expenseDate.getFullYear() === today.getFullYear();
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  // Sort expenses
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date) - new Date(a.date);
      case 'date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const averageExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;

  const handleAddExpense = (e) => {
    e.preventDefault();
    const newExpense = {
      id: expenses.length + 1,
      ...expenseForm,
      amount: parseFloat(expenseForm.amount),
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      tags: [],
      paymentMethod: 'Cash'
    };
    
    setExpenses([newExpense, ...expenses]);
    setExpenseForm({
      title: '',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      receipt: null
    });
    setShowAddExpense(false);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const newCategory = {
      id: categories.length + 1,
      ...categoryForm,
      count: 0
    };
    
    setCategories([...categories, newCategory]);
    setCategoryForm({
      name: '',
      icon: '💰',
      color: '#3B82F6'
    });
    setShowAddCategory(false);
  };

  const handleDeleteExpense = (expenseId) => {
    setExpenses(expenses.filter(exp => exp.id !== expenseId));
    setSelectedExpense(null);
  };

  const exportToExcel = () => {
    // Mock export functionality
    const csvContent = [
      ['Title', 'Amount', 'Category', 'Date', 'Description'],
      ...filteredExpenses.map(exp => [
        exp.title,
        exp.amount,
        exp.category,
        exp.date,
        exp.description
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const iconOptions = ['💰', '🍽️', '🚗', '🛍️', '🎬', '🏥', '📚', '✈️', '💡', '🏠', '⚽', '🎵', '📱', '👔'];
  const colorOptions = ['#EF4444', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#14B8A6'];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
              <p className="text-gray-600 mt-1">Track and manage your expenses efficiently</p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={18} />
                Export Excel
              </motion.button>
              <motion.button
                onClick={() => setShowAddExpense(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={18} />
                Add Expense
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">₹{totalExpenses.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{filteredExpenses.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Expense</p>
                <p className="text-2xl font-bold text-gray-900">₹{Math.round(averageExpense).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <PieChart size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddCategory(true)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <Tag size={16} />
                Manage Categories
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">View:</span>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <FileText size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <BarChart3 size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Expenses List */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Expense History ({sortedExpenses.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {sortedExpenses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
                <p className="text-gray-600 mb-6">Start by adding your first expense or adjust your filters.</p>
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Add First Expense
                </button>
              </div>
            ) : (
              sortedExpenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedExpense(expense)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${getCategoryColor(expense.category)}20` }}
                      >
                        {getCategoryIcon(expense.category)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{expense.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-gray-600">{expense.category}</span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{formatDate(expense.date)}</span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{expense.time}</span>
                        </div>
                        {expense.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{expense.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">₹{expense.amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{expense.paymentMethod}</p>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddExpense && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Add New Expense</h2>
                  <button
                    onClick={() => setShowAddExpense(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddExpense} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm({...expenseForm, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter expense title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                    <input
                      type="date"
                      required
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    required
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    rows="3"
                    placeholder="Optional description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Receipt (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload receipt</p>
                    <input type="file" className="hidden" accept="image/*,.pdf" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddExpense(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Expense
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddCategory && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Manage Categories</h2>
                  <button
                    onClick={() => setShowAddCategory(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Add New Category Form */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Category</h3>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                      <input
                        type="text"
                        required
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter category name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                        <div className="grid grid-cols-4 gap-2">
                          {iconOptions.map((icon, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setCategoryForm({...categoryForm, icon})}
                              className={`p-3 rounded-lg border text-xl transition-colors ${
                                categoryForm.icon === icon 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-300 hover:border-gray-400'
                              }`}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                        <div className="grid grid-cols-4 gap-2">
                          {colorOptions.map((color, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setCategoryForm({...categoryForm, color})}
                              className={`w-10 h-10 rounded-lg border-2 transition-all ${
                                categoryForm.color === color 
                                  ? 'border-gray-800 scale-110' 
                                  : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Add Category
                      </button>
                    </div>
                  </form>
                </div>

                {/* Existing Categories */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Categories</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {categories.map((category) => (
                      <div 
                        key={category.id} 
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            {category.icon}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{category.name}</p>
                            <p className="text-sm text-gray-500">{category.count} expenses</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                            <Edit3 size={14} className="text-gray-500" />
                          </button>
                          <button className="p-1 hover:bg-red-100 rounded transition-colors">
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expense Detail Modal */}
      <AnimatePresence>
        {selectedExpense && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Expense Details</h2>
                  <button
                    onClick={() => setSelectedExpense(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Expense Header */}
                <div className="text-center">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4"
                    style={{ backgroundColor: `${getCategoryColor(selectedExpense.category)}20` }}
                  >
                    {getCategoryIcon(selectedExpense.category)}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedExpense.title}</h3>
                  <p className="text-3xl font-bold text-red-600 mt-2">₹{selectedExpense.amount.toLocaleString()}</p>
                </div>

                {/* Expense Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Category</span>
                    <div className="flex items-center gap-2">
                      <span>{getCategoryIcon(selectedExpense.category)}</span>
                      <span className="font-medium">{selectedExpense.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">{formatDate(selectedExpense.date)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Time</span>
                    <span className="font-medium">{selectedExpense.time}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium">{selectedExpense.paymentMethod}</span>
                  </div>

                  {selectedExpense.description && (
                    <div>
                      <span className="text-gray-600 block mb-2">Description</span>
                      <p className="font-medium bg-gray-50 p-3 rounded-lg">{selectedExpense.description}</p>
                    </div>
                  )}

                  {selectedExpense.tags && selectedExpense.tags.length > 0 && (
                    <div>
                      <span className="text-gray-600 block mb-2">Tags</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedExpense.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // Edit functionality would go here
                      setSelectedExpense(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(selectedExpense.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpensesPage;