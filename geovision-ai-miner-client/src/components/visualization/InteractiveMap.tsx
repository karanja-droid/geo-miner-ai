import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion } from 'framer-motion';

// Set your Mapbox access token here
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'your-mapbox-token-here';

interface GeologicalPoint {
  id: string;
  type: 'rock' | 'mineral' | 'soil' | 'water' | 'drill_site';
  coordinates: [number, number];
  properties: {
    name: string;
    description: string;
    depth: number;
    confidence: number;
    sample_data?: any;
  };
}

interface InteractiveMapProps {
  points: GeologicalPoint[];
  onPointClick?: (point: GeologicalPoint) => void;
  selectedPoint?: string;
  className?: string;
  center?: [number, number];
  zoom?: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  points,
  onPointClick,
  selectedPoint,
  className = '',
  center = [-74.006, 40.7128], // Default to NYC
  zoom = 10
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9', // Satellite style for geological context
      center: center,
      zoom: zoom,
      pitch: 45, // 3D perspective
      bearing: 0
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      
      // Add geological data source
      if (map.current) {
        map.current.addSource('geological-points', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: points.map(point => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: point.coordinates
              },
              properties: {
                id: point.id,
                type: point.type,
                ...point.properties
              }
            }))
          }
        });

        // Add geological point layer
        map.current.addLayer({
          id: 'geological-points',
          type: 'circle',
          source: 'geological-points',
          paint: {
            'circle-radius': [
              'case',
              ['==', ['get', 'type'], 'drill_site'], 12,
              ['==', ['get', 'type'], 'mineral'], 8,
              ['==', ['get', 'type'], 'rock'], 6,
              ['==', ['get', 'type'], 'soil'], 4,
              ['==', ['get', 'type'], 'water'], 5,
              4
            ],
            'circle-color': [
              'case',
              ['==', ['get', 'type'], 'drill_site'], '#FF0000',
              ['==', ['get', 'type'], 'mineral'], '#FFD700',
              ['==', ['get', 'type'], 'rock'], '#8B4513',
              ['==', ['get', 'type'], 'soil'], '#DEB887',
              ['==', ['get', 'type'], 'water'], '#4682B4',
              '#666666'
            ],
            'circle-stroke-width': [
              'case',
              ['==', ['get', 'id'], selectedPoint || ''], 3,
              1
            ],
            'circle-stroke-color': '#FFFFFF',
            'circle-opacity': 0.8
          }
        });

        // Add hover effect
        map.current.on('mouseenter', 'geological-points', () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = 'pointer';
          }
        });

        map.current.on('mouseleave', 'geological-points', () => {
          if (map.current) {
            map.current.getCanvas().style.cursor = '';
          }
        });

        // Add click handler
        map.current.on('click', 'geological-points', (e) => {
          if (e.features && e.features[0]) {
            const feature = e.features[0];
            const point = points.find(p => p.id === feature.properties?.id);
            if (point && onPointClick) {
              onPointClick(point);
            }
          }
        });
      }
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update data when points change
  useEffect(() => {
    if (map.current && mapLoaded) {
      const source = map.current.getSource('geological-points') as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: points.map(point => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: point.coordinates
            },
            properties: {
              id: point.id,
              type: point.type,
              ...point.properties
            }
          }))
        });
      }
    }
  }, [points, mapLoaded]);

  // Update selected point styling
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setPaintProperty('geological-points', 'circle-stroke-width', [
        'case',
        ['==', ['get', 'id'], selectedPoint || ''], 3,
        1
      ]);
    }
  }, [selectedPoint, mapLoaded]);

  return (
    <motion.div
      className={`relative rounded-lg overflow-hidden shadow-lg ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded">
        <h3 className="text-lg font-semibold">Interactive Geological Map</h3>
        <p className="text-sm opacity-75">Click points to inspect</p>
      </div>

      <div ref={mapContainer} className="w-full h-96" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 p-3 rounded shadow-lg">
        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Drill Sites</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Minerals</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-brown-500 rounded-full"></div>
            <span>Rocks</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-tan-500 rounded-full"></div>
            <span>Soil</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Water</span>
          </div>
        </div>
      </div>

      {/* Point information panel */}
      {selectedPoint && (
        <motion.div
          className="absolute top-4 right-4 bg-white bg-opacity-95 p-4 rounded-lg shadow-lg max-w-sm"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
        >
          {(() => {
            const point = points.find(p => p.id === selectedPoint);
            if (!point) return null;
            
            return (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{point.properties.name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <span className="capitalize">{point.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Depth:</span>
                    <span>{point.properties.depth}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <span>{point.properties.confidence}%</span>
                  </div>
                  <p className="text-gray-600 mt-2">{point.properties.description}</p>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </motion.div>
  );
}; 