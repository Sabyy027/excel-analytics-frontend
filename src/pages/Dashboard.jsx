import React, { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import FileUpload from '../components/FileUpload';
import UploadHistory from '../components/UploadHistory';
import ChartGenerator from '../components/ChartGenerator';
import RecentAnalysesStandalone from '../components/RecentAnalysesStandalone';
import { DocumentArrowUpIcon, ClockIcon } from '@heroicons/react/24/outline';

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
      
      const excelDataRes = await axios.get(`http://localhost:5000/api/data/${excelDataId}`, config);
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
      <h1 className="text-4xl font-extrabold text-blue-900 mb-8 tracking-tight drop-shadow-sm dark:text-blue-100">
        Welcome, {user ? user.username : 'Guest'}!
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-white/70 dark:bg-gray-800/80 dark:border-gray-700/70 dark:shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <DocumentArrowUpIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Upload Excel File</h2>
          </div>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-white/70 dark:bg-gray-800/80 dark:border-gray-700/70 dark:shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Upload History</h2>
          </div>
          <UploadHistory onSelectFile={handleSelectFile} key={refreshHistory} />
        </div>
      </div>
      <div className="mb-10">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/70 dark:bg-gray-800/80 dark:border-gray-700/70 dark:shadow-2xl">
          <RecentAnalysesStandalone 
            onSelectAnalysis={handleSelectAnalysis} 
            refreshTrigger={refreshAnalyses} 
          />
        </div>
      </div>
      {selectedExcelData && (
        <div className="mt-8 bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/70 dark:bg-gray-800/80 dark:border-gray-700/70 dark:shadow-2xl">
          <h2 className="text-2xl font-bold mb-4 text-blue-800 tracking-tight dark:text-blue-200">Analyze: {selectedExcelData.fileName}</h2>
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