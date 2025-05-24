/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Wallet,
  Users,
  Receipt,
  PiggyBank,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  Search,
  Bell,
  TrendingUp,
  CreditCard,
  BarChart3,
  X
} from 'lucide-react';

const NavigationSidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Update active item based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard') {
      setActiveItem('dashboard');
    } else if (path === '/expenses') {
      setActiveItem('expenses');
    } else if (path === '/split') {
      setActiveItem('split');
    } else if (path === '/reports') {
      setActiveItem('reports');
    } else if (path === '/settings') {
      setActiveItem('settings');
    } else if (path === '/help') {
      setActiveItem('help');
    }
  }, [location.pathname]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'expenses', label: 'Expenses', icon: Wallet, path: '/expenses' },
    { id: 'split', label: 'Split Bills', icon: Users, path: '/split' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' }
  ];

  const bottomItems = [
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, path: '/help' },
    { id: 'logout', label: 'Logout', icon: LogOut, path: '/logout' }
  ];

  const notifications = [
    { id: 1, title: 'New expense added', time: '2 minutes ago', type: 'expense' },
    { id: 2, title: 'Bill split request', time: '1 hour ago', type: 'split' },
    { id: 3, title: 'Savings goal reached!', time: '3 hours ago', type: 'savings' }
  ];

  const handleItemClick = (item) => {
    setActiveItem(item.id);
    
    if (item.id === 'logout') {
      // Handle logout
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      navigate('/');
    } else {
      // Navigate to the respective page
      navigate(item.path);
    }

    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-b border-gray-200 z-50 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex justify-between items-center h-full px-4 md:px-8">
          <div className="flex items-center gap-6">
            <motion.button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={toggleSidebar}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Menu size={24} className="text-gray-700" />
            </motion.button>
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <motion.div 
                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                whileHover={{ scale: 1.05 }}
              >
                E
              </motion.div>
              <motion.span 
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                Equipay
              </motion.span>
            </motion.div>
          </div>

          <div className="flex items-center gap-6">
            <motion.div 
              className="hidden md:flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full transition-all focus-within:ring-2 focus-within:ring-blue-500"
              whileHover={{ scale: 1.02 }}
            >
              <Search size={20} className="text-gray-400" />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="bg-transparent outline-none text-sm text-gray-700 w-80"
              />
            </motion.div>
            
            <div className="relative">
              <motion.button 
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={24} className="text-gray-600" />
                <motion.span 
                  className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  3
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                          whileHover={{ x: 4 }}
                        >
                          <p className="font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-500 mt-1">{notification.time}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div 
              className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" 
                alt="User" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Overlay */}
      {isOpen && window.innerWidth < 768 && (
        <motion.div
          className="fixed inset-0 top-16 bg-black bg-opacity-50 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className="fixed top-16 left-0 bottom-0 w-60 bg-white border-r border-gray-200 z-40"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col h-full py-6">
          <div className="flex-1 px-3 overflow-y-auto">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                className={`w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg transition-all relative ${
                  activeItem === item.id 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className="flex items-center justify-center"
                  animate={{ 
                    scale: activeItem === item.id ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <item.icon size={20} />
                </motion.div>
                <span className="text-sm font-medium">
                  {item.label}
                </span>
                {activeItem === item.id && (
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-600 to-purple-600 rounded-r"
                    layoutId="activeIndicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          <div className="px-3 pt-4 border-t border-gray-200">
            {bottomItems.map((item, index) => (
              <motion.button
                key={item.id}
                className={`w-full flex items-center gap-3 px-3 py-2.5 mb-1 rounded-lg transition-all ${
                  activeItem === item.id 
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } ${item.id === 'logout' ? 'hover:bg-red-50 hover:text-red-600' : ''}`}
                onClick={() => handleItemClick(item)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (navItems.length + index) * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div className="flex items-center justify-center">
                  <item.icon size={20} />
                </motion.div>
                <span className="text-sm font-medium">
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default NavigationSidebar;