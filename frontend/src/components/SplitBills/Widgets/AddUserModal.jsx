import React, { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Search, Mail, Phone, User, Check, AlertCircle } from 'lucide-react';

const AddUserModal = ({ isOpen, onClose, onAddUser }) => {
  const [searchMode, setSearchMode] = useState(true); // true for search, false for invite
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Mock search functionality
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockResults = [
        {
          id: 'search_1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          avatar: '👨‍💼',
          mutualFriends: 3,
          isConnected: false
        },
        {
          id: 'search_2',
          name: 'Lisa Anderson',
          email: 'lisa.anderson@example.com',
          avatar: '👩‍🔬',
          mutualFriends: 1,
          isConnected: false
        },
        {
          id: 'search_3',
          name: 'Mike Johnson',
          email: 'mike.j@example.com',
          avatar: '👨‍🎨',
          mutualFriends: 0,
          isConnected: true
        }
      ].filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 1000);
  };

  const handleAddFriend = (user) => {
    onAddUser({
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      status: 'offline'
    });
    
    // Reset form
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleInviteUser = () => {
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      alert('Please fill in name and email');
      return;
    }

    onAddUser({
      name: inviteForm.name,
      email: inviteForm.email,
      avatar: '👤', // Default avatar for invited users
      status: 'invited'
    });

    // Reset form
    setInviteForm({ name: '', email: '', phone: '' });
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
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserPlus size={20} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Add Friend</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Toggle Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSearchMode(true)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                searchMode
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Search Users
            </button>
            <button
              onClick={() => setSearchMode(false)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                !searchMode
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Invite by Email
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {searchMode ? (
              /* Search Mode */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search by name or email
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        placeholder="Search users..."
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      disabled={!searchTerm.trim() || isSearching}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Search Results ({searchResults.length})
                    </h3>
                    <div className="space-y-2">
                      {searchResults.map((user) => (
                        <motion.div
                          key={user.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                              {user.avatar}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                              {user.mutualFriends > 0 && (
                                <p className="text-xs text-blue-600">
                                  {user.mutualFriends} mutual friends
                                </p>
                              )}
                            </div>
                          </div>
                          {user.isConnected ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <Check size={16} />
                              <span className="text-sm">Connected</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddFriend(user)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Add Friend
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {searchTerm && searchResults.length === 0 && !isSearching && (
                  <div className="text-center py-6">
                    <AlertCircle size={48} className="mx-auto text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
                    <p className="text-gray-500 mb-4">
                      No users found with "{searchTerm}". Try searching with different terms or invite them by email.
                    </p>
                    <button
                      onClick={() => setSearchMode(false)}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      Invite by email instead
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Invite Mode */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={inviteForm.name}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      placeholder="Enter full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={inviteForm.phone}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Mail size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">Invitation Process:</p>
                      <ul className="text-xs space-y-1">
                        <li>• An invitation email will be sent to the user</li>
                        <li>• They can join Equipay using the invitation link</li>
                        <li>• Once they join, they'll be added to your friends list</li>
                        <li>• You can start splitting expenses immediately</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              {!searchMode && (
                <button
                  onClick={handleInviteUser}
                  disabled={!inviteForm.name.trim() || !inviteForm.email.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send Invitation
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddUserModal;