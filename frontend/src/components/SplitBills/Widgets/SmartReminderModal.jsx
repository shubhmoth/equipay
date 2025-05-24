/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Clock, 
  Bell, 
  MessageCircle,
  DollarSign,
  Calendar,
  Users,
  Send,
  Smartphone,
  Mail,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const SmartReminderModal = ({ isOpen, onClose, users, groups }) => {
  const [activeTab, setActiveTab] = useState('auto'); // auto, manual, scheduled
  const [reminderSettings, setReminderSettings] = useState({
    autoReminders: true,
    reminderFrequency: 'weekly', // daily, weekly, monthly
    gentleMode: true,
    smartTiming: true,
    channels: ['push', 'email'] // push, email, sms
  });
  const [manualReminders, setManualReminders] = useState([]);
  const [selectedDebtor, setSelectedDebtor] = useState(null);
  const [customMessage, setCustomMessage] = useState('');

  // Calculate pending debts
  const calculatePendingDebts = () => {
    const pendingDebts = [];
    
    // From individual friends
    users.forEach(user => {
      if (user.balance < 0) { // They owe you
        pendingDebts.push({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          amount: Math.abs(user.balance),
          type: 'individual',
          lastReminder: null,
          overdueDays: Math.floor(Math.random() * 15) + 1 // Mock overdue days
        });
      }
    });

    // From groups
    groups.forEach(group => {
      if (group.userBalance < 0) { // You owe the group
        pendingDebts.push({
          id: group.id,
          name: group.name,
          avatar: '👥',
          amount: Math.abs(group.userBalance),
          type: 'group',
          members: group.members.length,
          lastReminder: null,
          overdueDays: Math.floor(Math.random() * 10) + 1
        });
      }
    });

    return pendingDebts.sort((a, b) => b.amount - a.amount);
  };

  const pendingDebts = calculatePendingDebts();

  // Smart reminder suggestions
  const getSmartSuggestions = () => {
    return pendingDebts.map(debt => {
      let urgency = 'low';
      let suggestedMessage = '';
      let bestTime = '';

      if (debt.overdueDays > 10) {
        urgency = 'high';
        suggestedMessage = `Hi ${debt.name}! Just a friendly reminder about our pending payment of ₹${debt.amount.toLocaleString()}. It's been ${debt.overdueDays} days. Could you please settle when convenient? Thanks! 😊`;
        bestTime = 'Morning (9-11 AM)';
      } else if (debt.overdueDays > 5) {
        urgency = 'medium';
        suggestedMessage = `Hey ${debt.name}! Hope you're doing well. Just a gentle reminder about the ₹${debt.amount.toLocaleString()} payment. No rush, but whenever you get a chance! 😊`;
        bestTime = 'Evening (6-8 PM)';
      } else {
        urgency = 'low';
        suggestedMessage = `Hi ${debt.name}! Quick reminder about our split expense of ₹${debt.amount.toLocaleString()}. Thanks! 😊`;
        bestTime = 'Afternoon (2-4 PM)';
      }

      return {
        ...debt,
        urgency,
        suggestedMessage,
        bestTime
      };
    });
  };

  const smartSuggestions = getSmartSuggestions();

  const sendReminder = (debt, message) => {
    // Mock sending reminder
    console.log('Sending reminder to:', debt.name, 'Message:', message);
    
    // Add to manual reminders list
    setManualReminders(prev => [...prev, {
      id: Date.now(),
      recipient: debt,
      message,
      sentAt: new Date(),
      status: 'sent'
    }]);
  };

  const urgencyColors = {
    low: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100', 
    high: 'text-red-600 bg-red-100'
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
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                  <Bell size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Smart Reminders</h2>
                  <p className="text-sm text-gray-600">Manage payment reminders intelligently</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('auto')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'auto'
                  ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Zap size={16} />
                Auto Reminders
              </div>
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'manual'
                  ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageCircle size={16} />
                Send Now ({pendingDebts.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === 'scheduled'
                  ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Calendar size={16} />
                History
              </div>
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Auto Reminders Tab */}
            {activeTab === 'auto' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Zap size={20} className="text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Smart Auto-Reminders</h3>
                      <p className="text-sm text-blue-800">
                        AI-powered reminders that adapt to user behavior and send at optimal times
                      </p>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Enable Auto Reminders</h4>
                      <p className="text-sm text-gray-600">Automatically send gentle reminders for overdue payments</p>
                    </div>
                    <button
                      onClick={() => setReminderSettings(prev => ({ ...prev, autoReminders: !prev.autoReminders }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        reminderSettings.autoReminders ? 'bg-orange-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        reminderSettings.autoReminders ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Frequency</label>
                    <select
                      value={reminderSettings.reminderFrequency}
                      onChange={(e) => setReminderSettings(prev => ({ ...prev, reminderFrequency: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Gentle Mode</h4>
                      <p className="text-sm text-gray-600">Use polite, friendly language in reminders</p>
                    </div>
                    <button
                      onClick={() => setReminderSettings(prev => ({ ...prev, gentleMode: !prev.gentleMode }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        reminderSettings.gentleMode ? 'bg-orange-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        reminderSettings.gentleMode ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Smart Timing</h4>
                      <p className="text-sm text-gray-600">Send reminders when users are most likely to respond</p>
                    </div>
                    <button
                      onClick={() => setReminderSettings(prev => ({ ...prev, smartTiming: !prev.smartTiming }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        reminderSettings.smartTiming ? 'bg-orange-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        reminderSettings.smartTiming ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notification Channels</label>
                    <div className="space-y-2">
                      {[
                        { id: 'push', label: 'Push Notifications', icon: Smartphone },
                        { id: 'email', label: 'Email', icon: Mail },
                        { id: 'sms', label: 'SMS', icon: MessageCircle }
                      ].map(channel => (
                        <div key={channel.id} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={channel.id}
                            checked={reminderSettings.channels.includes(channel.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setReminderSettings(prev => ({
                                  ...prev,
                                  channels: [...prev.channels, channel.id]
                                }));
                              } else {
                                setReminderSettings(prev => ({
                                  ...prev,
                                  channels: prev.channels.filter(c => c !== channel.id)
                                }));
                              }
                            }}
                            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                          />
                          <channel.icon size={16} className="text-gray-500" />
                          <label htmlFor={channel.id} className="text-sm text-gray-700">{channel.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Reminders Tab */}
            {activeTab === 'manual' && (
              <div className="space-y-4">
                {pendingDebts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All settled up!</h3>
                    <p className="text-gray-500">No pending payments to remind about</p>
                  </div>
                ) : (
                  smartSuggestions.map(suggestion => (
                    <motion.div
                      key={suggestion.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                            {suggestion.avatar}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{suggestion.name}</h4>
                            <p className="text-sm text-gray-600">
                              Owes ₹{suggestion.amount.toLocaleString()} • {suggestion.overdueDays} days overdue
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyColors[suggestion.urgency]}`}>
                            {suggestion.urgency.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock size={14} className="text-gray-500" />
                          <span className="text-sm text-gray-600">Best time: {suggestion.bestTime}</span>
                        </div>
                        <p className="text-sm text-gray-800">{suggestion.suggestedMessage}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => sendReminder(suggestion, suggestion.suggestedMessage)}
                          className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                        >
                          <Send size={14} />
                          Send Reminder
                        </button>
                        <button
                          onClick={() => setSelectedDebtor(suggestion)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Customize
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'scheduled' && (
              <div className="space-y-4">
                {manualReminders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders sent yet</h3>
                    <p className="text-gray-500">Your reminder history will appear here</p>
                  </div>
                ) : (
                  manualReminders.map(reminder => (
                    <div key={reminder.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm">
                            {reminder.recipient.avatar}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{reminder.recipient.name}</h4>
                            <p className="text-sm text-gray-500">
                              {reminder.sentAt.toLocaleDateString()} at {reminder.sentAt.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {reminder.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{reminder.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                💡 Tip: Regular gentle reminders maintain healthy financial relationships
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SmartReminderModal;