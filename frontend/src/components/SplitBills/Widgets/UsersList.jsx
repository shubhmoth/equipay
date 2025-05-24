import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Users, Circle } from 'lucide-react';

const UsersList = ({ users, onSelectUser, selectedUser, isGroups = false }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'away': return 'text-yellow-500';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const formatLastActivity = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (users.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {isGroups ? <Users size={24} className="text-gray-400" /> : <Circle size={24} className="text-gray-400" />}
        </div>
        <p className="text-gray-500">
          {isGroups ? 'No groups found' : 'No friends found'}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {isGroups ? 'Create your first group' : 'Add friends to start splitting expenses'}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {users.map((user, index) => (
        <motion.div
          key={user.id}
          className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
            selectedUser?.id === user.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelectUser(user)}
          whileHover={{ x: 4 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                  {isGroups ? (
                    <Users size={20} className="text-gray-600" />
                  ) : (
                    user.avatar
                  )}
                </div>
                {!isGroups && user.status && (
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    user.status === 'online' ? 'bg-green-500' : 
                    user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {isGroups ? (
                    <>
                      <span className="text-sm text-gray-500">
                        {user.members.length} members
                      </span>
                      <span className="text-sm text-gray-400">•</span>
                    </>
                  ) : (
                    <>
                      <Circle size={8} className={getStatusColor(user.status)} />
                    </>
                  )}
                  <span className="text-sm text-gray-500">
                    {formatLastActivity(user.lastActivity)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              {user.balance !== 0 && (
                <p className={`text-sm font-semibold ${
                  user.balance > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {user.balance > 0 ? '+' : '-'}₹{Math.abs(user.balance).toLocaleString()}
                </p>
              )}
              {user.balance === 0 && (
                <p className="text-sm text-gray-400">Settled up</p>
              )}
            </div>
          </div>
          
          {/* Group members preview */}
          {isGroups && user.members && (
            <div className="mt-3 flex items-center gap-1">
              <div className="flex -space-x-2">
                {user.members.slice(0, 4).map((member, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-xs"
                    title={member.name}
                  >
                    {member.avatar}
                  </div>
                ))}
                {user.members.length > 4 && (
                  <div className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs text-gray-600">
                    +{user.members.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default UsersList;