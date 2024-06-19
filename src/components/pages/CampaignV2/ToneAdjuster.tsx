import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Draggable from 'react-draggable';
import { Switch } from '@mantine/core';

interface ToneAdjusterProps {
  xAxisLabel: string;
  yAxisLabel: string;
  voiceParam: { x: number, y: number };
  setVoiceParam: (coords: { x: number, y: number }) => void;
}

const ToneAdjuster: React.FC<ToneAdjusterProps> = ({ xAxisLabel, yAxisLabel, voiceParam, setVoiceParam }) => {
  const [dragging, setDragging] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(0.005);
  const [toneEnabled, setToneEnabled] = useState(true);
  const dotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorRef = useRef(new THREE.Color('gray'));
  const rotationRef = useRef({ x: 0, y: 0 }); // Store the rotation state
  const torusArgsRef = useRef([0.5, 0.17]); // Store the torus knot args

  const handleDrag = (e: any, data: any) => {
    const newX = Math.max(0, Math.min(280, data.x));
    const newY = Math.max(0, Math.min(280, data.y));
    setVoiceParam({ x: newX, y: newY });
    setDragging(true);

    if (toneEnabled) {
      // Update color based on position
      const r = newX / 280;
      const g = newY / 280;
      const b = 0.5;
      colorRef.current.setRGB(r, g, b);

      // Increase rotation speed based on dragging speed
      const speed = Math.sqrt(data.deltaX ** 2 + data.deltaY ** 2) / 1000;
      setRotationSpeed(0.01 + speed * 15); // Accelerate rotation even more

      // Update torus knot args based on position
      const newTorusArgs = [0.5 + newX / 560, 0.17 + newY / 1647];
      torusArgsRef.current = newTorusArgs;
    }
  };

  const handleStop = () => {
    setDragging(false);
    setRotationSpeed(0.01); // Reset rotation speed when dragging stops
  };

  const RotatingCube = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
      if (meshRef.current) {
        // Rotate the object
        const speedMultiplier = toneEnabled ? 0.9 : 0.15; // Double the speed if dot is clicked
        meshRef.current.rotation.x = rotationRef.current.x += rotationSpeed * speedMultiplier;
        meshRef.current.rotation.y = rotationRef.current.y += rotationSpeed * speedMultiplier;
      }
    });

    return (
      <mesh ref={meshRef} position={[0, 0, 0]} castShadow>
        <torusKnotGeometry attach="geometry" args={[torusArgsRef.current[0], torusArgsRef.current[1]]} />
        <meshPhysicalMaterial 
          color={toneEnabled ? colorRef.current : new THREE.Color('gray')} 
          transparent 
          opacity={0.95} // Make the cube more transparent
          metalness={10} // Increase metalness for a shinier effect
          thickness={3} 
          emissiveIntensity={0.2} // Increase emissive intensity for a stronger glow
        />
      </mesh>
    );
  };

  const getGradientColor = (x: number, y: number) => {
    if (!toneEnabled) {
      return 'rgb(169, 169, 169)'; // Gray color when tone is disabled
    }
    const r = Math.floor((x / 280) * 20 + 235); // Much softer red component
    const g = Math.floor((y / 280) * 20 + 235); // Much softer green component
    const b = 240; // Much softer fixed blue component
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div 
      style={{ position: 'relative', width: '300px', height: '300px', background: '#f0f0f0', border: '1px solid #ccc' }}
    >
      <Canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} shadows>
        <rectAreaLight width={1} height={5} color={0xffffff} intensity={0.7} position={[0, 0, 5]} onUpdate={self => self.lookAt(0, 0, 0)} /> {/* Adjusted rect area light position */}
        <RotatingCube />
      </Canvas>
      <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gridTemplateRows: 'repeat(10, 1fr)', pointerEvents: 'none', zIndex: 0, background: `linear-gradient(to bottom right, ${getGradientColor(voiceParam.x, voiceParam.y)}, #ffffff)` }}>
        {Array.from({ length: 100 }).map((_, index) => (
          <div key={index} style={{ border: '1px solid #ccc' }}></div>
        ))}
      </div>
      <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', zIndex: 2 }}>{xAxisLabel}</div>
      <div style={{ position: 'absolute', top: '50%', left: '-10%', transform: 'translateY(-60%) rotate(-90deg)', fontWeight: 'bold', zIndex: 2 }}>{yAxisLabel}</div>
      <Draggable
        bounds="parent"
        position={{ x: voiceParam.x, y: voiceParam.y }}
        onDrag={handleDrag}
        onStop={handleStop}
      >
        <div
          ref={dotRef}
          style={{ position: 'absolute', width: '20px', height: '20px', background: 'transparent', border: '2px solid black', borderRadius: '50%', cursor: 'crosshair', zIndex: 3 }}
        />
      </Draggable>
      <div style={{ 
        position: 'absolute', 
        bottom: '10px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        zIndex: 2, 
        backgroundColor: 'white', 
        borderRadius: '50px', 
        padding: '5px 20px', 
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' 
      }}>
        <Switch
          label={<span style={{ whiteSpace: 'nowrap' }}>{toneEnabled ? 'Enabled' : 'Disabled'}</span>}
          checked={toneEnabled}
          onChange={(event) => {
            const isChecked = event.currentTarget.checked;
            setToneEnabled(isChecked);
            if (!isChecked) {
              setVoiceParam({ x: 140, y: 140 });
            }
          }}
        />
      </div>
    </div>
  );
};

export default ToneAdjuster;
