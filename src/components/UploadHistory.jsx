import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

function UploadHistory({ onSelectFile }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { token } = useSelector((state) => state.auth);

    const fetchHistory = async () => {
        setLoading(true);
        setError('');
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const res = await axios.get('http://localhost:5000/api/data/history', config);
            setHistory(res.data);
        } catch (err) {
            console.error('Error fetching upload history:', err.response?.data || err.message);
            setError('Failed to fetch upload history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [token]);

    const handleFileClick = async (dataId) => {
        setLoading(true);
        setError('');
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
            };
            const res = await axios.get(`http://localhost:5000/api/data/${dataId}`, config);
            if (onSelectFile) {
                onSelectFile(res.data);
            }
        } catch (err) {
            console.error('Error fetching selected file data:', err.response?.data || err.message);
            setError('Failed to load selected file data.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6 text-center text-gray-600 dark:text-gray-300">Loading history...</div>;
    if (error) return <div className="p-6 text-red-600 text-center dark:text-red-400">{error}</div>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Upload History</h3>
            {history.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No upload history found. Upload a file to get started!</p>
            ) : (
                <ul className="space-y-3">
                    {history.map((item) => (
                        <li
                            key={item._id}
                            className="bg-gray-50 p-3 rounded-md border border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                            onClick={() => handleFileClick(item._id)}
                        >
                            <div>
                                <p className="font-medium text-blue-700 dark:text-blue-400">{item.fileName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-300">Uploaded: {new Date(item.uploadDate).toLocaleDateString()}</p>
                            </div>
                            <button className="text-blue-500 hover:text-blue-700 text-sm dark:text-blue-400 dark:hover:text-blue-300">View Data</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default UploadHistory; 