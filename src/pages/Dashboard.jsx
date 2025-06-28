import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import FileUpload from '../components/FileUpload';
import UploadHistory from '../components/UploadHistory';
import ChartGenerator from '../components/ChartGenerator';
import RecentAnalysesStandalone from '../components/RecentAnalysesStandalone';
import { DocumentArrowUpIcon, ClockIcon } from '@heroicons/react/24/outline';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function Dashboard() {
  const { user, token } = useSelector((state) => state.auth);
  const [selectedExcelData, setSelectedExcelData] = useState(null);
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [refreshAnalyses, setRefreshAnalyses] = useState(0);

  // Callback to handle successful upload, triggers history refresh
  const handleUploadSuccess = useCallback(() => {
    setRefreshHistory(prev => prev + 1);
    setSelectedExcelData(null);
  }, []);

  // Callback to handle selecting a file from history
  const handleSelectFile = useCallback((data) => {
    setSelectedExcelData(data);
  }, []);

  // Callback for when an analysis is selected from recent analyses
  const handleSelectAnalysis = useCallback(async (analysisItem) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      let excelDataId;
      if (typeof analysisItem.excelDataId === 'object' && analysisItem.excelDataId !== null) {
        excelDataId = analysisItem.excelDataId._id;
      } else if (typeof analysisItem.excelDataId === 'string') {
        excelDataId = analysisItem.excelDataId;
      } else {
        throw new Error('Invalid excelDataId structure');
      }
      
      if (!excelDataId) {
        throw new Error('No valid excelDataId found');
      }
      
      const excelDataRes = await axios.get(`${API_BASE_URL}/data/${excelDataId}`, config);
      setSelectedExcelData(excelDataRes.data);
    } catch (error) {
      console.error('Error loading analysis data:', error);
      alert('Failed to load analysis data. It might have been deleted or there was a network error.');
      setSelectedExcelData(null);
    }
  }, [token]);

  // Callback to trigger refresh of RecentAnalyses after successful save
  const onSaveAnalysisSuccess = useCallback(() => {
    setRefreshAnalyses(prev => prev + 1);
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Responsive heading */}
      <h1 className="text-2xl md:text-4xl font-extrabold text-blue-900 mb-4 md:mb-8 tracking-tight drop-shadow-sm dark:text-blue-100 px-2">
        Welcome, {user ? user.username : 'Guest'}!
      </h1>
      
      {/* Upload and History Section - Mobile optimized grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-10">
        {/* File Upload Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 flex flex-col gap-3 md:gap-4 border border-white/70 dark:bg-gray-800/80 dark:border-gray-700/70 dark:shadow-2xl">
          <div className="flex items-center gap-2 mb-1 md:mb-2">
            <DocumentArrowUpIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-500 dark:text-blue-400" />
            <h2 className="text-base md:text-lg font-bold text-gray-800 dark:text-white">Upload Excel File</h2>
          </div>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>
        
        {/* Upload History Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 flex flex-col gap-3 md:gap-4 border border-white/70 dark:bg-gray-800/80 dark:border-gray-700/70 dark:shadow-2xl">
          <div className="flex items-center gap-2 mb-1 md:mb-2">
            <ClockIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-500 dark:text-blue-400" />
            <h2 className="text-base md:text-lg font-bold text-gray-800 dark:text-white">Upload History</h2>
          </div>
          <UploadHistory onSelectFile={handleSelectFile} key={refreshHistory} />
        </div>
      </div>
      
      {/* Recent Analyses Section */}
      <div className="mb-6 md:mb-10">
        <div className="bg-white/80 backdrop-blur-md rounded-xl md:rounded-2xl shadow-xl p-4 md:p-6 border border-white/70 dark:bg-gray-800/80 dark:border-gray-700/70 dark:shadow-2xl">
          <RecentAnalysesStandalone 
            onSelectAnalysis={handleSelectAnalysis} 
            refreshTrigger={refreshAnalyses} 
          />
        </div>
      </div>
      
      {/* Chart Generator Section - Mobile optimized */}
      {selectedExcelData && (
        <div className="mt-6 md:mt-8 bg-white/80 backdrop-blur-md p-4 md:p-8 rounded-xl md:rounded-2xl shadow-2xl border border-white/70 dark:bg-gray-800/80 dark:border-gray-700/70 dark:shadow-2xl">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-blue-800 tracking-tight dark:text-blue-200">
            Analyze: {selectedExcelData.fileName}
          </h2>
          <ChartGenerator 
            excelData={selectedExcelData} 
            onSaveAnalysisSuccess={onSaveAnalysisSuccess}
          />
        </div>
      )}
    </div>
  );
}

export default Dashboard; 