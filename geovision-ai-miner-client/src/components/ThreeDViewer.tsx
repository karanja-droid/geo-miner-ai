import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Box, Paper, Typography, Slider, Chip } from '@mui/material';
import { CameraAlt, Layers, Visibility, VisibilityOff } from '@mui/icons-material';

interface ThreeDViewerProps {
  geologicalData?: any[];
  drillHoles?: any[];
  onFeatureClick?: (feature: any) => void;
}

const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ 
  geologicalData = [], 
  drillHoles = [],
  onFeatureClick 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const [layers, setLayers] = useState({
    geological: true,
    drillHoles: true,
    grid: true,
    axes: true
  });
  const [cameraDistance, setCameraDistance] = useState(100);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(50, 50, 50);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Grid
    const gridHelper = new THREE.GridHelper(100, 20, 0x888888, 0xcccccc);
    gridHelper.userData = { type: 'grid' };
    scene.add(gridHelper);

    // Axes
    const axesHelper = new THREE.AxesHelper(25);
    axesHelper.userData = { type: 'axes' };
    scene.add(axesHelper);

    // Geological data visualization
    geologicalData.forEach((feature, index) => {
      if (feature.geometry && feature.geometry.coordinates) {
        const geometry = new THREE.BoxGeometry(5, feature.depth || 10, 5);
        const material = new THREE.MeshLambertMaterial({
          color: feature.type === 'ore' ? 0xff6b35 : 
                 feature.type === 'waste' ? 0x8b4513 : 
                 feature.type === 'overburden' ? 0x228b22 : 0xcccccc,
          transparent: true,
          opacity: 0.8
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          feature.geometry.coordinates[0] || 0,
          (feature.depth || 10) / 2,
          feature.geometry.coordinates[1] || 0
        );
        mesh.userData = { 
          type: 'geological',
          feature: feature,
          id: feature.id 
        };
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
      }
    });

    // Drill holes visualization
    drillHoles.forEach((hole, index) => {
      const geometry = new THREE.CylinderGeometry(0.5, 0.5, hole.depth || 20, 8);
      const material = new THREE.MeshLambertMaterial({
        color: hole.status === 'completed' ? 0x4caf50 :
               hole.status === 'in-progress' ? 0xff9800 :
               hole.status === 'planned' ? 0x2196f3 : 0xcccccc
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        hole.longitude || 0,
        (hole.depth || 20) / 2,
        hole.latitude || 0
      );
      mesh.userData = { 
        type: 'drillHole',
        feature: hole,
        id: hole.id 
      };
      mesh.castShadow = true;
      scene.add(mesh);
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Handle mouse clicks
    const handleClick = (event: MouseEvent) => {
      if (!mountRef.current || !camera || !raycasterRef.current) return;

      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      if (intersects.length > 0 && onFeatureClick) {
        const object = intersects[0].object;
        if (object.userData.feature) {
          onFeatureClick(object.userData.feature);
        }
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [geologicalData, drillHoles, onFeatureClick]);

  const toggleLayer = (layerName: keyof typeof layers) => {
    if (!sceneRef.current) return;

    const newLayers = { ...layers, [layerName]: !layers[layerName] };
    setLayers(newLayers);

    sceneRef.current.children.forEach(child => {
      if (child.userData.type === layerName) {
        child.visible = newLayers[layerName];
      }
    });
  };

  const handleCameraDistanceChange = (event: Event, newValue: number | number[]) => {
    const distance = newValue as number;
    setCameraDistance(distance);
    
    if (cameraRef.current) {
      const direction = cameraRef.current.position.clone().normalize();
      cameraRef.current.position.copy(direction.multiplyScalar(distance));
    }
  };

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <div ref={mountRef} style={{ height: '100%', width: '100%' }} />
      
      {/* Layer Controls */}
      <Paper 
        sx={{ 
          position: 'absolute', 
          top: 10, 
          left: 10, 
          p: 1, 
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          maxWidth: 200
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Layers fontSize="small" />
          <Typography variant="caption" fontWeight="bold">3D Layers</Typography>
        </Box>
        
        <Box display="flex" flexDirection="column" gap={0.5}>
          {Object.entries(layers).map(([key, visible]) => (
            <Chip
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              size="small"
              icon={visible ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
              onClick={() => toggleLayer(key as keyof typeof layers)}
              variant={visible ? 'filled' : 'outlined'}
              sx={{ fontSize: '0.7rem' }}
            />
          ))}
        </Box>
      </Paper>

      {/* Camera Controls */}
      <Paper 
        sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          p: 1, 
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          minWidth: 200
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <CameraAlt fontSize="small" />
          <Typography variant="caption" fontWeight="bold">Camera</Typography>
        </Box>
        
        <Typography variant="caption" display="block" mb={1}>
          Distance: {cameraDistance.toFixed(0)}m
        </Typography>
        
        <Slider
          value={cameraDistance}
          onChange={handleCameraDistanceChange}
          min={10}
          max={200}
          size="small"
          sx={{ width: '100%' }}
        />
      </Paper>
    </Box>
  );
};

export default ThreeDViewer;