import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // For redirecting if not admin

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

/**
 * AdminDashboard component provides an interface for administrators
 * to manage users and all uploaded Excel data.
 */
const AdminDashboard = () => {
  // Get user and token from Redux store
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate(); // Hook for programmatic navigation

  // State variables for managing data and UI loading/errors
  const [users, setUsers] = useState([]);
  const [allExcelData, setAllExcelData] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // Effect to redirect if the user is not an admin or not logged in
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login'); // Redirect to login page
      alert('Access Denied. You must be an administrator to view this page.');
    }
  }, [user, navigate]); // Dependencies: runs when user or navigate changes

  // Axios configuration with Authorization header for authenticated requests
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  /**
   * Fetches all registered users from the backend.
   */
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setError(''); // Clear previous errors
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/users`, config);
      setUsers(res.data);
      console.log('Admin Frontend: Fetched users:', res.data.length);
    } catch (err) {
      console.error('Admin Frontend: Error fetching users:', err.response?.data || err.message);
      setError('Failed to fetch users: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingUsers(false);
    }
  }, [token]);

  /**
   * Fetches all uploaded Excel data entries from the backend.
   */
  const fetchAllExcelData = useCallback(async () => {
    setLoadingData(true);
    setError(''); // Clear previous errors
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/all-data`, config);
      setAllExcelData(res.data);
      console.log('Admin Frontend: Fetched all Excel data:', res.data.length);
    } catch (err) {
      console.error('Admin Frontend: Error fetching all Excel data:', err.response?.data || err.message);
      setError('Failed to fetch all Excel data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingData(false);
    }
  }, [token]);

  // Effect to fetch data when component mounts or user/token changes (if user is admin)
  useEffect(() => {
    if (user && user.isAdmin && token) { // Ensure user is admin and token is available
      fetchUsers();
      fetchAllExcelData();
    }
  }, [user, token, fetchUsers, fetchAllExcelData]);

  /**
   * Handles the deletion of a user.
   * @param {string} userId - The ID of the user to delete.
   */
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user and all their associated data and analyses? This action is irreversible.')) {
      try {
        // Client-side check to prevent admin from deleting their own account
        if (user.id === userId) {
            alert('You cannot delete your own admin account from this panel.');
            return;
        }
        console.log('Admin Frontend: Deleting user:', userId);
        const res = await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, config);
        alert(res.data.message); // Show success message
        fetchUsers(); // Refresh user list after deletion
        fetchAllExcelData(); // Refresh all data list as user's data might be removed
      } catch (err) {
        console.error('Admin Frontend: Error deleting user:', err.response?.data || err.message);
        alert('Error deleting user: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  /**
   * Handles the deletion of an Excel data entry.
   * @param {string} dataId - The ID of the Excel data entry to delete.
   */
  const handleDeleteData = async (dataId) => {
    if (window.confirm('Are you sure you want to delete this Excel data entry and all its associated analyses? This action is irreversible.')) {
      try {
        console.log('Admin Frontend: Deleting Excel data:', dataId);
        const res = await axios.delete(`${API_BASE_URL}/admin/data/${dataId}`, config);
        alert(res.data.message); // Show success message
        fetchAllExcelData(); // Refresh all data list after deletion
      } catch (err) {
        console.error('Admin Frontend: Error deleting data:', err.response?.data || err.message);
        alert('Error deleting data: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Conditional rendering for access control and loading states
  if (!user || !user.isAdmin) {
    // If not admin, navigate to login (handled by useEffect), render nothing here immediately.
    return null;
  }

  if (loadingUsers || loadingData) {
    // ⭐ Dark mode text for loading indicator ⭐
    return <div className="text-center p-8 text-gray-700 dark:text-gray-300">Loading admin data...</div>;
  }

  if (error) {
    // ⭐ Dark mode text for error message ⭐
    return <div className="text-red-600 text-center p-8 dark:text-red-400">{error}</div>;
  }

  // Render the Admin Dashboard UI
  return (
    // ⭐ Dark mode background, padding, border, shadow for the main container ⭐
    <div className="min-h-screen bg-gray-100 p-8 dark:bg-gray-900"> {/* Removed from outer div, applied here */}
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:shadow-xl">
        {/* ⭐ Dark mode text for main heading ⭐ */}
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Admin Dashboard</h1>

        {/* Manage Users Section */}
        <div className="mb-10">
          {/* ⭐ Dark mode text for sub-heading ⭐ */}
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 dark:text-gray-200">Manage Users ({users.length})</h2>
          {users.length === 0 ? (
            // ⭐ Dark mode text for empty state ⭐
            <p className="text-gray-600 italic dark:text-gray-400">No users found.</p>
          ) : (
            // ⭐ Dark mode background, border, shadow for table container ⭐
            <div className="overflow-x-auto bg-gray-50 rounded-lg shadow-inner dark:bg-gray-700 dark:shadow-md">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                {/* ⭐ Dark mode table header background ⭐ */}
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    {/* ⭐ Dark mode table header text ⭐ */}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Username</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Admin Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                {/* ⭐ Dark mode table body background & row hover ⭐ */}
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-600">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {/* ⭐ Dark mode table cell text ⭐ */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{u.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {/* ⭐ Dark mode status badge colors ⭐ */}
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.isAdmin ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'}`}>
                          {u.isAdmin ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {/* ⭐ Dark mode delete button text ⭐ */}
                        {u._id !== user.id ? (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Delete
                          </button>
                        ) : (
                          // ⭐ Dark mode text for current admin message ⭐
                          <span className="text-gray-400 dark:text-gray-500"> (Current Admin) </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Manage All Uploaded Data Section */}
        <div>
          {/* ⭐ Dark mode text for sub-heading ⭐ */}
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 dark:text-gray-200">Manage All Uploaded Data ({allExcelData.length})</h2>
          {allExcelData.length === 0 ? (
            // ⭐ Dark mode text for empty state ⭐
            <p className="text-gray-600 italic dark:text-gray-400">No Excel data has been uploaded yet.</p>
          ) : (
            // ⭐ Dark mode background, border, shadow for table container ⭐
            <div className="overflow-x-auto bg-gray-50 rounded-lg shadow-inner dark:bg-gray-700 dark:shadow-md">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                {/* ⭐ Dark mode table header background ⭐ */}
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    {/* ⭐ Dark mode table header text ⭐ */}
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">File Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Uploaded By</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Upload Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                {/* ⭐ Dark mode table body background & row hover ⭐ */}
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-600">
                  {allExcelData.map((dataItem) => (
                    <tr key={dataItem._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {/* ⭐ Dark mode table cell text ⭐ */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{dataItem.fileName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {dataItem.userId ? dataItem.userId.username : 'Unknown User'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {/* Format date for better readability */}
                        {new Date(dataItem.uploadDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {/* ⭐ Dark mode delete button text ⭐ */}
                        <button
                          onClick={() => handleDeleteData(dataItem._id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;