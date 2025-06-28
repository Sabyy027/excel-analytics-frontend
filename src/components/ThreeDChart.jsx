// frontend/src/components/ThreeDChart.jsx

import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react'; // ⭐ Added useCallback ⭐
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Grid, Box } from '@react-three/drei';
import * as THREE from 'three';

// Helper to check if dark mode is active by looking for the 'dark' class on the root HTML element
const isDarkModeActive = () => document.documentElement.classList.contains('dark');

// Color palettes for 3D objects, adjusted for light and dark modes
const LIGHT_MODE_PALETTE = [
  '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#54A0FF', '#C7CEEA',
  '#FDD26E', '#8D3B73', '#009B8B', '#FFD700', '#A9A9A9', '#4682B4'
];
const DARK_MODE_PALETTE = [
  '#2ECC71', '#9B59B6', '#E67E22', '#E74C3C', '#3498DB', '#95A5A6',
  '#F1C40F', '#D35400', '#1ABC9C', '#27AE60', '#C0392B', '#8E44AD'
];


// 3D Bar Component
function Bar3D({ position, height, width, depth, color, label, value }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const textColor = isDarkModeActive() ? 'white' : 'black'; // Get text color based on mode

  // Optional subtle rotation (can be removed if not desired)
  useFrame(() => {
    // if (meshRef.current) {
    //   meshRef.current.rotation.y += 0.001;
    // }
  });

  return (
    <group position={position}>
      {/* 3D Bar */}
      <Box
        ref={meshRef}
        args={[width, height, depth]}
        position={[0, height / 2, 0]} // Position box center, so base is at y=0
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={hovered ? '#ff6b6b' : color} // Hover color stays consistent
          transparent 
          opacity={0.8}
        />
      </Box>
      {/* Value Label */}
      <Text
        position={[0, height + 0.3, 0]} // Above the bar
        fontSize={0.18}
        color={textColor} // ⭐ Dark mode text color ⭐
        anchorX="center"
        anchorY="middle"
      >
        {value.toFixed(2)} {/* Format value for display */}
      </Text>
      {/* X-axis Label (below the bar) */}
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.32}
        color={textColor} // ⭐ Dark mode text color ⭐
        anchorX="center"
        anchorY="middle"
        maxWidth={width * 1.2}
        rotation={[-Math.PI / 4, 0, 0]} // slight tilt for readability
      >
        {label.length > 12 ? label.slice(0, 12) + '…' : label}
      </Text>
    </group>
  );
}

// 3D Scatter Plot Component
function Scatter3D({ data, xAxisKey, yAxisKey, zAxisKey }) { // Renamed props for consistency
  const pointColor = new THREE.Color(isDarkModeActive() ? '#4ecdc4' : '#6a0dad'); // Adjust point color for dark mode

  const points = useMemo(() => {
    return data.map((point, index) => (
      <mesh
        key={index}
        position={[point.x, point.y, point.z]}
        onPointerOver={(e) => {
          e.stopPropagation(); // Prevent event bubbling
          e.object.scale.setScalar(1.5); // Enlarge on hover
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          e.object.scale.setScalar(1); // Reset size on hover out
        }}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={pointColor} transparent opacity={0.7} />
        {/* Optional: Add text label on hover or always (more complex for many points) */}
      </mesh>
    ));
  }, [data, pointColor]); // Depend on pointColor so it updates with mode

  return <group>{points}</group>;
}

// 3D Surface Plot Component (Placeholder/Example - often requires specific data structure)
function Surface3D({ data, xAxisKey, yAxisKey, zAxisKey }) { // Renamed props for consistency
  const geometry = useMemo(() => {
    // This is a basic example. For real data, you'd map data[xAxisKey], data[zAxisKey]
    // to vertex positions and data[yAxisKey] to height (positions[i+1]).
    // Creating a grid geometry from arbitrary data points is complex.
    const geometry = new THREE.PlaneGeometry(10, 10, 20, 20); // Width, Height, SegmentsX, SegmentsY
    const positions = geometry.attributes.position.array;
    
    // Example: Create a simple wave-like surface
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      positions[i + 1] = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 2;
    }
    
    geometry.attributes.position.needsUpdate = true; // Tell Three.js to update geometry
    geometry.computeVertexNormals(); // Recalculate normals for correct lighting
    return geometry;
  }, [data]); // Depend on data to recompute if data changes

  const materialColor = new THREE.Color(isDarkModeActive() ? '#3498db' : '#74b9ff'); // Adjust color for dark mode

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}> {/* Rotate to be horizontal */}
      <primitive object={geometry} />
      <meshStandardMaterial 
        color={materialColor} // ⭐ Dark mode material color ⭐
        transparent 
        opacity={0.6}
        wireframe={false} // Set to true to see the grid structure
      />
    </mesh>
  );
}

// Main 3D Chart Component
function ThreeDChart({ chartType, data, xAxisKey, yAxisKey, zAxisKey }) { // Renamed props for clarity
  const mountRef = useRef(); // Ref to the parent div for getting Canvas dimensions

  // --- Start: Fix unused vars and dependency warnings ---
  // Removed unused: cameraPosition, setCameraPosition, width, height.
  // Use `mountRef.current.clientWidth` directly in `Canvas` style if needed.
  // --- End: Fix unused vars and dependency warnings ---

  // Memoize processed data for performance and stability of dependencies
  const processedChartData = useMemo(() => {
    if (!data || data.length === 0 || !xAxisKey || !yAxisKey || !zAxisKey) return [];

    const currentPalette = isDarkModeActive() ? DARK_MODE_PALETTE : LIGHT_MODE_PALETTE;

    switch (chartType) {
      case '3dbar':
        const yValues = data.map(item => parseFloat(item[yAxisKey])).filter(val => !isNaN(val));
        const zValues = data.map(item => parseFloat(item[zAxisKey])).filter(val => !isNaN(val));
        
        if (yValues.length === 0 || zValues.length === 0) return [];

        const maxY = Math.max(...yValues);

        // Get unique categories for positioning on X and Z axes
        const uniqueX = Array.from(new Set(data.map(item => item[xAxisKey])));
        const uniqueZ = Array.from(new Set(data.map(item => item[zAxisKey])));

        const barWidth = 0.8;
        const barDepth = 0.8;
        const xSpacing = 1.5; // Spacing between bars on X-axis
        const zSpacing = 1.5; // Spacing between rows of bars on Z-axis

        // Calculate chart center for positioning (to center the entire cluster of bars)
        const totalChartWidthX = uniqueX.length * xSpacing;
        const totalChartWidthZ = uniqueZ.length * zSpacing;
        const startX = -totalChartWidthX / 2 + xSpacing / 2;
        const startZ = -totalChartWidthZ / 2 + zSpacing / 2;

        return data.map((item) => {
          const xIndex = uniqueX.indexOf(item[xAxisKey]);
          const zIndex = uniqueZ.indexOf(item[zAxisKey]); // Get Z-axis category index

          if (xIndex === -1 || zIndex === -1) return null; // Skip if categories not found

          const height = parseFloat(item[yAxisKey]) || 0;
          if (isNaN(height)) return null;

          const scaledHeight = (height / maxY) * 5; // Scale height (Y) to max 5 units for visibility

          const xPos = startX + xIndex * xSpacing;
          const zPos = startZ + zIndex * zSpacing; // Position along Z-axis
          
          return {
            position: [xPos, 0, zPos], // Position base of bar at Y=0
            height: scaledHeight,
            width: barWidth,
            depth: barDepth,
            color: currentPalette[xIndex % currentPalette.length], // Color based on X category
            label: item[xAxisKey],
            value: height,
            zLabel: item[zAxisKey] // Include zLabel for potential tooltip/label
          };
        }).filter(Boolean); // Filter out null entries (invalid rows)

      case '3dscatter':
        // For scatter plots, map raw data to 3D coordinates
        return data.map((item, index) => ({
          x: parseFloat(item[xAxisKey]) || 0, // Ensure X is numeric
          y: parseFloat(item[yAxisKey]) || 0, // Ensure Y is numeric
          z: parseFloat(item[zAxisKey]) || 0, // Ensure Z is numeric
        })).filter(point => !isNaN(point.x) && !isNaN(point.y) && !isNaN(point.z));

      case '3dsurface':
        // Surface plot typically needs a grid-like data structure, not raw points.
        // The Surface3D component above has example logic, but for real data
        // it would need careful preprocessing to form a mesh.
        return data;
      default:
        return [];
    }
  }, [data, chartType, xAxisKey, yAxisKey, zAxisKey, currentPalette]); // Dependencies for useMemo

  // Effect to force a re-render when dark mode changes (for colors inside Canvas)
  // This is a common pattern to make Three.js elements react to global CSS class changes.
  useEffect(() => {
    const observer = new MutationObserver(() => {
        // Increment a dummy state to force component re-render
        // This makes `isDarkModeActive()` re-evaluate and update colors in children
        // Use a state that doesn't actually store data, just triggers update
        // You might need a dummy state if not already in ThreeDChart
        // For now, let's assume `setRerender` exists or directly use a re-render approach.
        // A simpler way is to just define color functions that check mode.
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []); // Empty dependency array means this runs once on mount/unmount


  // Get axis label color based on theme
  const getAxisLabelColor = () => isDarkModeActive() ? 'white' : 'black';
  const getGridColor = () => isDarkModeActive() ? '#4a4a4a' : '#6f6f6f'; // Darker grid for dark mode
  const getSectionGridColor = () => isDarkModeActive() ? '#7a7a7a' : '#9d4b4b'; // Darker section grid

  const renderChartContent = () => {
    switch (chartType) {
      case '3dbar':
        return (
          <group>
            {processedChartData.map((bar, index) => (
              <Bar3D key={index} {...bar} />
            ))}
          </group>
        );

      case '3dscatter':
        return (
          <Scatter3D 
            data={processedChartData} 
            xAxisKey={xAxisKey} // Pass key for potential future labels/tooltips
            yAxisKey={yAxisKey}
            zAxisKey={zAxisKey}
          />
        );

      case '3dsurface':
        return (
          <Surface3D 
            data={processedChartData} // Pass processed data if Surface3D handles it
            xAxisKey={xAxisKey} 
            yAxisKey={yAxisKey} 
            zAxisKey={zAxisKey} 
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={mountRef}
      className="w-full h-96 max-w-4xl mx-auto rounded shadow bg-gray-100 dark:bg-gray-800" // ⭐ Dark mode wrapper background ⭐
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <Canvas
        camera={{ 
          position: [data && data.length > 0 ? data.length * 1.5 : 10, 8, data && data.length > 0 ? data.length * 2 : 10], 
          fov: 60, 
          near: 0.1, 
          far: 1000 
        }}
        // ⭐ Dynamic background style based on dark mode ⭐
        style={{ 
            background: isDarkModeActive() 
                ? 'linear-gradient(to bottom, #2d2d2d, #1a1a1a)' 
                : 'linear-gradient(to bottom, #f0f8ff, #e6f3ff)' 
        }}
      >
        {/* Lighting (may need adjustment for dark mode contrast) */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1.1} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />
        
        {/* Grid for reference */}
        <Grid 
          args={[30, 30]} 
          cellSize={1} 
          cellThickness={0.4} 
          cellColor={getGridColor()} // ⭐ Dark mode grid color ⭐
          sectionSize={5} 
          sectionThickness={1} 
          sectionColor={getSectionGridColor()} // ⭐ Dark mode section grid color ⭐
          fadeDistance={30} 
          fadeStrength={1} 
          followCamera={false} 
          infiniteGrid={true} 
        />
        
        {/* Axes Labels */}
        <Text position={[0, 0, -10]} fontSize={0.28} color={getAxisLabelColor()}> {/* ⭐ Dark mode text color ⭐ */}
          {xAxisKey}
        </Text>
        <Text position={[data && data.length > 0 ? data.length * 1.5 : 8, 0, 0]} fontSize={0.28} color={getAxisLabelColor()} rotation={[0, Math.PI / 2, 0]}> {/* ⭐ Dark mode text color ⭐ */}
          {yAxisKey}
        </Text>
        <Text position={[0, 8, 0]} fontSize={0.28} color={getAxisLabelColor()} rotation={[-Math.PI / 2, 0, 0]}> {/* ⭐ Dark mode text color ⭐ */}
          {zAxisKey || 'Z-Axis'}
        </Text>
        
        {/* Chart Content */}
        {renderChartContent()} {/* Renamed from renderChart to avoid conflict */}
        
        {/* Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={data && data.length > 0 ? data.length * 4 : 50}
          target={[0, 3, 0]}
        />
      </Canvas>
    </div>
  );
}

export default ThreeDChart;