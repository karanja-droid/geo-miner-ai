import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder } from '@react-three/drei';
import { motion } from 'framer-motion';

interface GeologicalLayer {
  id: string;
  name: string;
  type: 'rock' | 'mineral' | 'soil' | 'water';
  depth: number;
  thickness: number;
  color: string;
  properties: {
    density: number;
    porosity: number;
    permeability: number;
  };
}

interface Geological3DViewerProps {
  layers: GeologicalLayer[];
  selectedLayer?: string;
  onLayerClick?: (layer: GeologicalLayer) => void;
  className?: string;
}

const GeologicalLayer3D: React.FC<{
  layer: GeologicalLayer;
  isSelected: boolean;
  onClick: () => void;
}> = ({ layer, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation for visual appeal
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group position={[0, -layer.depth, 0]}>
      <Box
        ref={meshRef}
        args={[10, layer.thickness, 10]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={layer.color}
          transparent
          opacity={isSelected ? 0.8 : hovered ? 0.7 : 0.6}
          metalness={0.1}
          roughness={0.8}
        />
      </Box>
      
      {/* Layer label */}
      <Text
        position={[0, layer.thickness / 2 + 0.5, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {layer.name}
      </Text>

      {/* Selection indicator */}
      {isSelected && (
        <Box args={[10.2, layer.thickness + 0.1, 10.2]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#FFD700"
            transparent
            opacity={0.3}
            wireframe
          />
        </Box>
      )}
    </group>
  );
};

const Geological3DViewer: React.FC<Geological3DViewerProps> = ({
  layers,
  selectedLayer,
  onLayerClick,
  className = ''
}) => {
  const [cameraPosition, setCameraPosition] = useState([0, 5, 10]);

  return (
    <motion.div
      className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded">
        <h3 className="text-lg font-semibold">3D Geological Model</h3>
        <p className="text-sm opacity-75">Click layers to inspect</p>
      </div>

      <Canvas
        camera={{ position: cameraPosition, fov: 60 }}
        style={{ height: '500px' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        {/* Geological layers */}
        {layers.map((layer) => (
          <GeologicalLayer3D
            key={layer.id}
            layer={layer}
            isSelected={selectedLayer === layer.id}
            onClick={() => onLayerClick?.(layer)}
          />
        ))}

        {/* Grid for reference */}
        <gridHelper args={[20, 20, '#666666', '#444444']} />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Layer information panel */}
      {selectedLayer && (
        <motion.div
          className="absolute bottom-4 right-4 bg-white bg-opacity-95 p-4 rounded-lg shadow-lg max-w-sm"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
        >
          {(() => {
            const layer = layers.find(l => l.id === selectedLayer);
            if (!layer) return null;
            
            return (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{layer.name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="capitalize">{layer.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Depth:</span>
                    <span>{layer.depth}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thickness:</span>
                    <span>{layer.thickness}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Density:</span>
                    <span>{layer.properties.density} g/cm³</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Porosity:</span>
                    <span>{layer.properties.porosity}%</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Geological3DViewer; 