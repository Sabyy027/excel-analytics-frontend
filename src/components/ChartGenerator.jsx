import React, { useState, useEffect, useRef } from 'react';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';
import { saveAs } from 'file-saver'; // For downloading charts
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';
import { useSelector } from 'react-redux';
import ThreeDChart from './ThreeDChart'; // Import 3D Chart component

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Register Chart.js components and elements (CRUCIAL for Chart.js to work)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

function ChartGenerator({ excelData, initialChartConfig, onSaveAnalysisSuccess }) {
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [zAxis, setZAxis] = useState(''); // New state for 3D charts
  const [chartType, setChartType] = useState('bar'); // Default chart type
  const [chartData, setChartData] = useState(null);
  const [error, setError] = useState('');
  const [savingAnalysis, setSavingAnalysis] = useState(false);
  const chartRef = useRef(null); // Reference to the chart canvas for download

  const data = excelData?.data || [];
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  const { token } = useSelector((state) => state.auth);

  // Check if chart type is 3D
  const is3DChart = chartType.startsWith('3d');

  useEffect(() => {
    if (initialChartConfig) {
      setChartType(initialChartConfig.chartType);
      setXAxis(initialChartConfig.xAxis);
      setYAxis(initialChartConfig.yAxis);
      setZAxis(initialChartConfig.zAxis || '');
    } else {
      // Only set default values if they're not already set
      if (headers.length > 0 && !xAxis) setXAxis(headers[0]);
      if (headers.length > 1 && !yAxis) setYAxis(headers[1]);
      if (headers.length > 2 && !zAxis) setZAxis(headers[2]);
    }
    setError('');
  }, [initialChartConfig, headers]);

  useEffect(() => {
    if (xAxis && yAxis && data.length > 0) {
      try {
        const labels = data.map(row => row[xAxis]);
        const values = data.map(row => parseFloat(row[yAxis]));

        if (values.some(isNaN)) {
          setError(`Y-axis column '${yAxis}' contains non-numeric data. Please select a numeric column.`);
          setChartData(null);
          return;
        }

        setError('');

        // For 3D charts, we don't need to process data here as it's handled by ThreeDChart
        if (!is3DChart) {
          // For scatter plots, we need a different data structure
          if (chartType === 'scatter') {
            const scatterData = {
              datasets: [{
                label: `${yAxis} vs ${xAxis}`,
                data: data.map(row => ({ 
                  x: parseFloat(row[xAxis]) || 0, 
                  y: parseFloat(row[yAxis]) || 0 
                })),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                pointRadius: 5,
                pointHoverRadius: 8,
              }]
            };
            setChartData(scatterData);
          } else {
            // For other chart types, use the standard structure
            const newChartData = {
              labels,
              datasets: [{
                label: `${yAxis} by ${xAxis}`,
                data: values,
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
                    'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(201, 203, 207, 0.6)',
                    'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)',
                    'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(201, 203, 207, 0.8)',
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(201, 203, 207, 1)',
                    'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)',
                    'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(201, 203, 207, 1)',
                ],
                borderWidth: 1,
              }],
            };
            setChartData(newChartData);
          }
        } else {
          // For 3D charts, set null to prevent Chart.js from trying to render
          setChartData(null);
        }
      } catch (err) {
        setError('Error preparing chart data. Please check your selections.');
        console.error(err);
        setChartData(null);
      }
    } else {
      setChartData(null);
    }
  }, [xAxis, yAxis, zAxis, chartType, data, is3DChart]);

  const renderChart = () => {
    if (error) {
      return <div className="text-red-600 text-center py-4">{error}</div>;
    }
    
    // Handle 3D charts first
    if (is3DChart) {
      if (!xAxis || !yAxis || !zAxis || !data.length) { // Added zAxis check for 3D
        return <div className="text-gray-600 text-center py-4 dark:text-gray-300">Select X, Y, and Z axes to generate a 3D chart.</div>; // ⭐ Dark mode text ⭐
      }
      return (
        <ThreeDChart
          chartType={chartType}
          data={data}
          xAxisKey={xAxis} // Pass as xAxisKey for consistency
          yAxisKey={yAxis} // Pass as yAxisKey
          zAxisKey={zAxis} // Pass as zAxisKey
          width={800} // Example width, ThreeDChart might use 100% of container
          height={600} // Example height
        />
      );
    }

    // Handle 2D charts
    if (!chartData) {
      return <div className="text-gray-600 text-center py-4 dark:text-gray-300">Select X and Y axes to generate a chart.</div>; // ⭐ Dark mode text ⭐
    }

    // Common options for 2D charts
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { // ⭐ Dark mode legend text ⭐
              color: 'black', // Default for light mode
          }
        },
        title: {
          display: true,
          text: `${yAxis} vs ${xAxis}`,
          color: 'black', // ⭐ Dark mode title text ⭐
        },
      },
      scales: {
          x: {
              type: 'category',
              title: {
                  display: true,
                  text: xAxis,
                  color: 'black', // ⭐ Dark mode x-axis title text ⭐
              },
              ticks: {
                  color: 'black', // ⭐ Dark mode x-axis tick labels ⭐
              },
              grid: {
                  color: 'rgba(0,0,0,0.1)', // ⭐ Dark mode grid lines ⭐
              }
          },
          y: {
              type: 'linear',
              beginAtZero: true,
              title: {
                  display: true,
                  text: yAxis,
                  color: 'black', // ⭐ Dark mode y-axis title text ⭐
              },
              ticks: {
                  color: 'black', // ⭐ Dark mode y-axis tick labels ⭐
              },
              grid: {
                  color: 'rgba(0,0,0,0.1)', // ⭐ Dark mode grid lines ⭐
              }
          }
      }
    };

    // Dark mode adjustments for Chart.js options
    // This is done conditionally if the 'dark' class is present on the html element
    const isDarkModeActive = document.documentElement.classList.contains('dark');
    if (isDarkModeActive) {
        commonOptions.plugins.legend.labels.color = 'white';
        commonOptions.plugins.title.color = 'white';
        commonOptions.scales.x.title.color = 'white';
        commonOptions.scales.x.ticks.color = 'white';
        commonOptions.scales.x.grid.color = 'rgba(255,255,255,0.1)';
        commonOptions.scales.y.title.color = 'white';
        commonOptions.scales.y.ticks.color = 'white';
        commonOptions.scales.y.grid.color = 'rgba(255,255,255,0.1)';
    }


    switch (chartType) {
      case 'bar': return <Bar ref={chartRef} data={chartData} options={commonOptions} />; // Use commonOptions
      case 'line': return <Line ref={chartRef} data={chartData} options={commonOptions} />; // Use commonOptions
      case 'pie':
        const pieChartData = {
            labels: chartData.labels,
            datasets: [{
                label: chartData.datasets[0].label,
                data: chartData.datasets[0].data,
                backgroundColor: chartData.datasets[0].backgroundColor,
                borderColor: chartData.datasets[0].borderColor,
                borderWidth: 1,
            }]
        };
        const pieOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { // ⭐ Dark mode legend text ⭐
                        color: isDarkModeActive ? 'white' : 'black',
                    }
                },
                title: {
                    display: true,
                    text: `${yAxis} vs ${xAxis}`,
                    color: isDarkModeActive ? 'white' : 'black', // ⭐ Dark mode title text ⭐
                },
            },
        };
        return <Pie ref={chartRef} data={pieChartData} options={pieOptions} />;
      case 'scatter':
        const scatterOptions = {
          ...commonOptions, // Inherit common options including scales setup
          scales: { // Overwrite scales as scatter needs linear
            x: {
              type: 'linear',
              position: 'bottom',
              title: { display: true, text: xAxis, color: isDarkModeActive ? 'white' : 'black' }, // ⭐ Dark mode text ⭐
              ticks: { color: isDarkModeActive ? 'white' : 'black' }, // ⭐ Dark mode text ⭐
              grid: { color: isDarkModeActive ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } // ⭐ Dark mode grid ⭐
            },
            y: {
              type: 'linear',
              position: 'left',
              title: { display: true, text: yAxis, color: isDarkModeActive ? 'white' : 'black' }, // ⭐ Dark mode text ⭐
              ticks: { color: isDarkModeActive ? 'white' : 'black' }, // ⭐ Dark mode text ⭐
              grid: { color: isDarkModeActive ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' } // ⭐ Dark mode grid ⭐
            }
          },
          plugins: {
            ...commonOptions.plugins,
            tooltip: { // Custom tooltip callback for scatter plots
              callbacks: {
                label: function(context) {
                  return `(${context.parsed.x}, ${context.parsed.y})`;
                }
              }
            }
          }
        };
        return <Scatter ref={chartRef} data={chartData} options={scatterOptions} />; // Use scatterData for scatter
      default: return null;
    }
  };

  const handleDownloadChart = (format) => {
    if (is3DChart) {
      alert('3D chart download functionality is coming soon! For now, you can use browser screenshot tools.');
      return;
    }

    const chartInstance = chartRef.current;
    if (!chartInstance) {
      alert('Chart not rendered yet!');
      return;
    }

    if (format === 'png') {
      try {
        const dataUrl = chartInstance.toBase64Image();
        saveAs(dataUrl, `${excelData.fileName}_${chartType}.png`);
      } catch (e) {
        console.error('Error saving PNG:', e);
        alert('Error saving PNG. Please try again.');
      }
    } else if (format === 'pdf') {
      // Get the chart container element
      const chartContainer = chartRef.current.canvas.parentElement;
      
      html2canvas(chartContainer, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        
        // Calculate dimensions to fit the chart properly
        const imgWidth = 280; // Max width for A4 landscape
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add title to PDF
        pdf.setFontSize(16);
        pdf.text(`${excelData.fileName} - ${chartType.toUpperCase()} Chart`, 14, 20);
        pdf.setFontSize(12);
        pdf.text(`X-Axis: ${xAxis} | Y-Axis: ${yAxis}`, 14, 30);
        
        // Add the chart image
        pdf.addImage(imgData, 'PNG', 14, 40, imgWidth, imgHeight);
        
        // Save the PDF
        pdf.save(`${excelData.fileName}_${chartType}.pdf`);
      }).catch(error => {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
      });
    }
  };

  const handleSaveAnalysis = async () => {
      setSavingAnalysis(true);
      try {
          if (!token || !excelData || !xAxis || !yAxis || !chartType) {
              alert('Please ensure data is loaded, X-Axis, Y-Yxis, and Chart Type are selected before saving analysis.');
              setSavingAnalysis(false);
              return;
          }

          const config = { headers: { Authorization: `Bearer ${token}` } };
          const payload = {
              excelDataId: excelData._id,
              fileName: excelData.fileName,
              chartType,
              xAxis,
              yAxis,
              zAxis: is3DChart ? zAxis : undefined, // Include Z-axis for 3D charts
          };

          const res = await axios.post(`${API_BASE_URL}/data/save-analysis`, payload, config);
          alert(res.data.message);

          if (onSaveAnalysisSuccess) {
              onSaveAnalysisSuccess();
          }
      } catch (error) {
          console.error('ChartGenerator: Error saving analysis from frontend:', error.response?.data || error.message);
          alert('Failed to save analysis: ' + (error.response?.data?.message || error.message || 'Unknown error'));
      } finally {
          setSavingAnalysis(false);
      }
  };

  return (
    // ⭐ Dark Mode Background, Border, and Shadow for the main container ⭐
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      {/* Chart Controls - Mobile optimized grid */}
      <div className={`grid grid-cols-1 ${is3DChart ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-3 md:gap-4 mb-4 md:mb-6`}>
        <div>
          {/* ⭐ Dark Mode Text for Labels ⭐ */}
          <label htmlFor="xAxis" className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">X-Axis</label>
          <select
            id="xAxis"
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value)}
            // ⭐ Dark Mode Styles for Select input ⭐
            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400 text-sm md:text-base"
          >
            <option value="">Select X-axis</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>
        <div>
          {/* ⭐ Dark Mode Text for Labels ⭐ */}
          <label htmlFor="yAxis" className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Y-Axis</label>
          <select
            id="yAxis"
            value={yAxis}
            onChange={(e) => setYAxis(e.target.value)}
            // ⭐ Dark Mode Styles for Select input ⭐
            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400 text-sm md:text-base"
          >
            <option value="">Select Y-axis</option>
            {headers.map(header => (
              <option key={header} value={header}>{header}</option>
            ))}
          </select>
        </div>
        {is3DChart && (
          <div>
            {/* ⭐ Dark Mode Text for Labels ⭐ */}
            <label htmlFor="zAxis" className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Z-Axis</label>
            <select
              id="zAxis"
              value={zAxis}
              onChange={(e) => setZAxis(e.target.value)}
              // ⭐ Dark Mode Styles for Select input ⭐
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400 text-sm md:text-base"
            >
              <option value="">Select Z-axis</option>
              {headers.map(header => (
                <option key={header} value={header}>{header}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          {/* ⭐ Dark Mode Text for Labels ⭐ */}
          <label htmlFor="chartType" className="block text-gray-700 text-sm font-bold mb-2 dark:text-gray-300">Chart Type</label>
          <select
            id="chartType"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            // ⭐ Dark Mode Styles for Select input ⭐
            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-500 bg-white text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-400 dark:focus:border-blue-400 text-sm md:text-base"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="scatter">Scatter Plot</option>
            <option value="3dbar">3D Bar Chart</option>
            <option value="3dscatter">3D Scatter Plot</option>
            <option value="3dsurface">3D Surface Plot</option>
          </select>
        </div>
      </div>

      {/* Chart Display Area - Mobile optimized */}
      {/* ⭐ Dark Mode Background, Border, and Shadow for chart container ⭐ */}
      <div className="chart-container relative h-64 md:h-96 w-full mb-4 md:mb-6 p-2 md:p-4 border border-gray-200 rounded-md bg-gray-50 flex items-center justify-center dark:bg-gray-700 dark:border-gray-600">
        {renderChart()}
      </div>

      {/* Action Buttons - Mobile optimized */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 md:gap-3 mb-4 md:mb-6">
        <button
          onClick={() => handleDownloadChart('png')}
          className="bg-green-500 hover:bg-green-600 text-white px-4 md:px-5 py-2 rounded-md shadow-sm transition duration-300 disabled:opacity-50 text-sm md:text-base"
          disabled={(!chartData && !is3DChart) || error}
        >
          Download PNG
        </button>
        <button
          onClick={() => handleDownloadChart('pdf')}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 md:px-5 py-2 rounded-md shadow-sm transition duration-300 disabled:opacity-50 text-sm md:text-base"
          disabled={(!chartData && !is3DChart) || error}
        >
          Download PDF
        </button>
        <button
            onClick={handleSaveAnalysis}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-5 py-2 rounded-md shadow-sm transition duration-300 disabled:opacity-50 text-sm md:text-base"
            disabled={(!chartData && !is3DChart) || error || savingAnalysis}
        >
            {savingAnalysis ? 'Saving...' : 'Save Analysis'}
        </button>
      </div>
    </div>
  );
}

export default ChartGenerator;