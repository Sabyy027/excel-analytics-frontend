// frontend/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { login, reset } from '../features/auth/authSlice';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      alert(message); // Replace with a better notification system
    }
    if (isSuccess || user) {
      navigate('/');
    }
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = { email, password };
    dispatch(login(userData));
  };

  if (isLoading) {
    // ⭐ Dark mode loading text ⭐
    return <div className="text-center py-4 text-gray-700 dark:text-gray-300">Loading...</div>;
  }

  return (
    // ⭐ Dark mode background, padding, shadow, border-radius ⭐
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-10 dark:bg-gray-800 dark:shadow-lg dark:border dark:border-gray-700">
      {/* ⭐ Dark mode heading text ⭐ */}
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6 dark:text-white">Login</h1>
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          {/* ⭐ Dark mode label text ⭐ */}
          <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            // ⭐ Dark mode input field styles ⭐
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:shadow-outline-gray"
            required
          />
        </div>
        <div className="mb-6">
          {/* ⭐ Dark mode label text ⭐ */}
          <label className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onChange}
            // ⭐ Dark mode input field styles ⭐
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:shadow-outline-gray"
            required
          />
        </div>
        <div className="flex items-center justify-between mb-6">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Sign In
          </button>
        </div>
      </form>
      
      <div className="text-center">
        <p className="text-gray-600 mb-4 dark:text-gray-400">Don't have an account?</p>
        <Link 
          to="/register" 
          className="inline-block bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default Login;