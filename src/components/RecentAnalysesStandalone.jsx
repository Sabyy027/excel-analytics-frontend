// frontend/src/components/RecentAnalysesStandalone.jsx

import React, { useState, useEffect, useCallback } from 'react'; // ⭐ Added useCallback ⭐
import axios from 'axios';
import { useSelector } from 'react-redux';

// Renamed function to match filename for consistency
function RecentAnalysesStandalone({ onSelectAnalysis, refreshTrigger }) {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useSelector((state) => state.auth);

  // ⭐ Wrapped fetchAnalyses in useCallback to make it a stable function ⭐
  const fetchAnalyses = useCallback(async () => {
    setLoading(true);
    setError(''); // Clear previous errors
    try {
      if (!token) {
        setError('Login to view analysis history.');
        setLoading(false);
        return;
      }
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      console.log('Frontend: Attempting to fetch analysis history...');
      const res = await axios.get('http://localhost:5000/api/data/analysis-history', config);
      console.log('Frontend: Received analysis history response:', res.data);
      // Optional debugging logs, good to keep during development:
      if (res.data[0]) {
        console.log('Frontend: First analysis item structure:', res.data[0]);
        console.log('Frontend: excelDataId structure:', res.data[0].excelDataId);
        console.log('Frontend: excelDataId type:', typeof res.data[0].excelDataId);
      }
      setAnalyses(res.data);
    } catch (err) {
      console.error('Frontend ERROR fetching analysis history:', err.response?.data || err.message);
      setError('Failed to fetch recent analyses: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [token]); // Dependencies for useCallback: fetchAnalyses depends on 'token'

  useEffect(() => {
    if (user && token) { // Only fetch if user is logged in and token is available
      fetchAnalyses(); // This is now a stable function
    } else {
      setAnalyses([]); // Clear analyses if logged out
      setLoading(false);
      setError('Login to view analysis history.');
    }
  }, [user, token, refreshTrigger, fetchAnalyses]); // ⭐ Added fetchAnalyses to useEffect dependencies ⭐

  // ⭐ Dark mode loading text ⭐
  if (loading) return <div className="p-4 text-center text-gray-600 dark:text-gray-300">Loading recent analyses...</div>;
  // ⭐ Dark mode error text ⭐
  if (error) return <div className="p-4 text-red-600 text-center dark:text-red-400">{error}</div>;

  return (
    // ⭐ Dark mode card background, border, shadow ⭐
    <div className="p-6 border border-gray-200 rounded-lg shadow-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:shadow-lg">
      {/* ⭐ Dark mode heading text ⭐ */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Recent Analyses</h2>
      {analyses.length === 0 ? (
        // ⭐ Dark mode empty state text ⭐
        <p className="text-gray-600 dark:text-gray-400">No saved analyses found. Generate a chart and save it!</p>
      ) : (
        <ul className="space-y-3">
          {/* Using slice(-5) to show only the 5 most recent analyses, as in your previous code. */}
          {analyses.slice(-5).map((item) => (
            <li
              key={item._id}
              // ⭐ Dark mode list item background, border, hover states ⭐
              className="bg-gray-50 p-3 rounded-md border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer hover:bg-gray-100 transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
              onClick={() => onSelectAnalysis(item)}
            >
              <div>
                {/* ⭐ Dark mode file name text ⭐ */}
                <p className="font-medium text-blue-700 dark:text-blue-400">File: {item.excelDataId?.fileName || item.fileName || 'N/A'}</p>
                {/* ⭐ Dark mode chart details text ⭐ */}
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Chart: {item.chartType}, X: {item.xAxis}, Y: {item.yAxis}
                  {item.zAxis && `, Z: ${item.zAxis}`} {/* Show Z-axis if present */}
                </p>
                {/* ⭐ Dark mode analyzed date text ⭐ */}
                <p className="text-xs text-gray-400 dark:text-gray-500">Analyzed: {new Date(item.analysisDate).toLocaleDateString()}</p>
              </div>
              {/* ⭐ Dark mode button text ⭐ */}
              <button className="text-blue-500 hover:text-blue-700 text-sm mt-2 sm:mt-0 dark:text-blue-400 dark:hover:text-blue-300">Load Analysis</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecentAnalysesStandalone; // ⭐ Ensure export matches function name ⭐