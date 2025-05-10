import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, LineChart, PieChart, Wallet, Users, CreditCard, Moon, Sun,
  ArrowRight, ChevronRight, X, Shield, Zap, Award, Bell, Calendar, Star,
  GitPullRequest, Smartphone, MessageCircle, Activity, Gift, Target,
  DollarSign, PiggyBank, TrendingUp, Lock, Layers, Eye, CheckCircle,
  Play, Twitter, Instagram, Linkedin, Github
} from 'lucide-react';
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import AuthModal from "./AuthModal";
import './Animation.css';

const LandingPage = () => {
  // Theme state
  const [darkMode, setDarkMode] = useState(false);
  
  // Auth states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');
  
  // Typewriter effect state
  const [displayText, setDisplayText] = useState('');
  const fullText = 'Smart Finance Management Made Beautiful';
  const [textIndex, setTextIndex] = useState(0);
  
  // Infinite scroll state
  const [visibleSections, setVisibleSections] = useState(3); // Start with first 3 sections
  const totalSections = 6; // Total number of sections
  const observerRef = useRef(null);
  const lastSectionRef = useRef(null);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Open auth modal with animation
  const openAuthModal = (tab = 'signup') => {
    setActiveTab(tab);
    setShowAuthModal(true);
  };
  
  // Close auth modal
  const closeAuthModal = () => {
    setShowAuthModal(false);
  };
  
  // Typewriter effect
  useEffect(() => {
    if (textIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(fullText.substring(0, textIndex + 1));
        setTextIndex(textIndex + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [textIndex, fullText]);

  // Infinite scroll observer
  useEffect(() => {
    if (visibleSections >= totalSections) return;

    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // Load more sections when the last visible section is in view
        setVisibleSections(prev => Math.min(prev + 1, totalSections));
      }
    }, options);

    if (lastSectionRef.current) {
      observer.observe(lastSectionRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [visibleSections, totalSections]);

  // Testimonials data
  const testimonials = [
    {
      name: "Sarah Johnson",
      title: "Small Business Owner",
      text: "Equipay has revolutionized how I manage my business finances. The expense tracking and beautiful reports have saved me hours each month!",
      avatar: "🧑‍💼",
      rating: 5
    },
    {
      name: "Mark Davis",
      title: "Freelance Designer",
      text: "As someone who shares expenses with roommates, the bill splitting feature is a game-changer. No more awkward conversations about who owes what.",
      avatar: "👨‍🎨",
      rating: 5
    },
    {
      name: "Priya Sharma",
      title: "Financial Planner",
      text: "I recommend Equipay to all my clients. The budgeting tools and visualizations make financial planning accessible to everyone.",
      avatar: "👩‍💼",
      rating: 4
    }
  ];

  // Pricing plans
  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for individuals managing basic finances",
      features: [
        "Expense tracking",
        "Basic analytics",
        "Up to 3 saving goals",
        "2 bill splitting groups"
      ],
      icon: <Wallet size={24} />,
      color: darkMode ? "bg-gray-700" : "bg-gray-100",
      buttonText: "Start Free",
      popular: false
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "per month",
      description: "Ideal for power users and families",
      features: [
        "Everything in Free",
        "Unlimited saving goals",
        "Advanced analytics & reports",
        "Unlimited bill splitting groups",
        "Recurring payments tracking",
        "Priority support"
      ],
      icon: <Award size={24} />,
      color: darkMode ? "bg-blue-900/30" : "bg-blue-50",
      buttonText: "Start 14-Day Trial",
      popular: true
    },
    {
      name: "Business",
      price: "$19.99",
      period: "per month",
      description: "For small businesses and teams",
      features: [
        "Everything in Premium",
        "Team collaboration",
        "Business expense categories",
        "Financial projections",
        "Data export & API access",
        "Dedicated account manager"
      ],
      icon: <DollarSign size={24} />,
      color: darkMode ? "bg-indigo-900/30" : "bg-indigo-50",
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: "How is Equipay different from other finance apps?",
      answer: "Equipay combines beautiful visualization with powerful features like expense tracking, bill splitting, and financial insights. Our unique approach makes managing finances not just easier, but actually enjoyable."
    },
    {
      question: "Is my financial data secure?",
      answer: "Absolutely. We use bank-level encryption and never store your banking credentials. Your security is our top priority, and we undergo regular security audits to ensure your data remains protected."
    },
    {
      question: "Can I sync Equipay with my bank account?",
      answer: "Yes! Equipay securely connects with over 10,000 financial institutions worldwide. You can automatically import transactions and maintain an up-to-date view of your finances."
    },
    {
      question: "How does the bill splitting feature work?",
      answer: "Simply add an expense, select who was involved, and how the bill should be split (equally, percentages, or specific amounts). Everyone in your group will be notified of their share, and you can track who has paid their portion."
    },
    {
      question: "Is there a free trial for premium features?",
      answer: "Yes, we offer a 14-day free trial of our Premium plan with full access to all features. No credit card required to start your trial."
    }
  ];

  // Features for the "How it works" section
  const workflowFeatures = [
    {
      icon: <Smartphone size={24} />,
      title: "Connect Your Accounts",
      description: "Securely link your bank accounts, credit cards, and payment apps for a complete financial picture."
    },
    {
      icon: <Activity size={24} />,
      title: "Track Your Spending",
      description: "Automatically categorize transactions and see where your money goes with beautiful visualizations."
    },
    {
      icon: <Users size={24} />,
      title: "Split Expenses Easily",
      description: "Share costs with friends, roommates, or partners and track who owes what without the math."
    },
    {
      icon: <Target size={24} />,
      title: "Set & Achieve Goals",
      description: "Create savings goals, track your progress, and get personalized recommendations."
    }
  ];

  return (
    <div className={`min-h-screen font-sans text-gray-800 transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50'}`}>
      {/* Navigation */}
      <nav className={`py-5 px-8 flex items-center justify-between ${darkMode ? 'bg-gray-800/90 backdrop-blur-md' : 'bg-white/70 backdrop-blur-md'} sticky top-0 z-40 transition-colors duration-300 shadow-sm`}>
        <div className="flex items-center gap-3">
          <div className={`${darkMode ? 'bg-blue-500' : 'bg-blue-600'} text-white p-2 rounded-lg transition-colors duration-300 shadow-md`}>
            <Wallet size={24} />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Equipay</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors font-medium`}>Features</a>
          <a href="#pricing" className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors font-medium`}>Pricing</a>
          <a href="#testimonials" className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors font-medium`}>Testimonials</a>
          <a href="#faq" className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-blue-600'} transition-colors font-medium`}>FAQ</a>
          <button 
            onClick={toggleDarkMode}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-blue-100 text-blue-800'} transition-all shadow-md hover:shadow-lg`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => openAuthModal('login')}
            className={`hidden sm:block ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} text-gray-800 px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg`}
          >
            Login
          </button>
          <button 
            onClick={() => openAuthModal('signup')}
            className={`${darkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-5 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg`}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-8 pt-24 pb-32 animate-fade-in">
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2 space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{displayText}</span>
              <span className="animate-pulse">|</span>
            </h1>
            <p className={`text-lg md:text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed animate-fade-in transition-colors duration-300`}>
              Track expenses, split bills with friends, and visualize your financial health with elegant dashboards and insightful analytics.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => openAuthModal('signup')}
                className={`${darkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-8 py-4 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg hover:shadow-xl animate-bounce-subtle`}
              >
                Start For Free <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => openAuthModal('login')}
                className={`${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'} border px-8 py-4 rounded-xl font-medium flex items-center gap-2 transition-all shadow-md`}
              >
                Login <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="md:w-1/2 relative animate-float">
            {/* Financial Overview Card - Custom visualization replacing missing/corrupt images */}
            <div className={`${darkMode ? 'bg-gray-800 shadow-blue-500/20' : 'bg-white'} p-7 rounded-2xl shadow-xl transition-colors duration-300 border ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-xl">Financial Overview</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm transition-colors duration-300`}>May 2025</p>
                </div>
                <div className={`${darkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'} p-3 rounded-lg transition-colors duration-300`}>
                  <BarChart size={20} />
                </div>
              </div>
              <div className="space-y-5">
                <div className={`h-48 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl flex items-center justify-center transition-colors duration-300 border ${darkMode ? 'border-gray-600' : 'border-gray-100'}`}>
                  {/* Custom chart visualization */}
                  <div className="w-full h-full p-4 flex flex-col justify-center">
                    <div className="flex justify-between mb-2">
                      <div className="text-xs text-gray-500">Apr</div>
                      <div className="text-xs text-gray-500">May</div>
                      <div className="text-xs text-gray-500">Jun</div>
                      <div className="text-xs text-gray-500">Jul</div>
                      <div className="text-xs text-gray-500">Aug</div>
                    </div>
                    <div className="relative h-32">
                      <div className="absolute bottom-0 left-0 w-full h-px bg-gray-300"></div>
                      <div className="absolute bottom-1/3 left-0 w-full h-px bg-gray-200 opacity-50"></div>
                      <div className="absolute bottom-2/3 left-0 w-full h-px bg-gray-200 opacity-50"></div>
                      
                      {/* Chart bars */}
                      <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
                        <div className="w-1/5 h-16 flex items-end justify-center">
                          <div className={`w-4 rounded-t-full ${darkMode ? 'bg-blue-500' : 'bg-blue-500'} h-full transition-all duration-200`}></div>
                        </div>
                        <div className="w-1/5 h-20 flex items-end justify-center">
                          <div className={`w-4 rounded-t-full ${darkMode ? 'bg-blue-500' : 'bg-blue-500'} h-full transition-all duration-200`}></div>
                        </div>
                        <div className="w-1/5 h-14 flex items-end justify-center">
                          <div className={`w-4 rounded-t-full ${darkMode ? 'bg-blue-500' : 'bg-blue-500'} h-full transition-all duration-200`}></div>
                        </div>
                        <div className="w-1/5 h-24 flex items-end justify-center">
                          <div className={`w-4 rounded-t-full ${darkMode ? 'bg-blue-500' : 'bg-blue-500'} h-full transition-all duration-200`}></div>
                        </div>
                        <div className="w-1/5 h-28 flex items-end justify-center">
                          <div className={`w-4 rounded-t-full ${darkMode ? 'bg-blue-500' : 'bg-blue-500'} h-full transition-all duration-200`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className={`${darkMode ? 'bg-green-900/20 text-green-300 border-green-900/30' : 'bg-green-50 border-green-100'} p-4 rounded-xl transition-colors duration-300 border`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Income</p>
                    <p className="font-bold text-xl">$3,240</p>
                  </div>
                  <div className={`${darkMode ? 'bg-red-900/20 text-red-300 border-red-900/30' : 'bg-red-50 border-red-100'} p-4 rounded-xl transition-colors duration-300 border`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Expenses</p>
                    <p className="font-bold text-xl">$1,845</p>
                  </div>
                  <div className={`${darkMode ? 'bg-blue-900/20 text-blue-300 border-blue-900/30' : 'bg-blue-50 border-blue-100'} p-4 rounded-xl transition-colors duration-300 border`}>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Savings</p>
                    <p className="font-bold text-xl">$1,395</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 bg-indigo-500/90 p-3 rounded-xl shadow-lg animate-float-delay-1 text-white">
              <Users size={24} />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-purple-500/90 p-3 rounded-xl shadow-lg animate-float-delay-2 text-white">
              <CreditCard size={24} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {visibleSections >= 1 && (
        <section 
          id="features" 
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-24 transition-colors duration-300`}
          ref={visibleSections === 1 ? lastSectionRef : null}
        >
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-20 animate-fade-in">
              <h2 className="text-4xl font-bold">Powerful Financial Tools</h2>
              <p className={`mt-4 text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto transition-colors duration-300`}>
                Everything you need to manage your finances, split expenses with friends, and make smarter money decisions.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' : 'bg-blue-50 hover:shadow-lg border-blue-100'} p-8 rounded-2xl transition-all animate-rise border`}>
                <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} inline-block p-4 rounded-xl mb-5 transition-colors duration-300`}>
                  <BarChart size={26} className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} transition-colors duration-300`} />
                </div>
                <h3 className="text-xl font-bold mb-3">Beautiful Analytics</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 transition-colors duration-300`}>
                  Visualize your spending patterns and financial health with elegant, interactive dashboards.
                </p>
                <div className={`rounded-xl overflow-hidden h-48 bg-gradient-to-br ${darkMode ? 'from-blue-900/40 to-indigo-900/40' : 'from-blue-100 to-indigo-100'}`}>
                  <div className="h-full flex items-center justify-center">
                    <BarChart size={64} className={`${darkMode ? 'text-blue-400/70' : 'text-blue-500/70'}`} />
                  </div>
                </div>
              </div>
              
              <div className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' : 'bg-indigo-50 hover:shadow-lg border-indigo-100'} p-8 rounded-2xl transition-all animate-rise-delay-1 border`}>
                <div className={`${darkMode ? 'bg-indigo-900/30' : 'bg-indigo-100'} inline-block p-4 rounded-xl mb-5 transition-colors duration-300`}>
                  <Users size={26} className={`${darkMode ? 'text-indigo-400' : 'text-indigo-600'} transition-colors duration-300`} />
                </div>
                <h3 className="text-xl font-bold mb-3">Smart Expense Splitting</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 transition-colors duration-300`}>
                  Effortlessly split bills with friends and track who owes what without awkward conversations.
                </p>
                <div className={`rounded-xl overflow-hidden h-48 bg-gradient-to-br ${darkMode ? 'from-indigo-900/40 to-purple-900/40' : 'from-indigo-100 to-purple-100'}`}>
                  <div className="h-full flex items-center justify-center">
                    <Users size={64} className={`${darkMode ? 'text-indigo-400/70' : 'text-indigo-500/70'}`} />
                  </div>
                </div>
              </div>
              
              <div className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' : 'bg-purple-50 hover:shadow-lg border-purple-100'} p-8 rounded-2xl transition-all animate-rise-delay-2 border`}>
                <div className={`${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'} inline-block p-4 rounded-xl mb-5 transition-colors duration-300`}>
                  <CreditCard size={26} className={`${darkMode ? 'text-purple-400' : 'text-purple-600'} transition-colors duration-300`} />
                </div>
                <h3 className="text-xl font-bold mb-3">Budget Automation</h3>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 transition-colors duration-300`}>
                  Set budgets that actually work with smart categorization and real-time tracking.
                </p>
                <div className={`rounded-xl overflow-hidden h-48 bg-gradient-to-br ${darkMode ? 'from-purple-900/40 to-pink-900/40' : 'from-purple-100 to-pink-100'}`}>
                  <div className="h-full flex items-center justify-center">
                    <CreditCard size={64} className={`${darkMode ? 'text-purple-400/70' : 'text-purple-500/70'}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      {visibleSections >= 2 && (
        <section 
          className={`py-24 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50'} transition-colors duration-300`}
          ref={visibleSections === 2 ? lastSectionRef : null}
        >
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-20 animate-fade-in">
              <h2 className="text-4xl font-bold">How It Works</h2>
              <p className={`mt-4 text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto transition-colors duration-300`}>
                Get started in minutes and transform how you manage your finances
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              {workflowFeatures.map((feature, index) => (
                <div 
                  key={index} 
                  className={`${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-blue-50'} p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-center animate-rise`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full text-white mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{feature.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-16 text-center">
              <button 
                onClick={() => openAuthModal('signup')}
                className={`${darkMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl animate-bounce-subtle inline-flex items-center gap-2`}
              >
                Get Started Now <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {visibleSections >= 3 && (
        <section 
          id="testimonials"
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-24 transition-colors duration-300`}
          ref={visibleSections === 3 ? lastSectionRef : null}
        >
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl font-bold">What Our Users Say</h2>
              <p className={`mt-4 text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto transition-colors duration-300`}>
                Join thousands of happy users who have transformed their financial lives
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className={`p-6 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors duration-300 animate-rise`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col h-full">
                    <div>
                      <div className="flex items-center mb-4">
                        <div className="text-4xl mr-4">{testimonial.avatar}</div>
                        <div>
                          <h4 className="font-bold">{testimonial.name}</h4>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{testimonial.title}</p>
                        </div>
                      </div>
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={16} 
                            className={i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} flex-grow mb-4`}>{testimonial.text}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-16 text-center animate-fade-in">
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Join over 25,000 users who have transformed their financial lives with Equipay
              </p>
              <button 
                onClick={() => openAuthModal('signup')}
                className={`${darkMode ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2`}
              >
                Try It Free <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      {visibleSections >= 4 && (
        <section 
          id="pricing"
          className={`py-24 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50'} transition-colors duration-300`}
          ref={visibleSections === 4 ? lastSectionRef : null}
        >
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl font-bold">Simple, Transparent Pricing</h2>
              <p className={`mt-4 text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto transition-colors duration-300`}>
                Choose the plan that works best for your financial needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <div 
                  key={index}
                  className={`relative rounded-2xl ${plan.color} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} transition-all duration-300 overflow-hidden animate-rise`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                        MOST POPULAR
                      </div>
                    </div>
                  )}
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-2 rounded-lg text-blue-500`}>
                        {plan.icon}
                      </div>
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                    </div>
                    
                    <div className="mb-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>{plan.period}</span>
                    </div>
                    
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>{plan.description}</p>
                    
                    <button
                      onClick={() => openAuthModal('signup')}
                      className={`w-full ${
                        plan.popular
                          ? `${darkMode ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} text-white`
                          : `${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`
                      } py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg`}
                    >
                      {plan.buttonText}
                    </button>
                    
                    <ul className="mt-8 space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                          <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            
            <div className={`mt-12 p-6 rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border transition-colors duration-300 text-center animate-fade-in`}>
              <h3 className="text-xl font-bold mb-2">Need a custom solution?</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                We offer tailored enterprise plans for larger organizations. Get in touch with our team to discuss your needs.
              </p>
              <button 
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2`}
              >
                Contact Sales <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {visibleSections >= 5 && (
        <section 
          id="faq"
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-24 transition-colors duration-300`}
          ref={visibleSections === 5 ? lastSectionRef : null}
        >
          <div className="max-w-4xl mx-auto px-8">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-4xl font-bold">Frequently Asked Questions</h2>
              <p className={`mt-4 text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto transition-colors duration-300`}>
                Got questions? We've got answers.
              </p>
            </div>
            
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className={`${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-xl p-6 transition-colors duration-300 animate-rise`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3 className="text-xl font-bold mb-3">{faq.question}</h3>
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{faq.answer}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center animate-fade-in">
              <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Still have questions?
              </p>
              <button 
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'} px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2`}
              >
                Contact Support <MessageCircle size={18} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {visibleSections >= 6 && (
        <section 
          className={`py-24 bg-gradient-to-r ${darkMode ? 'from-blue-900 to-indigo-900' : 'from-blue-500 to-indigo-600'} text-white`}
          ref={lastSectionRef}
        >
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h2 className="text-4xl font-bold mb-6 animate-fade-in">Ready to Transform Your Finances?</h2>
            <p className="text-xl mb-8 animate-fade-in">
              Join thousands of users who have already transformed their financial lives with Equipay.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-rise">
              <button 
                onClick={() => openAuthModal('signup')}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Get Started Free <ArrowRight size={18} />
              </button>
              <button 
                className="bg-blue-800/40 hover:bg-blue-800/60 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-md hover:shadow-lg border border-white/20 flex items-center justify-center gap-2"
              >
                See How It Works <Play size={18} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className={`${darkMode ? 'bg-gray-900' : 'bg-gray-900'} text-white py-16 transition-colors duration-300`}>
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-bold text-lg mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Developers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Partners</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Wallet size={22} />
              </div>
              <span className="text-xl font-bold">Equipay</span>
            </div>
            
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-500">© {new Date().getFullYear()} Equipay. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          darkMode={darkMode} 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={closeAuthModal}
        />
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes rise {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideRight {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slideLeft {
          0% { opacity: 0; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes bounceSoft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.95) translateY(-20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        @keyframes modalLeave {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.95) translateY(-20px); }
        }
        
        @keyframes modalSwitch {
          0% { opacity: 1; transform: translateX(0); }
          50% { opacity: 0; transform: translateX(20px); }
          51% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-in-out;
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-float-delay-1 {
          animation: float 4s ease-in-out 1s infinite;
        }
        
        .animate-float-delay-2 {
          animation: float 4s ease-in-out 2s infinite;
        }
        
        .animate-rise {
          animation: rise 0.8s ease-out;
        }
        
        .animate-rise-delay-1 {
          animation: rise 0.8s ease-out 0.2s both;
        }
        
        .animate-rise-delay-2 {
          animation: rise 0.8s ease-out 0.4s both;
        }
        
        .animate-slide-right {
          animation: slideRight 0.8s ease-out;
        }
        
        .animate-slide-left {
          animation: slideLeft 0.8s ease-out;
        }
        
        .animate-bounce-subtle {
          animation: bounceSoft 2s ease-in-out infinite;
        }
        
        .animate-modal-enter {
          animation: modalEnter 0.3s ease-out forwards;
        }
        
        .animate-modal-leave {
          animation: modalLeave 0.3s ease-in forwards;
        }
        
        .animate-modal-switch {
          animation: modalSwitch 0.3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;