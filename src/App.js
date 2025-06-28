import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from './features/auth/authSlice';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // ⭐ Dark Mode State and Logic ⭐
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize theme from localStorage if saved, otherwise default to system preference
    const savedMode = localStorage.getItem('theme');
    if (savedMode) {
      return savedMode === 'dark'; // Return true if 'dark' is saved
    }
    // Fallback: Check user's system preference (e.g., Windows dark mode setting)
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Apply or remove the 'dark' class on the root HTML element
    // This is what Tailwind CSS's `darkMode: 'class'` watches for.
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark'); // Save preference to localStorage
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light'); // Save preference to localStorage
    }
  }, [isDarkMode]); // This effect runs whenever `isDarkMode` state changes

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode); // Toggles the state
  };
  // ⭐ End Dark Mode State and Logic ⭐

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  return (
    // ⭐ Apply general dark mode background styles to the main app container ⭐
    // The `dark:` variants here will be active when `isDarkMode` is true.
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-200 via-white to-blue-400 dark:from-gray-800 dark:via-gray-900 dark:to-black font-sans">
      {/* Navigation Bar */}
      <nav className="w-full bg-white/40 backdrop-blur-xl border-b border-white/40 shadow-md dark:bg-gray-900/60 dark:border-gray-700 dark:shadow-lg">
        <div className="flex items-center justify-between py-3 px-4 md:px-12">
          {/* Logo/Brand - Responsive text size */}
          <Link to="/" className="text-lg md:text-2xl font-semibold tracking-tight text-gray-900 font-sans select-none hover:text-blue-700 transition dark:text-white dark:hover:text-blue-400">
            <span className="hidden sm:inline">Excel Analytics Platform</span>
            <span className="sm:hidden">Excel Analytics</span>
          </Link>
          
          {/* Mobile menu container */}
          <div className="flex items-center gap-2 md:gap-6">
            {user ? (
              <>
                {/* Welcome message - hidden on very small screens */}
                <span className="hidden sm:block text-sm md:text-base font-normal text-gray-500 tracking-wide select-none dark:text-gray-400">
                  Welcome, {user.username}!
                </span>
                
                {/* Admin button - responsive sizing */}
                {user.isAdmin && (
                  <Link 
                    to="/admin" 
                    className="group relative inline-flex items-center gap-1 md:gap-2 px-3 md:px-5 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:via-indigo-700 hover:to-purple-800 dark:from-purple-500 dark:via-indigo-500 dark:to-purple-600 dark:hover:from-purple-600 dark:hover:via-indigo-600 dark:hover:to-purple-700 text-white rounded-full font-medium text-xs md:text-sm shadow-lg hover:shadow-xl transition-all duration-300 select-none overflow-hidden border border-purple-400/30 dark:border-purple-300/30"
                  >
                    {/* ⭐ Animated background overlay ⭐ */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-purple-300/10 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* ⭐ Admin crown icon with animation ⭐ */}
                    <svg 
                      className="w-3 h-3 md:w-4 md:h-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                      />
                    </svg>
                    
                    {/* ⭐ Text with glow effect - hidden on very small screens ⭐ */}
                    <span className="hidden md:inline relative z-10 group-hover:text-purple-100 transition-colors duration-300 font-semibold tracking-wide">
                      Admin Panel
                    </span>
                    <span className="md:hidden relative z-10 group-hover:text-purple-100 transition-colors duration-300 font-semibold">
                      Admin
                    </span>
                    
                    {/* ⭐ Ripple effect on click ⭐ */}
                    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-active:opacity-100 group-active:scale-95 transition-all duration-150"></div>
                  </Link>
                )}
                
                {/* ⭐ Advanced Animated Logout Button - responsive sizing ⭐ */}
                <button 
                  onClick={onLogout} 
                  className="group relative inline-flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 dark:from-slate-500 dark:to-slate-600 dark:hover:from-slate-600 dark:hover:to-slate-700 text-white rounded-xl font-medium text-xs md:text-base shadow-lg hover:shadow-xl transition-all duration-300 select-none overflow-hidden"
                >
                  {/* ⭐ Animated background overlay ⭐ */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* ⭐ Logout icon with animation ⭐ */}
                  <svg 
                    className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  
                  {/* ⭐ Text with glow effect - hidden on very small screens ⭐ */}
                  <span className="hidden sm:inline relative z-10 group-hover:text-blue-100 transition-colors duration-300">
                    Logout
                  </span>
                  
                  {/* ⭐ Ripple effect on click ⭐ */}
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-active:opacity-100 group-active:scale-95 transition-all duration-150"></div>
                </button>
              </>
            ) : (
              <>
                {/* Login and Register buttons removed - users will be redirected to login page */}
              </>
            )}
            
            {/* ⭐ Sleek Glossy Dark Mode Toggle Button ⭐ */}
            <button
              onClick={toggleDarkMode}
              className="group relative p-2 md:p-3 bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-600/50 overflow-hidden"
              aria-label="Toggle Dark Mode"
            >
              {/* ⭐ Glossy overlay effect ⭐ */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/10 dark:via-transparent dark:to-transparent rounded-full"></div>
              
              {/* ⭐ Animated background glow ⭐ */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
              
              {/* ⭐ Icon container with animation ⭐ */}
              <div className="relative z-10 transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                {isDarkMode ? (
                  // ⭐ Sun icon for switching to light mode ⭐
                  <svg 
                    className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 drop-shadow-lg filter group-hover:drop-shadow-xl transition-all duration-300" 
                    fill="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
                  </svg>
                ) : (
                  // ⭐ Moon icon for switching to dark mode ⭐
                  <svg 
                    className="w-4 h-4 md:w-5 md:h-5 text-blue-500 drop-shadow-lg filter group-hover:drop-shadow-xl transition-all duration-300" 
                    fill="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9 9 0 008.354-5.646z"/>
                  </svg>
                )}
              </div>
              
              {/* ⭐ Ripple effect on click ⭐ */}
              <div className="absolute inset-0 bg-white/30 dark:bg-white/10 opacity-0 group-active:opacity-100 transition-opacity duration-150 rounded-full"></div>
            </button>
          </div>
        </div>
      </nav>

      {/* Main content area - improved mobile padding */}
      <main className="flex-1 px-4 md:px-12 py-4 md:py-6">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={user ? <Dashboard /> : <Login />} />
          <Route path="/admin" element={user && user.isAdmin ? <AdminDashboard /> : <Login />} />
        </Routes>
      </main>

      {/* ⭐ Copyright Footer - responsive text ⭐ */}
      <footer className="py-3 md:py-4 px-4 md:px-12 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm">
        <div className="text-center">
          <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            © 2025 Excel Analytics Platform. Website created by{" "}
            <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sabeer Anwer Meeran
            </span>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;