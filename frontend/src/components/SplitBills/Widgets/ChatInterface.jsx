import React, { useState, useRef, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Plus, 
  X, 
  DollarSign, 
  Users, 
  Calendar,
  Receipt,
  Percent,
  Hash,
  Info,
  Check,
  Clock,
  AlertCircle
} from 'lucide-react';

const ChatInterface = ({ selectedUser, onAddExpense, onClose }) => {
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    description: '',
    splitType: 'equal', // equal, percentage, amount
    splits: [],
    date: new Date().toISOString().split('T')[0]
  });
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Initialize splits when user/group changes
  useEffect(() => {
    if (selectedUser.type === 'group') {
      const initialSplits = selectedUser.members.map(member => ({
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        value: member.name === 'You' ? 0 : 0, // Will be calculated based on split type
        isUser: member.name === 'You'
      }));
      setExpenseForm(prev => ({ ...prev, splits: initialSplits }));
    } else {
      const initialSplits = [
        { id: selectedUser.id, name: selectedUser.name, avatar: selectedUser.avatar, value: 0, isUser: false },
        { id: 'user', name: 'You', avatar: '👤', value: 0, isUser: true }
      ];
      setExpenseForm(prev => ({ ...prev, splits: initialSplits }));
    }
  }, [selectedUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedUser.expenses]);

  // Calculate splits based on type
  const calculateSplits = (amount, splitType, customSplits = null) => {
    const numPeople = expenseForm.splits.length;
    
    if (splitType === 'equal') {
      const equalAmount = amount / numPeople;
      return expenseForm.splits.map(split => ({
        ...split,
        value: Math.round(equalAmount * 100) / 100
      }));
    } else if (splitType === 'percentage') {
      return customSplits || expenseForm.splits.map(split => ({
        ...split,
        value: 0 // User needs to input percentages
      }));
    } else {
      return customSplits || expenseForm.splits.map(split => ({
        ...split,
        value: 0 // User needs to input amounts
      }));
    }
  };

  // Handle split value change
  const handleSplitChange = (splitId, value) => {
    const updatedSplits = expenseForm.splits.map(split =>
      split.id === splitId ? { ...split, value: parseFloat(value) || 0 } : split
    );
    setExpenseForm(prev => ({ ...prev, splits: updatedSplits }));
  };

  // Validate splits
  const validateSplits = () => {
    const totalAmount = parseFloat(expenseForm.amount) || 0;
    
    if (expenseForm.splitType === 'equal') {
      return true; // Always valid for equal splits
    } else if (expenseForm.splitType === 'percentage') {
      const totalPercentage = expenseForm.splits.reduce((sum, split) => sum + split.value, 0);
      return Math.abs(totalPercentage - 100) < 0.01; // Allow for small rounding errors
    } else {
      const totalSplitAmount = expenseForm.splits.reduce((sum, split) => sum + split.value, 0);
      return Math.abs(totalSplitAmount - totalAmount) < 0.01;
    }
  };

  // Handle expense submission
  const handleSubmitExpense = () => {
    if (!expenseForm.title || !expenseForm.amount) {
      alert('Please fill in title and amount');
      return;
    }

    if (!validateSplits()) {
      alert('Split amounts/percentages do not add up correctly');
      return;
    }

    const amount = parseFloat(expenseForm.amount);
    const finalSplits = calculateSplits(amount, expenseForm.splitType, expenseForm.splits);
    
    const expenseData = {
      ...expenseForm,
      amount,
      splits: finalSplits,
      recipientId: selectedUser.id,
      recipientType: selectedUser.type
    };

    onAddExpense(expenseData);
    setShowExpenseForm(false);
    setExpenseForm({
      title: '',
      amount: '',
      description: '',
      splitType: 'equal',
      splits: expenseForm.splits.map(split => ({ ...split, value: 0 })),
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Mock conversation messages
  const getConversationHistory = () => {
    if (!selectedUser.expenses || selectedUser.expenses.length === 0) {
      return [];
    }

    return selectedUser.expenses.slice(-5).map(expense => ({
      id: expense.id,
      type: 'expense',
      data: expense,
      timestamp: expense.date
    }));
  };

  const conversationHistory = getConversationHistory();

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
              {selectedUser.type === 'group' ? <Users size={20} className="text-gray-600" /> : selectedUser.avatar}
            </div>
            {selectedUser.type === 'user' && selectedUser.status === 'online' && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{selectedUser.name}</h3>
            <p className="text-sm text-gray-500">
              {selectedUser.type === 'group' 
                ? `${selectedUser.members.length} members`
                : selectedUser.status === 'online' ? 'Online' : 'Offline'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setShowExpenseForm(true)}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={16} />
          </motion.button>
          <motion.button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X size={16} />
          </motion.button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversationHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
            <p className="text-gray-500 mb-4">Start by adding your first shared expense</p>
            <motion.button
              onClick={() => setShowExpenseForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Add Expense
            </motion.button>
          </div>
        ) : (
          conversationHistory.map((message, index) => (
            <motion.div
              key={message.id}
              className="flex items-start gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
                <Receipt size={14} />
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{message.data.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{message.data.amount.toLocaleString()}
                    </span>
                    {message.data.status === 'pending' && (
                      <Clock size={14} className="text-yellow-500" />
                    )}
                    {message.data.status === 'settled' && (
                      <Check size={14} className="text-green-500" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Your share: ₹{message.data.userShare.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(message.data.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && message.trim()) {
                // Handle sending message
                setMessage('');
              }
            }}
          />
          <motion.button
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>

      {/* Expense Form Modal */}
      <AnimatePresence>
        {showExpenseForm && (
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
                  <h2 className="text-xl font-bold text-gray-900">Add Expense</h2>
                  <button
                    onClick={() => setShowExpenseForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Split with {selectedUser.name}
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Basic Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expense Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g., Dinner at restaurant"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Amount *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={(e) => {
                        const amount = e.target.value;
                        setExpenseForm(prev => ({ 
                          ...prev, 
                          amount,
                          splits: calculateSplits(parseFloat(amount) || 0, prev.splitType)
                        }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    rows="2"
                    placeholder="Optional description..."
                  />
                </div>

                {/* Split Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How to split?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const amount = parseFloat(expenseForm.amount) || 0;
                        setExpenseForm(prev => ({ 
                          ...prev, 
                          splitType: 'equal',
                          splits: calculateSplits(amount, 'equal')
                        }));
                      }}
                      className={`p-3 rounded-lg border transition-colors flex flex-col items-center gap-2 ${
                        expenseForm.splitType === 'equal'
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Users size={20} />
                      <span className="text-sm font-medium">Equal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpenseForm(prev => ({ ...prev, splitType: 'percentage' }))}
                      className={`p-3 rounded-lg border transition-colors flex flex-col items-center gap-2 ${
                        expenseForm.splitType === 'percentage'
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Percent size={20} />
                      <span className="text-sm font-medium">Percentage</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpenseForm(prev => ({ ...prev, splitType: 'amount' }))}
                      className={`p-3 rounded-lg border transition-colors flex flex-col items-center gap-2 ${
                        expenseForm.splitType === 'amount'
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Hash size={20} />
                      <span className="text-sm font-medium">Amount</span>
                    </button>
                  </div>
                </div>

                {/* Split Details */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Split breakdown
                    </label>
                    {!validateSplits() && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle size={14} />
                        <span className="text-xs">Invalid split</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {expenseForm.splits.map((split) => (
                      <div key={split.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
                            {split.avatar}
                          </div>
                          <span className="font-medium text-gray-900">{split.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {expenseForm.splitType !== 'equal' && (
                            <input
                              type="number"
                              min="0"
                              step={expenseForm.splitType === 'percentage' ? '0.1' : '0.01'}
                              value={split.value}
                              onChange={(e) => handleSplitChange(split.id, e.target.value)}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                          )}
                          <span className="text-sm text-gray-600 min-w-[60px] text-right">
                            {expenseForm.splitType === 'equal' && `₹${split.value.toFixed(2)}`}
                            {expenseForm.splitType === 'percentage' && `${split.value}%`}
                            {expenseForm.splitType === 'amount' && `₹${split.value.toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info box */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">How it works:</p>
                      <p>
                        The expense will be sent as a request to {selectedUser.name}. 
                        They need to accept it before it's added to your shared expenses.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowExpenseForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitExpense}
                    disabled={!expenseForm.title || !expenseForm.amount || !validateSplits()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Send Request
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChatInterface;