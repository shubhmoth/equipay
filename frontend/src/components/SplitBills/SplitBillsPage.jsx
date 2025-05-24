/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  Filter,
  MoreVertical
} from 'lucide-react';

// Import child components
import UsersList from './Widgets/UsersList';
import ChatInterface from './Widgets/ChatInterface';
import CreateGroupModal from './Widgets/CreateGroupModal';
import AddUserModal from './Widgets/AddUserModal';
import MetricsCards from './Widgets/MetricsCards';
import PendingRequests from './Widgets/PendingRequests';
import QuickSplitModal from './Widgets/QuickSplitModal';
import SmartReminderModal from './Widgets/SmartReminderModal';

const SplitBillsPage = () => {
  // State management
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showQuickSplit, setShowQuickSplit] = useState(false);
  const [showSmartReminder, setShowSmartReminder] = useState(false);
  const [activeTab, setActiveTab] = useState('friends'); // friends, groups, pending
  const [chatVisible, setChatVisible] = useState(false);

  // Mock data initialization
  useEffect(() => {
    initializeMockData();
  }, []);

  const initializeMockData = () => {
    // Mock users (friends/connections)
    const mockUsers = [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        avatar: '👩‍💼',
        status: 'online',
        balance: 1250, // positive means they owe you
        lastActivity: '2024-12-28T10:30:00Z',
        expenses: [
          { id: 1, title: 'Dinner at Pizza Hut', amount: 1500, userShare: 750, status: 'settled', date: '2024-12-26' },
          { id: 2, title: 'Movie Tickets', amount: 800, userShare: 400, status: 'pending', date: '2024-12-28' }
        ]
      },
      {
        id: 2,
        name: 'Mark Davis',
        email: 'mark@example.com',
        avatar: '👨‍💻',
        status: 'offline',
        balance: -850, // negative means you owe them
        lastActivity: '2024-12-27T18:45:00Z',
        expenses: [
          { id: 3, title: 'Uber Ride', amount: 850, userShare: 425, status: 'pending', date: '2024-12-27' }
        ]
      },
      {
        id: 3,
        name: 'Emma Wilson',
        email: 'emma@example.com',
        avatar: '👩‍🎨',
        status: 'online',
        balance: 320,
        lastActivity: '2024-12-28T14:20:00Z',
        expenses: [
          { id: 4, title: 'Coffee Shop', amount: 640, userShare: 320, status: 'settled', date: '2024-12-25' }
        ]
      },
      {
        id: 4,
        name: 'Alex Chen',
        email: 'alex@example.com',
        avatar: '👨‍🔬',
        status: 'away',
        balance: 0,
        lastActivity: '2024-12-28T09:15:00Z',
        expenses: []
      }
    ];

    // Mock groups
    const mockGroups = [
      {
        id: 1,
        name: 'Roommates',
        members: [
          { id: 1, name: 'Sarah Johnson', avatar: '👩‍💼' },
          { id: 2, name: 'Mark Davis', avatar: '👨‍💻' },
          { id: 5, name: 'You', avatar: '👤' }
        ],
        totalBalance: 2500,
        userBalance: 850,
        lastActivity: '2024-12-28T16:30:00Z',
        expenses: [
          { id: 5, title: 'Electricity Bill', amount: 3000, userShare: 1000, status: 'settled', date: '2024-12-25' },
          { id: 6, title: 'Groceries', amount: 2400, userShare: 800, status: 'pending', date: '2024-12-28' }
        ]
      },
      {
        id: 2,
        name: 'Trip to Goa',
        members: [
          { id: 1, name: 'Sarah Johnson', avatar: '👩‍💼' },
          { id: 3, name: 'Emma Wilson', avatar: '👩‍🎨' },
          { id: 4, name: 'Alex Chen', avatar: '👨‍🔬' },
          { id: 5, name: 'You', avatar: '👤' }
        ],
        totalBalance: 15000,
        userBalance: -2500,
        lastActivity: '2024-12-27T12:00:00Z',
        expenses: [
          { id: 7, title: 'Hotel Booking', amount: 12000, userShare: 3000, status: 'settled', date: '2024-12-20' },
          { id: 8, title: 'Flight Tickets', amount: 8000, userShare: 2000, status: 'pending', date: '2024-12-22' }
        ]
      },
      {
        id: 3,
        name: 'Office Team',
        members: [
          { id: 6, name: 'Priya Sharma', avatar: '👩‍💼' },
          { id: 7, name: 'Raj Patel', avatar: '👨‍💼' },
          { id: 8, name: 'Lisa Wong', avatar: '👩‍💻' },
          { id: 5, name: 'You', avatar: '👤' }
        ],
        totalBalance: 5200,
        userBalance: 1300,
        lastActivity: '2024-12-26T17:45:00Z',
        expenses: [
          { id: 9, title: 'Team Lunch', amount: 3200, userShare: 800, status: 'settled', date: '2024-12-26' },
          { id: 10, title: 'Office Party', amount: 2000, userShare: 500, status: 'pending', date: '2024-12-28' }
        ]
      }
    ];

    // Mock pending requests
    const mockPendingRequests = [
      {
        id: 1,
        type: 'expense',
        from: { name: 'Sarah Johnson', avatar: '👩‍💼' },
        title: 'Dinner at Italian Restaurant',
        amount: 2400,
        userShare: 1200,
        description: 'Split dinner bill equally',
        date: '2024-12-28',
        groupId: null,
        splitType: 'equal'
      },
      {
        id: 2,
        type: 'group_invite',
        from: { name: 'Emma Wilson', avatar: '👩‍🎨' },
        groupName: 'Weekend Trip',
        members: ['Emma Wilson', 'Alex Chen', 'Mike Ross'],
        date: '2024-12-27'
      },
      {
        id: 3,
        type: 'expense',
        from: { name: 'Mark Davis', avatar: '👨‍💻' },
        title: 'Uber Pool',
        amount: 650,
        userShare: 325,
        description: 'Split Uber ride 50-50',
        date: '2024-12-28',
        groupId: 1,
        splitType: 'equal'
      }
    ];

    setUsers(mockUsers);
    setGroups(mockGroups);
    setPendingRequests(mockPendingRequests);
  };

  // Filter users and groups based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate overall metrics
  const calculateMetrics = () => {
    const totalOwedToYou = [...users, ...groups].reduce((sum, item) => 
      sum + (item.balance > 0 ? item.balance : 0), 0
    );
    
    const totalYouOwe = [...users, ...groups].reduce((sum, item) => 
      sum + (item.balance < 0 ? Math.abs(item.balance) : 0), 0
    );

    const netBalance = totalOwedToYou - totalYouOwe;
    
    return {
      totalOwedToYou,
      totalYouOwe,
      netBalance,
      pendingCount: pendingRequests.length
    };
  };

  const metrics = calculateMetrics();

  // Handle user/group selection
  const handleSelectUser = (user, type = 'user') => {
    setSelectedUser({ ...user, type });
    setChatVisible(true);
  };

  // Handle adding new expense
  const handleAddExpense = (expenseData) => {
    // This would typically make an API call
    console.log('Adding expense:', expenseData);
    
    // Mock: Add to pending requests for the other user
    const newRequest = {
      id: Date.now(),
      type: 'expense',
      from: { name: 'You', avatar: '👤' },
      ...expenseData,
      date: new Date().toISOString().split('T')[0]
    };
    
    setPendingRequests([newRequest, ...pendingRequests]);
  };

  // Handle request actions
  const handleRequestAction = (requestId, action, reason = '') => {
    const request = pendingRequests.find(req => req.id === requestId);
    
    if (action === 'accept') {
      // Add to expenses and update balances
      console.log('Accepting request:', request);
    } else if (action === 'reject') {
      console.log('Rejecting request:', request, 'Reason:', reason);
    }
    
    // Remove from pending requests
    setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
  };

  // Handle creating new group
  const handleCreateGroup = (groupData) => {
    const newGroup = {
      id: groups.length + 1,
      ...groupData,
      totalBalance: 0,
      userBalance: 0,
      lastActivity: new Date().toISOString(),
      expenses: []
    };
    
    setGroups([newGroup, ...groups]);
    setShowCreateGroup(false);
  };

  // Handle adding new user
  const handleAddUser = (userData) => {
    const newUser = {
      id: users.length + 1,
      ...userData,
      balance: 0,
      lastActivity: new Date().toISOString(),
      expenses: []
    };
    
    setUsers([newUser, ...users]);
    setShowAddUser(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-3xl font-bold text-gray-900">Split Bills</h1>
              <p className="text-gray-600 mt-1">Manage shared expenses with friends and groups</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                onClick={() => setShowSmartReminder(true)}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Clock size={18} />
                Smart Reminders
              </motion.button>
              <motion.button
                onClick={() => setShowAddUser(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={18} />
                Add Friend
              </motion.button>
              <motion.button
                onClick={() => setShowCreateGroup(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Users size={18} />
                Create Group
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Metrics Cards */}
        <MetricsCards metrics={metrics} />

        {/* Search Bar */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search friends, groups, or add new users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Panel - Users/Groups List */}
          <div className="xl:col-span-4">
            <motion.div 
              className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Quick Split Button */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
                <motion.button
                  onClick={() => setShowQuickSplit(true)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <DollarSign size={18} />
                  Quick Split Expense
                </motion.button>
                <p className="text-xs text-gray-600 text-center mt-2">
                  Split instantly without creating groups
                </p>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('friends')}
                  className={`flex-1 py-3 px-3 text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'friends'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Friends ({filteredUsers.length})
                </button>
                <button
                  onClick={() => setActiveTab('groups')}
                  className={`flex-1 py-3 px-3 text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'groups'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Groups ({filteredGroups.length})
                </button>
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`flex-1 py-3 px-3 text-xs sm:text-sm font-medium transition-colors relative ${
                    activeTab === 'pending'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Pending
                  {pendingRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {pendingRequests.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'friends' && (
                  <UsersList 
                    users={filteredUsers} 
                    onSelectUser={(user) => handleSelectUser(user, 'user')}
                    selectedUser={selectedUser}
                  />
                )}
                {activeTab === 'groups' && (
                  <UsersList 
                    users={filteredGroups} 
                    onSelectUser={(group) => handleSelectUser(group, 'group')}
                    selectedUser={selectedUser}
                    isGroups={true}
                  />
                )}
                {activeTab === 'pending' && (
                  <PendingRequests 
                    requests={pendingRequests}
                    onAction={handleRequestAction}
                  />
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="xl:col-span-8">
            <AnimatePresence mode="wait">
              {selectedUser ? (
                <ChatInterface
                  key={selectedUser.id}
                  selectedUser={selectedUser}
                  onAddExpense={handleAddExpense}
                  onClose={() => {
                    setSelectedUser(null);
                    setChatVisible(false);
                  }}
                />
              ) : (
                <motion.div
                  className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex items-center justify-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <div className="text-center px-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-500 mb-6">Choose a friend or group to start splitting expenses</p>
                    <motion.button
                      onClick={() => setShowQuickSplit(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Try Quick Split
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreateGroup={handleCreateGroup}
        availableUsers={users}
      />

      <AddUserModal
        isOpen={showAddUser}
        onClose={() => setShowAddUser(false)}
        onAddUser={handleAddUser}
      />

      <QuickSplitModal
        isOpen={showQuickSplit}
        onClose={() => setShowQuickSplit(false)}
        availableUsers={users}
        onAddExpense={handleAddExpense}
      />

      <SmartReminderModal
        isOpen={showSmartReminder}
        onClose={() => setShowSmartReminder(false)}
        users={users}
        groups={groups}
      />
    </div>
  );
};

export default SplitBillsPage;