import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import NavigationSidebar from './components/Navigation/NavigationSidebar';

// Lazy load components
const LandingPage = React.lazy(() => import('./components/LandingPage/LandingPage'));
const Dashboard = React.lazy(() => import('./components/Dashboards/Dashboard'));
const ExpensesPage = React.lazy(() => import('./components/Expenses/ExpensePage'));
const SplitBillsPage = React.lazy(() => import('./components/SplitBills/SplitBillsPage'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return children;
};

// Loading Component
const LoadingScreen = () => (
  <motion.div 
    className="fixed inset-0 flex flex-col justify-center items-center bg-gradient-to-br from-blue-600 to-purple-600 z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="text-center"
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ 
        repeat: Infinity, 
        repeatType: "reverse", 
        duration: 1
      }}
    >
      <div className="mb-6">
        <motion.div 
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          💰
        </motion.div>
      </div>
      <motion.p 
        className="text-white text-xl font-medium"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Loading Equipay...
      </motion.p>
    </motion.div>
  </motion.div>
);

// Dashboard Layout Component
const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="relative h-screen overflow-hidden bg-gray-50">
      <NavigationSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <motion.main 
        className="pt-16 h-full overflow-y-auto transition-all duration-300"
        style={{
          marginLeft: isSidebarOpen ? '240px' : '0px',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Suspense fallback={<LoadingScreen />}>
          {children}
        </Suspense>
      </motion.main>
    </div>
  );
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <Router>
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/expenses" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <ExpensesPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/split" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <SplitBillsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            {/* Add more routes as needed */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </Router>
  );
}

export default App;