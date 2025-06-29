import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface LiDARPoint {
  x: number;
  y: number;
  z: number;
  intensity?: number;
  classification?: number;
}

interface LiDARMetadata {
  resolution: number;
  area: string;
  date: string;
  source: string;
  pointCount: number;
}

interface LiDARViewerProps {
  data: {
    points: LiDARPoint[];
    metadata: LiDARMetadata;
  };
  pointSize?: number;
  showIntensity?: boolean;
  autoRotate?: boolean;
  className?: string;
}

export const LiDARViewer: React.FC<LiDARViewerProps> = ({
  data,
  pointSize = 1.5,
  showIntensity = false,
  autoRotate = false,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current || !data) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827);

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      10000
    );
    camera.position.set(0, 0, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(1, 1, 1);
    scene.add(dirLight);

    // Point cloud geometry
    try {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(data.points.length * 3);
      const colors = new Float32Array(data.points.length * 3);

      data.points.forEach((pt, i) => {
        positions[i * 3] = pt.x;
        positions[i * 3 + 1] = pt.y;
        positions[i * 3 + 2] = pt.z;
        let color = 0.7;
        if (showIntensity && pt.intensity !== undefined) {
          color = pt.intensity / 255;
        }
        colors[i * 3] = color;
        colors[i * 3 + 1] = color;
        colors[i * 3 + 2] = color;
      });

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: pointSize,
        vertexColors: true,
        opacity: 0.85,
        transparent: true,
      });

      const pointCloud = new THREE.Points(geometry, material);
      scene.add(pointCloud);

      // Center camera
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
      setError('Failed to load LiDAR data');
      setIsLoading(false);
    }

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
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
  }, [data, pointSize, showIntensity, autoRotate]);

  if (error) {
    return (
      <div className={`lidar-viewer error ${className}`}>
        <div className="error-message">
          <h3>Error Loading LiDAR</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`lidar-viewer ${className}`}>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading LiDAR point cloud...</p>
        </div>
      )}
      <div ref={mountRef} className="viewer-container" />
      <div className="metadata-panel">
        <h4>LiDAR Metadata</h4>
        <p><strong>Resolution:</strong> {data.metadata.resolution} pts/m²</p>
        <p><strong>Area:</strong> {data.metadata.area}</p>
        <p><strong>Date:</strong> {data.metadata.date}</p>
        <p><strong>Source:</strong> {data.metadata.source}</p>
        <p><strong>Points:</strong> {data.metadata.pointCount.toLocaleString()}</p>
      </div>
    </div>
  );
}; 