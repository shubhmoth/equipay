import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Plus, Search, Check } from 'lucide-react';

const CreateGroupModal = ({ isOpen, onClose, onCreateGroup, availableUsers }) => {
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMemberToggle = (user) => {
    setSelectedMembers(prev => {
      const isSelected = prev.some(member => member.id === user.id);
      if (isSelected) {
        return prev.filter(member => member.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      alert('Please enter a group name and select at least one member');
      return;
    }

    const groupData = {
      name: groupName,
      members: [
        ...selectedMembers.map(member => ({
          id: member.id,
          name: member.name,
          avatar: member.avatar
        })),
        { id: 'user', name: 'You', avatar: '👤' }
      ]
    };

    onCreateGroup(groupData);
    
    // Reset form
    setGroupName('');
    setSelectedMembers([]);
    setSearchTerm('');
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
          className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users size={20} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Create Group</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Group Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name *
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., Trip to Goa, Roommates, Office Team"
              />
            </div>

            {/* Selected Members Preview */}
            {selectedMembers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Members ({selectedMembers.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((member) => (
                    <motion.div
                      key={member.id}
                      className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <span>{member.avatar}</span>
                      <span>{member.name}</span>
                      <button
                        onClick={() => handleMemberToggle(member)}
                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </motion.div>
                  ))}
                  <div className="flex items-center gap-2 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    <span>👤</span>
                    <span>You</span>
                  </div>
                </div>
              </div>
            )}

            {/* Search Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Members
              </label>
              <div className="relative mb-3">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Search friends..."
                />
              </div>

              {/* Members List */}
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Users size={24} className="mx-auto mb-2 text-gray-400" />
                    <p>No friends found</p>
                    <p className="text-sm">Try searching with different terms</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedMembers.some(member => member.id === user.id);
                    
                    return (
                      <motion.div
                        key={user.id}
                        className={`flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleMemberToggle(user)}
                        whileHover={{ x: 2 }}
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
                            ? 'border-blue-600 bg-blue-600' 
                            : 'border-gray-300'
                        }`}>
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Group Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Users size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Group Features:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Split expenses among all members</li>
                    <li>• Track group balances and settlements</li>
                    <li>• Chat with group members</li>
                    <li>• Add/remove members anytime</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedMembers.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Group
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateGroupModal;