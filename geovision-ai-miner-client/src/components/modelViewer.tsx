import React, { useState } from 'react';
import { designTokens } from '../styles/design-tokens';

interface ModelViewerProps {
  modelUrl?: string;
  onModelLoad?: () => void;
  onModelError?: (error: string) => void;
  className?: string;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({
  modelUrl,
  onModelLoad,
  onModelError,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  const handleModelLoad = () => {
    setIsLoading(false);
    onModelLoad?.();
  };

  const handleModelError = (error: string) => {
    setIsLoading(false);
    onModelError?.(error);
  };

  return (
    <div 
      className={"model-viewer " + className}
      style={{
        backgroundColor: '#1a1a1a',
        padding: designTokens.spacing.md,
        borderRadius: '8px',
        color: 'white'
      }}
    >
      <div className="viewer-controls" style={{ marginBottom: designTokens.spacing.md }}>
        <h3 style={{
          color: designTokens.colors.geological.mineral,
          fontSize: designTokens.typography.fontSizes.h3,
          marginBottom: designTokens.spacing.sm
        }}>
          3D Geological Model Viewer
        </h3>
        
        <div className="control-buttons" style={{ display: 'flex', gap: designTokens.spacing.sm }}>
          <button
            onClick={() => setViewMode('3d')}
            style={{
              backgroundColor: viewMode === '3d' ? designTokens.colors.primary : 'transparent',
              color: 'white',
              border: '1px solid ' + designTokens.colors.primary,
              padding: designTokens.spacing.xs + ' ' + designTokens.spacing.sm,
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            3D View
          </button>
          <button
            onClick={() => setViewMode('2d')}
            style={{
              backgroundColor: viewMode === '2d' ? designTokens.colors.primary : 'transparent',
              color: 'white',
              border: '1px solid ' + designTokens.colors.primary,
              padding: designTokens.spacing.xs + ' ' + designTokens.spacing.sm,
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            2D View
          </button>
        </div>
      </div>
      
      <div 
        className="model-container"
        style={{
          border: '2px solid ' + designTokens.colors.geological.mineral,
          borderRadius: '4px',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#2a2a2a',
          position: 'relative'
        }}
      >
        {isLoading ? (
          <div style={{ color: designTokens.colors.geological.mineral }}>
            Loading 3D Model...
          </div>
        ) : (
          <div style={{ 
            color: designTokens.colors.geological.mineral,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: designTokens.typography.fontSizes.h2, marginBottom: designTokens.spacing.sm }}>
              {viewMode.toUpperCase()} View
            </div>
            <p>Interactive Geological Model Component</p>
            {modelUrl && (
              <p style={{ fontSize: designTokens.typography.fontSizes.caption, marginTop: designTokens.spacing.sm }}>
                Model: {modelUrl}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};