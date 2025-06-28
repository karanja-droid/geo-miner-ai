import React from 'react';
import { designTokens } from '../styles/design-tokens';

interface DataMetric {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface DataDashboardProps {
  metrics?: DataMetric[];
  title?: string;
  className?: string;
}

export const DataDashboard: React.FC<DataDashboardProps> = ({
  metrics = [],
  title = 'Mining Data Dashboard',
  className = ''
}) => {
  const defaultMetrics: DataMetric[] = [
    { label: 'Ore Grade', value: '2.4', unit: '%', trend: 'up' },
    { label: 'Production Rate', value: '1,250', unit: 'tons/day', trend: 'stable' },
    { label: 'Recovery Rate', value: '87.5', unit: '%', trend: 'up' },
    { label: 'Operating Cost', value: '$45.20', unit: '/ton', trend: 'down' }
  ];

  const displayMetrics = metrics.length > 0 ? metrics : defaultMetrics;

  return (
    <div 
      className={"data-dashboard " + className}
      style={{
        backgroundColor: 'white',
        padding: designTokens.spacing.lg,
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <h2 style={{
        color: designTokens.colors.primary,
        fontSize: designTokens.typography.fontSizes.h2,
        marginBottom: designTokens.spacing.lg
      }}>
        {title}
      </h2>
      
      <div className="metrics-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: designTokens.spacing.md
      }}>
        {displayMetrics.map((metric, index) => (
          <div 
            key={index}
            className="metric-card"
            style={{
              padding: designTokens.spacing.md,
              border: '1px solid ' + designTokens.colors.geological.soil,
              borderRadius: '4px',
              textAlign: 'center'
            }}
          >
            <div className="metric-label" style={{
              fontSize: designTokens.typography.fontSizes.caption,
              color: designTokens.colors.secondary,
              marginBottom: designTokens.spacing.xs
            }}>
              {metric.label}
            </div>
            <div className="metric-value" style={{
              fontSize: designTokens.typography.fontSizes.h3,
              fontWeight: 'bold',
              color: designTokens.colors.primary
            }}>
              {metric.value}{metric.unit && <span style={{ fontSize: designTokens.typography.fontSizes.body }}> {metric.unit}</span>}
            </div>
            {metric.trend && (
              <div className="metric-trend" style={{
                fontSize: designTokens.typography.fontSizes.caption,
                color: metric.trend === 'up' ? designTokens.colors.success : 
                       metric.trend === 'down' ? designTokens.colors.error : 
                       designTokens.colors.warning
              }}>
                {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} {metric.trend}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};