import React, { useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function FileUpload({ onUploadSuccess }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const { token } = useSelector((state) => state.auth);

    const onFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setMessage('');
    };

    const onFileUpload = async () => {
        if (!selectedFile) {
            setMessage('Please select an Excel file (.xls or .xlsx) first!');
            return;
        }

        const formData = new FormData();
        formData.append('excelFile', selectedFile);

        setUploading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            };
            const res = await axios.post(`${API_BASE_URL}/upload`, formData, config);
            setMessage(res.data.message);
            setSelectedFile(null);
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (error) {
            console.error('Error uploading file:', error.response?.data || error.message);
            setMessage('File upload failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-4 md:p-6 border border-gray-200 rounded-lg shadow-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:shadow-lg">
            <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-gray-800 dark:text-white">Upload Excel File</h2>
            <input
                type="file"
                onChange={onFileChange}
                accept=".xls,.xlsx"
                className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200 dark:hover:file:bg-blue-800 mb-3 md:mb-4"
            />
            <button
                onClick={onFileUpload}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-2 rounded-md shadow-sm transition duration-300 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800 text-sm md:text-base"
                disabled={uploading}
            >
                {uploading ? 'Uploading...' : 'Upload & Analyze'}
            </button>
            {message && (
                <p className={`mt-3 md:mt-4 text-sm ${message.includes('failed') ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {message}
                </p>
            )}
        </div>
    );
}

export default FileUpload; 