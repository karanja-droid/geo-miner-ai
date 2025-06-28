import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box, Paper, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import { Layers, Visibility, VisibilityOff, Add, Remove } from '@mui/icons-material';

// Set your Mapbox access token here
mapboxgl.accessToken = 'pk.eyJ1IjoiZ2VvdmlzaW9uYWkiLCJhIjoiY2x4eHh4eHh4eHh4eHh4In0.example';

interface Map2DProps {
  projectId?: string;
  geologicalData?: any[];
  drillHoles?: any[];
  onFeatureClick?: (feature: any) => void;
}

const Map2D: React.FC<Map2DProps> = ({ 
  projectId, 
  geologicalData = [], 
  drillHoles = [],
  onFeatureClick 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [layers, setLayers] = useState({
    geological: true,
    drillHoles: true,
    topography: true,
    satellite: false
  });

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [-74.006, 40.7128], // Default to NYC, should be project location
      zoom: 12,
      pitch: 45,
      bearing: 0
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add geological data layer
      if (geologicalData.length > 0) {
        map.current.addSource('geological-data', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: geologicalData.map(feature => ({
              type: 'Feature',
              geometry: feature.geometry,
              properties: {
                id: feature.id,
                type: feature.type,
                grade: feature.grade,
                depth: feature.depth
              }
            }))
          }
        });

        map.current.addLayer({
          id: 'geological-fill',
          type: 'fill',
          source: 'geological-data',
          paint: {
            'fill-color': [
              'case',
              ['==', ['get', 'type'], 'ore'], '#ff6b35',
              ['==', ['get', 'type'], 'waste'], '#8b4513',
              ['==', ['get', 'type'], 'overburden'], '#228b22',
              '#cccccc'
            ],
            'fill-opacity': 0.7
          }
        });

        map.current.addLayer({
          id: 'geological-outline',
          type: 'line',
          source: 'geological-data',
          paint: {
            'line-color': '#000000',
            'line-width': 2
          }
        });
      }

      // Add drill holes layer
      if (drillHoles.length > 0) {
        map.current.addSource('drill-holes', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: drillHoles.map(hole => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [hole.longitude, hole.latitude]
              },
              properties: {
                id: hole.id,
                depth: hole.depth,
                status: hole.status,
                grade: hole.average_grade
              }
            }))
          }
        });

        map.current.addLayer({
          id: 'drill-holes-points',
          type: 'circle',
          source: 'drill-holes',
          paint: {
            'circle-radius': 8,
            'circle-color': [
              'case',
              ['==', ['get', 'status'], 'completed'], '#4caf50',
              ['==', ['get', 'status'], 'in-progress'], '#ff9800',
              ['==', ['get', 'status'], 'planned'], '#2196f3',
              '#cccccc'
            ],
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2
          }
        });
      }

      // Add topography layer
      map.current.addSource('mapbox-terrain', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-terrain-v2'
      });

      map.current.addLayer({
        id: 'terrain',
        type: 'hillshade',
        source: 'mapbox-terrain',
        'source-layer': 'terrain',
        paint: {
          'hillshade-shadow-color': '#000000',
          'hillshade-highlight-color': '#ffffff',
          'hillshade-accent-color': '#000000'
        }
      });
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Add click handlers
    map.current.on('click', 'geological-fill', (e) => {
      if (e.features && e.features[0] && onFeatureClick) {
        onFeatureClick(e.features[0]);
      }
    });

    map.current.on('click', 'drill-holes-points', (e) => {
      if (e.features && e.features[0] && onFeatureClick) {
        onFeatureClick(e.features[0]);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [geologicalData, drillHoles, onFeatureClick]);

  const toggleLayer = (layerName: keyof typeof layers) => {
    if (!map.current) return;

    const newLayers = { ...layers, [layerName]: !layers[layerName] };
    setLayers(newLayers);

    if (layerName === 'geological') {
      const visibility = newLayers.geological ? 'visible' : 'none';
      map.current.setLayoutProperty('geological-fill', 'visibility', visibility);
      map.current.setLayoutProperty('geological-outline', 'visibility', visibility);
    } else if (layerName === 'drillHoles') {
      const visibility = newLayers.drillHoles ? 'visible' : 'none';
      map.current.setLayoutProperty('drill-holes-points', 'visibility', visibility);
    } else if (layerName === 'topography') {
      const visibility = newLayers.topography ? 'visible' : 'none';
      map.current.setLayoutProperty('terrain', 'visibility', visibility);
    } else if (layerName === 'satellite') {
      const style = newLayers.satellite 
        ? 'mapbox://styles/mapbox/satellite-v9'
        : 'mapbox://styles/mapbox/streets-v11';
      map.current.setStyle(style);
    }
  };

  return (
    <Box sx={{ position: 'relative', height: '100%' }}>
      <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
      
      {/* Layer Controls */}
      <Paper 
        sx={{ 
          position: 'absolute', 
          top: 10, 
          left: 10, 
          p: 1, 
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Layers fontSize="small" />
          <Typography variant="caption" fontWeight="bold">Layers</Typography>
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

      {/* Zoom Controls */}
      <Paper 
        sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          p: 1, 
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.9)'
        }}
      >
        <Box display="flex" flexDirection="column" gap={0.5}>
          <Tooltip title="Zoom In">
            <IconButton 
              size="small" 
              onClick={() => map.current?.zoomIn()}
            >
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton 
              size="small" 
              onClick={() => map.current?.zoomOut()}
            >
              <Remove fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    </Box>
  );
};

export default Map2D; 