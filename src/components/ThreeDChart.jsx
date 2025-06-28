import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Grid, Box } from '@react-three/drei';
import * as THREE from 'three';

// 3D Bar Component
function Bar3D({ position, height, width, depth, color, label, value }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group position={position}>
      {/* 3D Bar */}
      <Box
        ref={meshRef}
        args={[width, height, depth]}
        position={[0, height / 2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={hovered ? '#ff6b6b' : color} 
          transparent 
          opacity={0.8}
        />
      </Box>
      {/* Value Label */}
      <Text
        position={[0, height + 0.3, 0]}
        fontSize={0.18}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {value}
      </Text>
      {/* X-axis Label */}
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.32}
        color="black"
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
function Scatter3D({ data, xAxis, yAxis, zAxis }) {
  const points = useMemo(() => {
    return data.map((point, index) => (
      <mesh
        key={index}
        position={[point.x, point.y, point.z]}
        onPointerOver={(e) => {
          e.object.scale.setScalar(1.5);
        }}
        onPointerOut={(e) => {
          e.object.scale.setScalar(1);
        }}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#4ecdc4" transparent opacity={0.7} />
      </mesh>
    ));
  }, [data]);

  return <group>{points}</group>;
}

// 3D Surface Plot Component
function Surface3D({ data, xAxis, yAxis, zAxis }) {
  const geometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(10, 10, 20, 20);
    const positions = geometry.attributes.position.array;
    
    // Create surface based on data
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      // Create a wave-like surface (you can modify this based on your data)
      positions[i + 1] = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 2;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }, [data]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <primitive object={geometry} />
      <meshStandardMaterial 
        color="#74b9ff" 
        transparent 
        opacity={0.6}
        wireframe={false}
      />
    </mesh>
  );
}

// Main 3D Chart Component
function ThreeDChart({ chartType, data, xAxis, yAxis, zAxis }) {
  const mountRef = useRef();
  const [cameraPosition, setCameraPosition] = useState([10, 10, 10]);
  const rendererRef = useRef();
  const cameraRef = useRef();

  useEffect(() => {
    // ... your Three.js setup ...
    // Instead of hardcoding width/height, use the parent element's size:
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // ... use width/height for renderer/camera ...

    // Add resize listener
    const handleResize = () => {
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.setSize(newWidth, newHeight);
        cameraRef.current.aspect = newWidth / newHeight;
        cameraRef.current.updateProjectionMatrix();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      // ... cleanup ...
    };
  }, [chartType, data, xAxis, yAxis, zAxis]);

  // Process data for 3D visualization
  const processedData = useMemo(() => {
    if (!data || !data.length) return [];
    switch (chartType) {
      case '3dbar':
        return data.map((item, index) => ({
          position: [index * 3.2 - (data.length - 1), 0, 0],
          height: parseFloat(item[yAxis]) || 1,
          width: 1.2,
          depth: 1.2,
          color: `hsl(${(index * 360) / data.length}, 70%, 60%)`,
          label: item[xAxis] || `Item ${index}`,
          value: parseFloat(item[yAxis]) || 0
        }));

      case '3dscatter':
        return data.map((item, index) => ({
          x: parseFloat(item[xAxis]) || index,
          y: parseFloat(item[yAxis]) || 0,
          z: parseFloat(item[zAxis]) || 0
        }));

      case '3dsurface':
        return data; // Surface data processing

      default:
        return [];
    }
  }, [data, chartType, xAxis, yAxis, zAxis]);

  const renderChart = () => {
    switch (chartType) {
      case '3dbar':
        return (
          <group>
            {processedData.map((bar, index) => (
              <Bar3D key={index} {...bar} />
            ))}
          </group>
        );

      case '3dscatter':
        return (
          <Scatter3D 
            data={processedData} 
            xAxis={xAxis} 
            yAxis={yAxis} 
            zAxis={zAxis} 
          />
        );

      case '3dsurface':
        return (
          <Surface3D 
            data={processedData} 
            xAxis={xAxis} 
            yAxis={yAxis} 
            zAxis={zAxis} 
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={mountRef}
      className="w-full h-96 max-w-4xl mx-auto bg-white rounded shadow"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      <Canvas
        camera={{ 
          position: [data && data.length > 0 ? data.length * 1.5 : 10, 8, data && data.length > 0 ? data.length * 2 : 10], 
          fov: 60, 
          near: 0.1, 
          far: 1000 
        }}
        style={{ background: 'linear-gradient(to bottom, #f0f8ff, #e6f3ff)' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1.1} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} />
        {/* Grid for reference */}
        <Grid 
          args={[30, 30]} 
          cellSize={1} 
          cellThickness={0.4} 
          cellColor="#6f6f6f" 
          sectionSize={5} 
          sectionThickness={1} 
          sectionColor="#9d4b4b" 
          fadeDistance={30} 
          fadeStrength={1} 
          followCamera={false} 
          infiniteGrid={true} 
        />
        {/* Axes Labels */}
        <Text position={[0, 0, -10]} fontSize={0.28} color="black">
          {xAxis}
        </Text>
        <Text position={[data && data.length > 0 ? data.length * 1.5 : 8, 0, 0]} fontSize={0.28} color="black" rotation={[0, Math.PI / 2, 0]}>
          {yAxis}
        </Text>
        <Text position={[0, 8, 0]} fontSize={0.28} color="black" rotation={[-Math.PI / 2, 0, 0]}>
          {zAxis || 'Z-Axis'}
        </Text>
        {/* Chart Content */}
        {renderChart()}
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