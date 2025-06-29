import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface PointCloudData {
  points: Array<{
    x: number;
    y: number;
    z: number;
    color?: [number, number, number];
    intensity?: number;
  }>;
  metadata: {
    resolution: number;
    coverage: string;
    date: string;
    camera: string;
  };
}

interface PhotogrammetryViewerProps {
  data: PointCloudData;
  showIntensity?: boolean;
  pointSize?: number;
  autoRotate?: boolean;
  onPointSelect?: (point: { x: number; y: number; z: number }) => void;
  className?: string;
}

export const PhotogrammetryViewer: React.FC<PhotogrammetryViewerProps> = ({
  data,
  showIntensity = false,
  pointSize = 2,
  autoRotate = false,
  onPointSelect,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current || !data) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 100);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create point cloud geometry
    try {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(data.points.length * 3);
      const colors = new Float32Array(data.points.length * 3);

      data.points.forEach((point, index) => {
        positions[index * 3] = point.x;
        positions[index * 3 + 1] = point.y;
        positions[index * 3 + 2] = point.z;

        if (showIntensity && point.intensity !== undefined) {
          const intensity = point.intensity / 255;
          colors[index * 3] = intensity;
          colors[index * 3 + 1] = intensity;
          colors[index * 3 + 2] = intensity;
        } else if (point.color) {
          colors[index * 3] = point.color[0] / 255;
          colors[index * 3 + 1] = point.color[1] / 255;
          colors[index * 3 + 2] = point.color[2] / 255;
        } else {
          colors[index * 3] = 0.7;
          colors[index * 3 + 1] = 0.7;
          colors[index * 3 + 2] = 0.7;
        }
      });

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: pointSize,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
      });

      const pointCloud = new THREE.Points(geometry, material);
      scene.add(pointCloud);

      // Center camera on point cloud
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      if (box) {
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.position.copy(center);
        camera.position.z += maxDim * 2;
        controls.target.copy(center);
      }

      setIsLoading(false);
    } catch (err) {
      setError('Failed to load point cloud data');
      setIsLoading(false);
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [data, showIntensity, pointSize, autoRotate]);

  if (error) {
    return (
      <div className={`photogrammetry-viewer error ${className}`}>
        <div className="error-message">
          <h3>Error Loading Point Cloud</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`photogrammetry-viewer ${className}`}>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading point cloud...</p>
        </div>
      )}
      <div ref={mountRef} className="viewer-container" />
      <div className="metadata-panel">
        <h4>Photogrammetry Data</h4>
        <p><strong>Resolution:</strong> {data.metadata.resolution}cm</p>
        <p><strong>Coverage:</strong> {data.metadata.coverage}</p>
        <p><strong>Date:</strong> {data.metadata.date}</p>
        <p><strong>Camera:</strong> {data.metadata.camera}</p>
        <p><strong>Points:</strong> {data.points.length.toLocaleString()}</p>
      </div>
    </div>
  );
}; 