import React, { useState } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthModal = ({ darkMode, activeTab, setActiveTab, onClose }) => {
  const [modalAnimation, setModalAnimation] = useState('animate-modal-enter');

  // Close modal with exit animation
  const handleClose = () => {
    setModalAnimation('animate-modal-leave');
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Switch between login and signup with animation
  const switchTab = (tab) => {
    setModalAnimation('animate-modal-switch');
    setTimeout(() => {
      setActiveTab(tab);
      setModalAnimation('');
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      ></div>
      
      {/* Modal */}
      <div className={`relative z-10 w-full max-w-md mx-4 ${modalAnimation}`}>
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-2xl overflow-hidden transition-colors duration-300 border`}>
          {/* Close button */}
          <button 
            onClick={handleClose}
            className={`absolute top-4 right-4 z-10 p-2 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors duration-300`}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
          
          {/* Header */}
          <div className="pt-8 pb-2 px-6 text-center">
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {activeTab === 'login' ? 'Welcome Back!' : 'Create Your Account'}
            </h3>
            <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {activeTab === 'login' 
                ? 'Sign in to continue managing your finances' 
                : 'Join thousands of users managing their finances beautifully'
              }
            </p>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b">
            <button 
              className={`w-1/2 py-4 text-center font-medium ${
                activeTab === 'login' 
                  ? `${darkMode ? 'text-blue-400 border-blue-500' : 'text-blue-600 border-blue-600'} border-b-2` 
                  : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`
              } transition-colors duration-300`}
              onClick={() => switchTab('login')}
            >
              Login
            </button>
            <button 
              className={`w-1/2 py-4 text-center font-medium ${
                activeTab === 'signup' 
                  ? `${darkMode ? 'text-blue-400 border-blue-500' : 'text-blue-600 border-blue-600'} border-b-2` 
                  : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`
              } transition-colors duration-300`}
              onClick={() => switchTab('signup')}
            >
              Sign Up
            </button>
          </div>
          
          {/* Form */}
          <div className="p-7">
            {activeTab === 'login' 
              ? <LoginForm 
                  darkMode={darkMode} 
                  onSwitchToSignup={() => switchTab('signup')}
                /> 
              : <SignupForm 
                  darkMode={darkMode} 
                  onSwitchToLogin={() => switchTab('login')}
                />
            }
          </div>
          
          {/* Footer */}
          <div className={`px-7 pb-6 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm transition-colors duration-300`}>
            By signing in or signing up, you agree to our <a href="#" className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>Terms of Service</a> and <a href="#" className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;