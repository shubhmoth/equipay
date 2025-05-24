import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  DollarSign, 
  Users, 
  Check, 
  Plus,
  Minus,
  Zap,
  Calculator,
  Clock,
  Search
} from 'lucide-react';

const QuickSplitModal = ({ isOpen, onClose, availableUsers, onAddExpense }) => {
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Select People, 3: Split Details, 4: Confirmation
  const [splitData, setSplitData] = useState({
    title: '',
    amount: '',
    description: '',
    selectedUsers: [],
    splitType: 'equal', // equal, percentage, amount, custom
    splits: [],
    date: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setStep(1);
    setSplitData({
      title: '',
      amount: '',
      description: '',
      selectedUsers: [],
      splitType: 'equal',
      splits: [],
      date: new Date().toISOString().split('T')[0]
    });
    setSearchTerm('');
  };

  const handleUserToggle = (user) => {
    setSplitData(prev => {
      const isSelected = prev.selectedUsers.some(u => u.id === user.id);
      if (isSelected) {
        return {
          ...prev,
          selectedUsers: prev.selectedUsers.filter(u => u.id !== user.id)
        };
      } else {
        return {
          ...prev,
          selectedUsers: [...prev.selectedUsers, user]
        };
      }
    });
  };

  const calculateSplits = () => {
    const amount = parseFloat(splitData.amount) || 0;
    const totalPeople = splitData.selectedUsers.length + 1; // +1 for user

    if (splitData.splitType === 'equal') {
      const equalAmount = amount / totalPeople;
      return [
        ...splitData.selectedUsers.map(user => ({
          ...user,
          amount: equalAmount,
          percentage: (100 / totalPeople)
        })),
        {
          id: 'user',
          name: 'You',
          avatar: '👤',
          amount: equalAmount,
          percentage: (100 / totalPeople)
        }
      ];
    }
    return splitData.splits;
  };

  const handleSubmit = () => {
    const finalSplits = calculateSplits();
    const expenseData = {
      ...splitData,
      splits: finalSplits,
      recipients: splitData.selectedUsers.map(user => user.id),
      type: 'quick_split'
    };

    onAddExpense(expenseData);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Zap size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Quick Split</h2>
                  <p className="text-sm text-gray-600">Split instantly without groups</p>
                </div>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step >= stepNumber 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > stepNumber ? <Check size={16} /> : stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`flex-1 h-1 mx-2 rounded transition-colors ${
                      step > stepNumber ? 'bg-purple-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What did you spend on? *
                  </label>
                  <input
                    type="text"
                    value={splitData.title}
                    onChange={(e) => setSplitData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="e.g., Dinner at Pizza Hut"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount *
                  </label>
                  <div className="relative">
                    <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      value={splitData.amount}
                      onChange={(e) => setSplitData(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={splitData.description}
                    onChange={(e) => setSplitData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                    rows="3"
                    placeholder="Add any notes about this expense..."
                  />
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Zap size={16} className="text-purple-600 mt-0.5" />
                    <div className="text-sm text-purple-800">
                      <p className="font-medium mb-1">Quick Split Benefits:</p>
                      <ul className="text-xs space-y-1">
                        <li>• No need to create groups</li>
                        <li>• Instant expense requests to multiple people</li>
                        <li>• Smart calculation and fair splitting</li>
                        <li>• Easy settlement tracking</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Select People */}
            {step === 2 && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Who shared this expense? ({splitData.selectedUsers.length} selected)
                  </label>
                  
                  <div className="relative mb-4">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      placeholder="Search friends..."
                    />
                  </div>

                  {/* Selected Users Preview */}
                  {splitData.selectedUsers.length > 0 && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Selected:</p>
                      <div className="flex flex-wrap gap-2">
                        {splitData.selectedUsers.map(user => (
                          <div key={user.id} className="flex items-center gap-2 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                            <span>{user.avatar}</span>
                            <span>{user.name}</span>
                            <button
                              onClick={() => handleUserToggle(user)}
                              className="hover:bg-purple-200 rounded-full p-0.5"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm">
                          <span>👤</span>
                          <span>You</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Available Users */}
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredUsers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <Users size={24} className="mx-auto mb-2 text-gray-400" />
                        <p>No friends found</p>
                      </div>
                    ) : (
                      filteredUsers.map(user => {
                        const isSelected = splitData.selectedUsers.some(u => u.id === user.id);
                        return (
                          <div
                            key={user.id}
                            className={`flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                              isSelected ? 'bg-purple-50' : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleUserToggle(user)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                                {user.avatar}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              isSelected 
                                ? 'border-purple-600 bg-purple-600' 
                                : 'border-gray-300'
                            }`}>
                              {isSelected && <Check size={12} className="text-white" />}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Split Details */}
            {step === 3 && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How should we split ₹{splitData.amount}?
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={() => setSplitData(prev => ({ ...prev, splitType: 'equal' }))}
                      className={`p-4 rounded-lg border transition-colors ${
                        splitData.splitType === 'equal'
                          ? 'border-purple-500 bg-purple-50 text-purple-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Users size={24} className="mx-auto mb-2" />
                      <p className="font-medium">Split Equally</p>
                      <p className="text-xs text-gray-500">Fair share for everyone</p>
                    </button>
                    <button
                      onClick={() => setSplitData(prev => ({ ...prev, splitType: 'custom' }))}
                      className={`p-4 rounded-lg border transition-colors ${
                        splitData.splitType === 'custom'
                          ? 'border-purple-500 bg-purple-50 text-purple-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Calculator size={24} className="mx-auto mb-2" />
                      <p className="font-medium">Custom Split</p>
                      <p className="text-xs text-gray-500">Set custom amounts</p>
                    </button>
                  </div>

                  {/* Split Preview */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Split Breakdown:</h4>
                    <div className="space-y-2">
                      {calculateSplits().map((person, index) => (
                        <div key={person.id || index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{person.avatar}</span>
                            <span className="font-medium">{person.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-gray-900">
                              ₹{person.amount?.toFixed(2) || '0.00'}
                            </span>
                            {splitData.splitType === 'equal' && (
                              <p className="text-xs text-gray-500">
                                {person.percentage?.toFixed(1)}%
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Split!</h3>
                  <p className="text-gray-600">Review your expense details before sending requests</p>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">{splitData.title}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Amount</p>
                      <p className="font-bold text-lg">₹{splitData.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">People Involved</p>
                      <p className="font-bold text-lg">{splitData.selectedUsers.length + 1}</p>
                    </div>
                  </div>
                  {splitData.description && (
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <p className="text-gray-600 text-sm">Description</p>
                      <p className="text-gray-900">{splitData.description}</p>
                    </div>
                  )}
                </div>

                {/* What happens next */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock size={16} className="text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">What happens next:</p>
                      <ul className="text-xs space-y-1">
                        <li>• Expense requests sent to all selected friends</li>
                        <li>• They'll receive notifications to accept/reject</li>
                        <li>• Once accepted, amounts are tracked automatically</li>
                        <li>• You can settle up when convenient</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (step < 4) {
                    // Validation for each step
                    if (step === 1 && (!splitData.title.trim() || !splitData.amount)) {
                      alert('Please fill in title and amount');
                      return;
                    }
                    if (step === 2 && splitData.selectedUsers.length === 0) {
                      alert('Please select at least one person to split with');
                      return;
                    }
                    setStep(step + 1);
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={
                  (step === 1 && (!splitData.title.trim() || !splitData.amount)) ||
                  (step === 2 && splitData.selectedUsers.length === 0)
                }
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
              >
                {step < 4 ? 'Next' : 'Send Requests'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickSplitModal;