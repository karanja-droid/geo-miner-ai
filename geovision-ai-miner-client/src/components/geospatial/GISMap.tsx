import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface GISLayer {
  id: string;
  name: string;
  type: 'vector' | 'raster' | 'geojson';
  source: string;
  visible: boolean;
  opacity: number;
  color?: string;
  properties?: Record<string, any>;
}

interface DrillHoleData {
  id: string;
  coordinates: [number, number];
  depth: number;
  samples: Array<{
    depth: number;
    grade: number;
    mineral: string;
  }>;
}

interface GeologicalFeature {
  id: string;
  type: 'fault' | 'fold' | 'contact' | 'mineralization';
  geometry: GeoJSON.Geometry;
  properties: {
    name: string;
    description: string;
    confidence: number;
    age?: string;
  };
}

interface GISMapProps {
  center?: [number, number];
  zoom?: number;
  layers: GISLayer[];
  drillHoles?: DrillHoleData[];
  geologicalFeatures?: GeologicalFeature[];
  onFeatureClick?: (feature: any) => void;
  onDrillHoleSelect?: (drillHole: DrillHoleData) => void;
  show3D?: boolean;
  className?: string;
}

export const GISMap: React.FC<GISMapProps> = ({
  center = [-122.4194, 37.7749],
  zoom = 12,
  layers,
  drillHoles = [],
  geologicalFeatures = [],
  onFeatureClick,
  onDrillHoleSelect,
  show3D = false,
  className = '',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Mapbox
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN || 'your-mapbox-token';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center,
      zoom,
      pitch: show3D ? 45 : 0,
      bearing: 0,
    });

    map.current.on('load', () => {
      setIsLoading(false);
      addLayers();
      addDrillHoles();
      addGeologicalFeatures();
    });

    map.current.on('error', (e) => {
      setError('Failed to load map');
      setIsLoading(false);
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Add layer control
    const layerControl = createLayerControl();
    map.current.addControl(layerControl, 'top-left');

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const addLayers = () => {
    if (!map.current) return;

    layers.forEach((layer) => {
      if (layer.type === 'geojson') {
        map.current!.addSource(layer.id, {
          type: 'geojson',
          data: layer.source,
        });

        map.current!.addLayer({
          id: layer.id,
          type: 'fill',
          source: layer.id,
          paint: {
            'fill-color': layer.color || '#1976d2',
            'fill-opacity': layer.opacity,
            'fill-outline-color': '#000000',
          },
          layout: {
            visibility: layer.visible ? 'visible' : 'none',
          },
        });
      }
    });
  };

  const addDrillHoles = () => {
    if (!map.current || drillHoles.length === 0) return;

    // Add drill hole source
    map.current.addSource('drill-holes', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: drillHoles.map((hole) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: hole.coordinates,
          },
          properties: {
            id: hole.id,
            depth: hole.depth,
            samples: hole.samples,
          },
        })),
      },
    });

    // Add drill hole layer
    map.current.addLayer({
      id: 'drill-holes',
      type: 'circle',
      source: 'drill-holes',
      paint: {
        'circle-radius': 8,
        'circle-color': '#dc004e',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
      },
    });

    // Add click handler
    map.current.on('click', 'drill-holes', (e) => {
      if (e.features && e.features[0]) {
        const feature = e.features[0];
        const drillHole = drillHoles.find(h => h.id === feature.properties?.id);
        if (drillHole && onDrillHoleSelect) {
          onDrillHoleSelect(drillHole);
        }
      }
    });
  };

  const addGeologicalFeatures = () => {
    if (!map.current || geologicalFeatures.length === 0) return;

    // Add geological features source
    map.current.addSource('geological-features', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: geologicalFeatures.map((feature) => ({
          type: 'Feature',
          geometry: feature.geometry,
          properties: {
            id: feature.id,
            type: feature.type,
            name: feature.properties.name,
            description: feature.properties.description,
            confidence: feature.properties.confidence,
            age: feature.properties.age,
          },
        })),
      },
    });

    // Add fault lines
    map.current.addLayer({
      id: 'faults',
      type: 'line',
      source: 'geological-features',
      filter: ['==', ['get', 'type'], 'fault'],
      paint: {
        'line-color': '#ff4444',
        'line-width': 3,
        'line-dasharray': [2, 2],
      },
    });

    // Add folds
    map.current.addLayer({
      id: 'folds',
      type: 'line',
      source: 'geological-features',
      filter: ['==', ['get', 'type'], 'fold'],
      paint: {
        'line-color': '#44ff44',
        'line-width': 2,
      },
    });

    // Add contacts
    map.current.addLayer({
      id: 'contacts',
      type: 'line',
      source: 'geological-features',
      filter: ['==', ['get', 'type'], 'contact'],
      paint: {
        'line-color': '#4444ff',
        'line-width': 1,
      },
    });

    // Add click handler
    map.current.on('click', (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, {
        layers: ['faults', 'folds', 'contacts'],
      });

      if (features.length > 0 && onFeatureClick) {
        onFeatureClick(features[0]);
      }
    });
  };

  const createLayerControl = () => {
    const container = document.createElement('div');
    container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group layer-control';
    container.style.background = '#16213e';
    container.style.color = '#ffffff';
    container.style.padding = '10px';
    container.style.minWidth = '200px';

    const title = document.createElement('h4');
    title.textContent = 'Layers';
    title.style.margin = '0 0 10px 0';
    container.appendChild(title);

    layers.forEach((layer) => {
      const layerItem = document.createElement('div');
      layerItem.style.marginBottom = '5px';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = layer.visible;
      checkbox.onchange = () => {
        if (map.current) {
          const visibility = checkbox.checked ? 'visible' : 'none';
          map.current.setLayoutProperty(layer.id, 'visibility', visibility);
        }
      };

      const label = document.createElement('label');
      label.textContent = layer.name;
      label.style.marginLeft = '5px';

      layerItem.appendChild(checkbox);
      layerItem.appendChild(label);
      container.appendChild(layerItem);
    });

    return {
      onAdd: () => container,
      onRemove: () => container.remove(),
    };
  };

  if (error) {
    return (
      <div className={`gis-map error ${className}`}>
        <div className="error-message">
          <h3>Error Loading Map</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`gis-map ${className}`}>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading GIS map...</p>
        </div>
      )}
      <div ref={mapContainer} className="map-container" />
      <div className="map-info">
        <h4>GIS Data</h4>
        <p><strong>Layers:</strong> {layers.length}</p>
        <p><strong>Drill Holes:</strong> {drillHoles.length}</p>
        <p><strong>Geological Features:</strong> {geologicalFeatures.length}</p>
      </div>
    </div>
  );
}; 