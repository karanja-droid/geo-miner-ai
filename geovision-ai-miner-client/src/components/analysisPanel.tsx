import React, { useState } from 'react';
import { designTokens } from '../styles/design-tokens';

interface AnalysisResult {
  id: string;
  type: string;
  value: string;
  confidence: number;
  timestamp: string;
}

interface AnalysisPanelProps {
  results?: AnalysisResult[];
  onAnalysisStart?: () => void;
  onResultSelect?: (result: AnalysisResult) => void;
  className?: string;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  results = [],
  onAnalysisStart,
  onResultSelect,
  className = ''
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const defaultResults: AnalysisResult[] = [
    {
      id: '1',
      type: 'Mineral Composition',
      value: 'Quartz: 45%, Feldspar: 30%, Mica: 25%',
      confidence: 0.92,
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      type: 'Structural Analysis',
      value: 'Fault line detected at 45° angle',
      confidence: 0.87,
      timestamp: new Date().toISOString()
    }
  ];

  const displayResults = results.length > 0 ? results : defaultResults;

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    onAnalysisStart?.();
    // Simulate analysis completion
    setTimeout(() => setIsAnalyzing(false), 3000);
  };

  return (
    <div 
      className={"analysis-panel " + className}
      style={{
        backgroundColor: 'white',
        padding: designTokens.spacing.lg,
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <h3 style={{
        color: designTokens.colors.primary,
        fontSize: designTokens.typography.fontSizes.h3,
        marginBottom: designTokens.spacing.md
      }}>
        Geological Analysis Tools
      </h3>
      
      <button
        onClick={handleAnalysisStart}
        disabled={isAnalyzing}
        style={{
          backgroundColor: isAnalyzing ? designTokens.colors.warning : designTokens.colors.primary,
          color: 'white',
          border: 'none',
          padding: designTokens.spacing.sm + ' ' + designTokens.spacing.md,
          borderRadius: '4px',
          cursor: isAnalyzing ? 'not-allowed' : 'pointer',
          marginBottom: designTokens.spacing.lg
        }}
      >
        {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
      </button>
      
      <div className="analysis-results">
        <h4 style={{
          color: designTokens.colors.secondary,
          fontSize: designTokens.typography.fontSizes.body,
          marginBottom: designTokens.spacing.sm
        }}>
          Analysis Results
        </h4>
        
        {displayResults.map((result) => (
          <div 
            key={result.id}
            className="result-item"
            onClick={() => onResultSelect?.(result)}
            style={{
              padding: designTokens.spacing.md,
              border: '1px solid ' + designTokens.colors.geological.soil,
              borderRadius: '4px',
              marginBottom: designTokens.spacing.sm,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: designTokens.spacing.xs
            }}>
              <strong style={{ color: designTokens.colors.primary }}>
                {result.type}
              </strong>
              <span style={{
                color: designTokens.colors.success,
                fontSize: designTokens.typography.fontSizes.caption
              }}>
                {(result.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
            <p style={{ margin: 0, color: designTokens.colors.secondary }}>
              {result.value}
            </p>
            <small style={{ color: designTokens.colors.geological.rock }}>
              {new Date(result.timestamp).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};