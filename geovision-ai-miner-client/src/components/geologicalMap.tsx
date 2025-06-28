import React, { useState, useEffect } from 'react';
import { designTokens } from '../styles/design-tokens';

interface GeologicalMapProps {
  data?: any;
  layers?: string[];
  onLayerToggle?: (layer: string) => void;
  onMapClick?: (coordinates: { lat: number; lng: number }) => void;
  className?: string;
}

export const GeologicalMap: React.FC<GeologicalMapProps> = ({
  data,
  layers = [],
  onLayerToggle,
  onMapClick,
  className = ''
}) => {
  const [activeLayers, setActiveLayers] = useState<string[]>(layers);

  const handleLayerToggle = (layer: string) => {
    const newLayers = activeLayers.includes(layer)
      ? activeLayers.filter(l => l !== layer)
      : [...activeLayers, layer];
    
    setActiveLayers(newLayers);
    onLayerToggle?.(layer);
  };

  return (
    <div 
      className={"geological-map " + className}
      style={{
        backgroundColor: designTokens.colors.geological.soil,
        padding: designTokens.spacing.md,
        borderRadius: '8px',
        minHeight: '400px'
      }}
    >
      <div className="map-controls" style={{ marginBottom: designTokens.spacing.md }}>
        <h3 style={{ 
          color: designTokens.colors.primary,
          fontSize: designTokens.typography.fontSizes.h3,
          marginBottom: designTokens.spacing.sm
        }}>
          Geological Map
        </h3>
        <div className="layer-controls">
          {['Rock Layers', 'Mineral Deposits', 'Soil Types', 'Water Bodies'].map(layer => (
            <label key={layer} style={{ display: 'block', marginBottom: designTokens.spacing.xs }}>
              <input
                type="checkbox"
                checked={activeLayers.includes(layer)}
                onChange={() => handleLayerToggle(layer)}
                style={{ marginRight: designTokens.spacing.xs }}
              />
              {layer}
            </label>
          ))}
        </div>
      </div>
      
      <div 
        className="map-container"
        style={{
          border: '2px solid ' + designTokens.colors.primary,
          borderRadius: '4px',
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5'
        }}
        onClick={() => onMapClick?.({ lat: 0, lng: 0 })}
      >
        <p style={{ color: designTokens.colors.secondary }}>
          Interactive Geological Map Component
        </p>
      </div>
    </div>
  );
};