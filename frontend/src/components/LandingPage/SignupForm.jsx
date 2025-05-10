import React, { useState } from 'react';
import { User, Mail, Phone, Lock, AlertCircle, Search, ChevronDown, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignupForm = ({ darkMode, onSwitchToLogin }) => {
  const navigate = useNavigate();
  
  // Signup form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCodeSearch, setCountryCodeSearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({ code: '+91', name: 'India', flag: '🇮🇳' });
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupError, setSignupError] = useState('');
  
  // Form validation states
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    terms: ''
  });
  
  // Country codes data
  const countryCodes = [
    { code: '+1', name: 'United States', flag: '🇺🇸' },
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: '+81', name: 'Japan', flag: '🇯🇵' },
    { code: '+86', name: 'China', flag: '🇨🇳' },
    { code: '+49', name: 'Germany', flag: '🇩🇪' },
    { code: '+33', name: 'France', flag: '🇫🇷' },
    { code: '+7', name: 'Russia', flag: '🇷🇺' },
    { code: '+82', name: 'South Korea', flag: '🇰🇷' },
  ];

  // Filter country codes based on search
  const filteredCountryCodes = countryCodes.filter(country => 
    country.name.toLowerCase().includes(countryCodeSearch.toLowerCase()) || 
    country.code.includes(countryCodeSearch)
  ).slice(0, 4);
  
  // Validate email
  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };
  
  // Form validation functions
  const validateField = (field, value) => {
    let errorMessage = '';
    
    switch (field) {
      case 'name':
        if (!value) errorMessage = 'Name is required';
        else if (value.length < 2) errorMessage = 'Name must be at least 2 characters';
        break;
      case 'email':
        if (!value) errorMessage = 'Email is required';
        else if (!validateEmail(value)) errorMessage = 'Please enter a valid email';
        break;
      case 'password':
        if (!value) errorMessage = 'Password is required';
        else if (value.length < 8) errorMessage = 'Password must be at least 8 characters';
        break;
      case 'confirmPassword':
        if (value !== password) errorMessage = 'Passwords do not match';
        break;
      case 'phone':
        if (!value) errorMessage = 'Phone number is required';
        else if (!/^\d+$/.test(value)) errorMessage = 'Phone number must contain only digits';
        break;
      case 'terms':
        if (!agreeToTerms) errorMessage = 'You must agree to the terms and conditions';
        break;
      default:
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: errorMessage }));
    return errorMessage === '';
  };
  
  // Input change handlers
  const handleInputChange = (field, value) => {
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      case 'phone':
        if (/^\d*$/.test(value)) {
          setPhone(value);
        }
        break;
      case 'countryCodeSearch':
        setCountryCodeSearch(value);
        break;
      default:
        break;
    }
    
    if (field !== 'countryCodeSearch') {
      validateField(field, value);
    }
  };
  
  // Handle country selection
  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
  };
  
  // Handle signup submission
  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const nameValid = validateField('name', name);
    const emailValid = validateField('email', email);
    const passwordValid = validateField('password', password);
    const confirmPasswordValid = validateField('confirmPassword', confirmPassword);
    const phoneValid = validateField('phone', phone);
    const termsValid = validateField('terms', agreeToTerms);
    
    if (nameValid && emailValid && passwordValid && confirmPasswordValid && phoneValid && termsValid) {
      try {
        setIsLoading(true);
        setSignupError('');
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock successful signup
        setSignupSuccess(true);
        
        // Store authentication status
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', name);
        
        // Redirect to dashboard after successful signup
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
        
      } catch (error) {
        setSignupError('An error occurred during signup. Please try again.');
        console.error('Signup error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Success message */}
      {signupSuccess && (
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/30 text-green-300 border border-green-800' : 'bg-green-100 text-green-800 border border-green-200'} flex items-center mb-4 transition-all duration-300`}>
          <div className="mr-2 flex-shrink-0 text-green-500">✓</div>
          <p>Account created successfully! Redirecting to dashboard...</p>
        </div>
      )}
      
      {/* Error message */}
      {signupError && (
        <div className={`p-3 rounded-lg ${darkMode ? 'bg-red-900/30 text-red-300 border border-red-800' : 'bg-red-100 text-red-800 border border-red-200'} flex items-center mb-4 transition-all duration-300`}>
          <AlertCircle size={18} className="mr-2 flex-shrink-0 text-red-500" />
          <p>{signupError}</p>
        </div>
      )}

      {/* Layout into two columns for better spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name - First column */}
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-300`} />
            </div>
            <input
              type="text"
              className={`w-full py-3 pl-10 pr-3 ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white focus:ring-blue-500 focus:border-blue-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } ${errors.name ? 'border-red-500' : ''} rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300`}
              placeholder="John Smith"
              value={name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onBlur={() => validateField('name', name)}
              disabled={isLoading || signupSuccess}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <AlertCircle size={14} className="mr-1" /> {errors.name}
            </p>
          )}
        </div>
        
        {/* Email - Second column */}
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>Email</label>
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
              } ${errors.email ? 'border-red-500' : ''} rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300`}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => validateField('email', email)}
              disabled={isLoading || signupSuccess}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <AlertCircle size={14} className="mr-1" /> {errors.email}
            </p>
          )}
        </div>
      </div>
      
      {/* Phone with Country Code - Full width */}
      <div>
        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>Phone Number</label>
        <div className="flex">
          <div className="relative w-1/3 mr-2">
            <div 
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className={`flex items-center justify-between h-full py-3 px-3 ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-700'
              } border rounded-lg cursor-pointer transition-colors duration-300`}
            >
              <div className="flex items-center">
                <span className="mr-2 text-xl">{selectedCountry.flag}</span>
                <span>{selectedCountry.code}</span>
              </div>
              <ChevronDown size={18} />
            </div>
            
            {/* Country dropdown */}
            {showCountryDropdown && (
              <div className={`absolute z-10 w-full mt-1 ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600' 
                  : 'bg-white border-gray-200'
              } border rounded-lg shadow-lg transition-colors duration-300`}>
                <div className="p-2 sticky top-0 border-b">
                  <div className="relative">
                    <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={countryCodeSearch}
                      onChange={(e) => handleInputChange('countryCodeSearch', e.target.value)}
                      className={`w-full pl-8 py-2 ${
                        darkMode 
                          ? 'bg-gray-600 text-white placeholder-gray-400' 
                          : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                      } rounded-md text-sm transition-colors duration-300`}
                    />
                  </div>
                </div>
                <div>
                  {filteredCountryCodes.map((country) => (
                    <div
                      key={`${country.code}-${country.name}`}
                      onClick={() => handleCountrySelect(country)}
                      className={`flex items-center p-2 cursor-pointer ${
                        darkMode 
                          ? 'hover:bg-gray-600' 
                          : 'hover:bg-gray-100'
                      } transition-colors duration-200`}
                    >
                      <span className="mr-2 text-xl">{country.flag}</span>
                      <span>{country.name}</span>
                      <span className="ml-1 text-gray-500">{country.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone size={18} className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-300`} />
            </div>
            <input
              type="tel"
              className={`w-full py-3 pl-10 pr-3 ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white focus:ring-blue-500 focus:border-blue-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } ${errors.phone ? 'border-red-500' : ''} rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300`}
              placeholder="9876543210"
              value={phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              onBlur={() => validateField('phone', phone)}
              disabled={isLoading || signupSuccess}
            />
          </div>
        </div>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-500 flex items-center">
            <AlertCircle size={14} className="mr-1" /> {errors.phone}
          </p>
        )}
      </div>
      
      {/* Password fields in two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Password */}
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-300`} />
            </div>
            <input
              type="password"
              className={`w-full py-3 pl-10 pr-3 ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white focus:ring-blue-500 focus:border-blue-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } ${errors.password ? 'border-red-500' : ''} rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onBlur={() => validateField('password', password)}
              disabled={isLoading || signupSuccess}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <AlertCircle size={14} className="mr-1" /> {errors.password}
            </p>
          )}
        </div>
        
        {/* Confirm Password */}
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors duration-300`}>Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={18} className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-300`} />
            </div>
            <input
              type="password"
              className={`w-full py-3 pl-10 pr-3 ${
                darkMode 
                  ? 'bg-gray-600 border-gray-500 text-white focus:ring-blue-500 focus:border-blue-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } ${errors.confirmPassword ? 'border-red-500' : ''} rounded-lg focus:outline-none focus:ring-2 transition-colors duration-300`}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              onBlur={() => validateField('confirmPassword', confirmPassword)}
              disabled={isLoading || signupSuccess}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <AlertCircle size={14} className="mr-1" /> {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>
      
      {/* Terms and Conditions */}
      <div className="flex items-center">
        <input 
          id="terms" 
          type="checkbox"
          checked={agreeToTerms}
          onChange={(e) => {
            setAgreeToTerms(e.target.checked);
            validateField('terms', e.target.checked);
          }}
          className={`h-4 w-4 ${darkMode ? 'bg-gray-700 border-gray-500' : ''} text-blue-600 focus:ring-blue-500 rounded transition-colors duration-300`}
          disabled={isLoading || signupSuccess}
        />
        <label htmlFor="terms" className={`ml-2 block text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
          I agree to the <a href="#" className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} transition-colors duration-300`}>Terms</a> and <a href="#" className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} transition-colors duration-300`}>Privacy Policy</a>
        </label>
      </div>
      {errors.terms && (
        <p className="mt-1 text-sm text-red-500 flex items-center">
          <AlertCircle size={14} className="mr-1" /> {errors.terms}
        </p>
      )}
      
      {/* Sign Up Button */}
      <button
        onClick={handleSignup}
        disabled={isLoading || signupSuccess}
        className={`w-full ${darkMode ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'} text-white py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${(isLoading || signupSuccess) ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Creating Account...</span>
          </>
        ) : signupSuccess ? (
          <>
            <span>Account Created</span>
            <span className="text-green-300">✓</span>
          </>
        ) : (
          <>
            Create Account <ArrowRight size={18} />
          </>
        )}
      </button>
      
      {/* Switch to Login */}
      <div className="text-center mt-4">
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Already have an account?{' '}
          <button 
            onClick={onSwitchToLogin}
            className={`font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors duration-300`}
            disabled={isLoading || signupSuccess}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;