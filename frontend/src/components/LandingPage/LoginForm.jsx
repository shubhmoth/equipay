import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Github, 
  Twitter, 
  Loader2,
  Globe,  // Instead of Google
  LifeBuoy  // Instead of Facebook
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ darkMode, onSwitchToSignup }) => {
  const navigate = useNavigate();
  
  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Form validation states
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  // Validate email format
  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // Validate form fields
  const validateField = (field, value) => {
    let errorMessage = '';
    
    switch (field) {
      case 'email':
        if (!value) errorMessage = 'Email is required';
        else if (!validateEmail(value)) errorMessage = 'Please enter a valid email';
        break;
      case 'password':
        if (!value) errorMessage = 'Password is required';
        else if (value.length < 6) errorMessage = 'Password must be at least 6 characters';
        break;
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: errorMessage }));
    return errorMessage === '';
  };

  // Handle input change with validation
  const handleInputChange = (field, value) => {
    // Clear any login error message when user starts editing
    if (loginError) setLoginError('');
    
    switch (field) {
      case 'email':
        setLoginEmail(value);
        break;
      case 'password':
        setLoginPassword(value);
        break;
      default:
        break;
    }
    
    validateField(field, value);
  };
  
  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const emailValid = validateField('email', loginEmail);
    const passwordValid = validateField('password', loginPassword);
    
    if (emailValid && passwordValid) {
      try {
        setIsLoading(true);
        setLoginError('');
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Demo credentials check - in real app this would be an API call
        if ((loginEmail === 'demo@example.com' && loginPassword === 'password123') || 
            (loginEmail === 'user@example.com' && loginPassword === 'user123')) {
          setLoginSuccess(true);
          
          // Store authentication status
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userEmail', loginEmail);
          
          // Redirect to dashboard after successful login
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
          
        } else {
          setLoginError('Invalid credentials. Try using demo@example.com / password123');
        }
      } catch (error) {
        setLoginError('An error occurred. Please try again.');
        console.error('Login error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Handle demo login
  const handleDemoLogin = () => {
    setLoginEmail('demo@example.com');
    setLoginPassword('password123');
    // Clear any validation errors
    setErrors({ email: '', password: '' });
  };
  
  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin(e);
    }
  };
  
  // Set up event listener for Enter key
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [loginEmail, loginPassword, isLoading]);

  // Social login options
  const socialLoginOptions = [
    { name: 'Google', icon: <Globe size={18} />, bgColor: darkMode ? 'bg-gray-700' : 'bg-white', hoverColor: darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50' },
    { name: 'Facebook', icon: <LifeBuoy size={18} />, bgColor: darkMode ? 'bg-gray-700' : 'bg-white', hoverColor: darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50' },
    { name: 'Twitter', icon: <Twitter size={18} />, bgColor: darkMode ? 'bg-gray-700' : 'bg-white', hoverColor: darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50' },
    { name: 'Github', icon: <Github size={18} />, bgColor: darkMode ? 'bg-gray-700' : 'bg-white', hoverColor: darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-50' }
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Success message */}
      {loginSuccess && (
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/30 text-green-300 border border-green-800' : 'bg-green-100 text-green-800 border border-green-200'} flex items-center mb-4 transition-all duration-300`}>
          <div className="mr-2 flex-shrink-0 text-green-500">✓</div>
          <p>Login successful! Redirecting to dashboard...</p>
        </div>
      )}
      
      {/* Error message */}
      {loginError && (
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900/30 text-red-300 border border-red-800' : 'bg-red-100 text-red-800 border border-red-200'} flex items-center mb-4 transition-all duration-300`}>
          <AlertCircle size={18} className="mr-2 flex-shrink-0 text-red-500" />
          <p>{loginError}</p>
        </div>
      )}
      
      {/* Email Field with improved focus states */}
      <div>
        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1.5 transition-colors duration-300`}>Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail size={18} className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-300`} />
          </div>
          <input
            type="email"
            className={`w-full py-3 pl-10 pr-3 ${
              darkMode 
                ? 'bg-gray-600 border-gray-500 text-white focus:ring-blue-500 focus:border-blue-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            } ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300`}
            placeholder="your@email.com"
            value={loginEmail}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => validateField('email', loginEmail)}
            disabled={isLoading || loginSuccess}
            autoFocus
          />
        </div>
        {errors.email && (
          <p className="mt-1.5 text-sm text-red-500 flex items-center">
            <AlertCircle size={14} className="mr-1 flex-shrink-0" /> {errors.email}
          </p>
        )}
      </div>
      
      {/* Password Field with improved toggle */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>Password</label>
          <a href="#" className={`text-xs font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors duration-300`}>
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock size={18} className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-300`} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            className={`w-full py-3 pl-10 pr-10 ${
              darkMode 
                ? 'bg-gray-600 border-gray-500 text-white focus:ring-blue-500 focus:border-blue-500' 
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            } ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300`}
            placeholder="••••••••"
            value={loginPassword}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onBlur={() => validateField('password', loginPassword)}
            disabled={isLoading || loginSuccess}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isLoading || loginSuccess ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={isLoading || loginSuccess}
          >
            {showPassword ? (
              <EyeOff size={18} className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-300`} />
            ) : (
              <Eye size={18} className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-300`} />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-sm text-red-500 flex items-center">
            <AlertCircle size={14} className="mr-1 flex-shrink-0" /> {errors.password}
          </p>
        )}
      </div>
      
      {/* Remember Me with better styling */}
      <div className="flex items-center">
        <div className="flex items-center h-5">
          <input 
            id="remember-me" 
            type="checkbox" 
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className={`h-4 w-4 ${darkMode ? 'bg-gray-700 border-gray-500' : 'bg-white border-gray-300'} rounded focus:ring-offset-0 focus:ring-2 focus:ring-blue-500 transition-colors duration-300`}
            disabled={isLoading || loginSuccess}
          />
        </div>
        <div className="ml-2">
          <label htmlFor="remember-me" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300 select-none`}>
            Remember me for 30 days
          </label>
        </div>
      </div>
      
      {/* Login Button with improved loading state */}
      <button
        onClick={handleLogin}
        disabled={isLoading || loginSuccess}
        className={`w-full ${
          darkMode 
            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
        } text-white py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 relative ${(isLoading || loginSuccess) ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'} mt-2`}
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Signing In...</span>
          </>
        ) : loginSuccess ? (
          <>
            <span>Logged In</span>
            <span className="text-green-300">✓</span>
          </>
        ) : (
          <>
            <span>Sign In</span>
            <ArrowRight size={18} />
          </>
        )}
      </button>
      
      {/* Demo Login Button with better styling */}
      <button
        onClick={handleDemoLogin}
        disabled={isLoading || loginSuccess}
        className={`w-full ${
          darkMode 
            ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600' 
            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
        } py-3 rounded-lg font-medium transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 ${(isLoading || loginSuccess) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span>Try Demo Account</span>
      </button>
      
      {/* Switch to Signup with better styling */}
      <div className="text-center mt-6">
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          New to Equipay?{' '}
          <button 
            onClick={onSwitchToSignup}
            className={`font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors duration-300`}
            disabled={isLoading}
          >
            Create an account
          </button>
        </p>
      </div>
      
      {/* Social Login Options with improved styling */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
              Or continue with
            </span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-4 gap-2">
          {socialLoginOptions.map((option, index) => (
            <a 
              key={index}
              href="#" 
              className={`flex justify-center items-center py-2 px-4 border ${
                darkMode 
                  ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
              } rounded-md shadow-sm transition-colors duration-300 ${isLoading || loginSuccess ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={`Sign in with ${option.name}`}
              onClick={(e) => {
                e.preventDefault();
                if (!isLoading && !loginSuccess) {
                  alert(`${option.name} login is not implemented in this demo`);
                }
              }}
            >
              {option.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;