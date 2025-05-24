import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  Clock, 
  Users, 
  DollarSign, 
  MessageCircle,
  AlertCircle
} from 'lucide-react';

const PendingRequests = ({ requests, onAction }) => {
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = (requestId) => {
    if (rejectReason.trim()) {
      onAction(requestId, 'reject', rejectReason);
      setRejectingId(null);
      setRejectReason('');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (requests.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock size={24} className="text-gray-400" />
        </div>
        <p className="text-gray-500">No pending requests</p>
        <p className="text-sm text-gray-400 mt-1">All caught up!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {requests.map((request, index) => (
        <motion.div
          key={request.id}
          className="p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {request.type === 'expense' ? (
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                    {request.from.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{request.from.name}</p>
                    <p className="text-sm text-gray-500">wants to split an expense</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{formatDate(request.date)}</span>
              </div>

              {/* Expense Details */}
              <div className="bg-gray-50 rounded-lg p-3 ml-13">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{request.title}</h4>
                  <span className="text-lg font-bold text-gray-900">
                    ₹{request.amount.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600 font-medium">
                    Your share: ₹{request.userShare.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {request.splitType} split
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 ml-13">
                <motion.button
                  onClick={() => onAction(request.id, 'accept')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Check size={16} />
                  Accept
                </motion.button>
                <motion.button
                  onClick={() => setRejectingId(request.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X size={16} />
                  Reject
                </motion.button>
              </div>

              {/* Reject Modal */}
              <AnimatePresence>
                {rejectingId === request.id && (
                  <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="bg-white rounded-xl shadow-xl w-full max-w-md"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle size={20} className="text-red-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Reject Expense Request
                          </h3>
                        </div>
                        <p className="text-gray-600 mb-4">
                          Please provide a reason for rejecting this expense request from {request.from.name}.
                        </p>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="e.g., I wasn't part of this expense..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                          rows="3"
                        />
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason('');
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            disabled={!rejectReason.trim()}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Reject Request
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // Group Invite Request
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                    {request.from.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{request.from.name}</p>
                    <p className="text-sm text-gray-500">invited you to a group</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{formatDate(request.date)}</span>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 ml-13">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={16} className="text-blue-600" />
                  <h4 className="font-semibold text-gray-900">{request.groupName}</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Members: {request.members.join(', ')}
                </p>
              </div>

              <div className="flex gap-2 ml-13">
                <motion.button
                  onClick={() => onAction(request.id, 'accept')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Check size={16} />
                  Join Group
                </motion.button>
                <motion.button
                  onClick={() => onAction(request.id, 'reject')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-gray-600 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <X size={16} />
                  Decline
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default PendingRequests;