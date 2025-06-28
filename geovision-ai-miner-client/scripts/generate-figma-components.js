#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Component templates for geological UI components
const componentTemplates = {
  geologicalMap: 
    'import React, { useState, useEffect } from \'react\';\n' +
    'import { designTokens } from \'../styles/design-tokens\';\n\n' +
    'interface GeologicalMapProps {\n' +
    '  data?: any;\n' +
    '  layers?: string[];\n' +
    '  onLayerToggle?: (layer: string) => void;\n' +
    '  onMapClick?: (coordinates: { lat: number; lng: number }) => void;\n' +
    '  className?: string;\n' +
    '}\n\n' +
    'export const GeologicalMap: React.FC<GeologicalMapProps> = ({\n' +
    '  data,\n' +
    '  layers = [],\n' +
    '  onLayerToggle,\n' +
    '  onMapClick,\n' +
    '  className = \'\'\n' +
    '}) => {\n' +
    '  const [activeLayers, setActiveLayers] = useState<string[]>(layers);\n\n' +
    '  const handleLayerToggle = (layer: string) => {\n' +
    '    const newLayers = activeLayers.includes(layer)\n' +
    '      ? activeLayers.filter(l => l !== layer)\n' +
    '      : [...activeLayers, layer];\n' +
    '    \n' +
    '    setActiveLayers(newLayers);\n' +
    '    onLayerToggle?.(layer);\n' +
    '  };\n\n' +
    '  return (\n' +
    '    <div \n' +
    '      className={"geological-map " + className}\n' +
    '      style={{\n' +
    '        backgroundColor: designTokens.colors.geological.soil,\n' +
    '        padding: designTokens.spacing.md,\n' +
    '        borderRadius: \'8px\',\n' +
    '        minHeight: \'400px\'\n' +
    '      }}\n' +
    '    >\n' +
    '      <div className="map-controls" style={{ marginBottom: designTokens.spacing.md }}>\n' +
    '        <h3 style={{ \n' +
    '          color: designTokens.colors.primary,\n' +
    '          fontSize: designTokens.typography.fontSizes.h3,\n' +
    '          marginBottom: designTokens.spacing.sm\n' +
    '        }}>\n' +
    '          Geological Map\n' +
    '        </h3>\n' +
    '        <div className="layer-controls">\n' +
    '          {[\'Rock Layers\', \'Mineral Deposits\', \'Soil Types\', \'Water Bodies\'].map(layer => (\n' +
    '            <label key={layer} style={{ display: \'block\', marginBottom: designTokens.spacing.xs }}>\n' +
    '              <input\n' +
    '                type="checkbox"\n' +
    '                checked={activeLayers.includes(layer)}\n' +
    '                onChange={() => handleLayerToggle(layer)}\n' +
    '                style={{ marginRight: designTokens.spacing.xs }}\n' +
    '              />\n' +
    '              {layer}\n' +
    '            </label>\n' +
    '          ))}\n' +
    '        </div>\n' +
    '      </div>\n' +
    '      \n' +
    '      <div \n' +
    '        className="map-container"\n' +
    '        style={{\n' +
    '          border: \'2px solid \' + designTokens.colors.primary,\n' +
    '          borderRadius: \'4px\',\n' +
    '          height: \'300px\',\n' +
    '          display: \'flex\',\n' +
    '          alignItems: \'center\',\n' +
    '          justifyContent: \'center\',\n' +
    '          backgroundColor: \'#f5f5f5\'\n' +
    '        }}\n' +
    '        onClick={() => onMapClick?.({ lat: 0, lng: 0 })}\n' +
    '      >\n' +
    '        <p style={{ color: designTokens.colors.secondary }}>\n' +
    '          Interactive Geological Map Component\n' +
    '        </p>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  );\n' +
    '};',

  dataDashboard: 
    'import React from \'react\';\n' +
    'import { designTokens } from \'../styles/design-tokens\';\n\n' +
    'interface DataMetric {\n' +
    '  label: string;\n' +
    '  value: string | number;\n' +
    '  unit?: string;\n' +
    '  trend?: \'up\' | \'down\' | \'stable\';\n' +
    '}\n\n' +
    'interface DataDashboardProps {\n' +
    '  metrics?: DataMetric[];\n' +
    '  title?: string;\n' +
    '  className?: string;\n' +
    '}\n\n' +
    'export const DataDashboard: React.FC<DataDashboardProps> = ({\n' +
    '  metrics = [],\n' +
    '  title = \'Mining Data Dashboard\',\n' +
    '  className = \'\'\n' +
    '}) => {\n' +
    '  const defaultMetrics: DataMetric[] = [\n' +
    '    { label: \'Ore Grade\', value: \'2.4\', unit: \'%\', trend: \'up\' },\n' +
    '    { label: \'Production Rate\', value: \'1,250\', unit: \'tons/day\', trend: \'stable\' },\n' +
    '    { label: \'Recovery Rate\', value: \'87.5\', unit: \'%\', trend: \'up\' },\n' +
    '    { label: \'Operating Cost\', value: \'$45.20\', unit: \'/ton\', trend: \'down\' }\n' +
    '  ];\n\n' +
    '  const displayMetrics = metrics.length > 0 ? metrics : defaultMetrics;\n\n' +
    '  return (\n' +
    '    <div \n' +
    '      className={"data-dashboard " + className}\n' +
    '      style={{\n' +
    '        backgroundColor: \'white\',\n' +
    '        padding: designTokens.spacing.lg,\n' +
    '        borderRadius: \'8px\',\n' +
    '        boxShadow: \'0 2px 8px rgba(0,0,0,0.1)\'\n' +
    '      }}\n' +
    '    >\n' +
    '      <h2 style={{\n' +
    '        color: designTokens.colors.primary,\n' +
    '        fontSize: designTokens.typography.fontSizes.h2,\n' +
    '        marginBottom: designTokens.spacing.lg\n' +
    '      }}>\n' +
    '        {title}\n' +
    '      </h2>\n' +
    '      \n' +
    '      <div className="metrics-grid" style={{\n' +
    '        display: \'grid\',\n' +
    '        gridTemplateColumns: \'repeat(auto-fit, minmax(200px, 1fr))\',\n' +
    '        gap: designTokens.spacing.md\n' +
    '      }}>\n' +
    '        {displayMetrics.map((metric, index) => (\n' +
    '          <div \n' +
    '            key={index}\n' +
    '            className="metric-card"\n' +
    '            style={{\n' +
    '              padding: designTokens.spacing.md,\n' +
    '              border: \'1px solid \' + designTokens.colors.geological.soil,\n' +
    '              borderRadius: \'4px\',\n' +
    '              textAlign: \'center\'\n' +
    '            }}\n' +
    '          >\n' +
    '            <div className="metric-label" style={{\n' +
    '              fontSize: designTokens.typography.fontSizes.caption,\n' +
    '              color: designTokens.colors.secondary,\n' +
    '              marginBottom: designTokens.spacing.xs\n' +
    '            }}>\n' +
    '              {metric.label}\n' +
    '            </div>\n' +
    '            <div className="metric-value" style={{\n' +
    '              fontSize: designTokens.typography.fontSizes.h3,\n' +
    '              fontWeight: \'bold\',\n' +
    '              color: designTokens.colors.primary\n' +
    '            }}>\n' +
    '              {metric.value}{metric.unit && <span style={{ fontSize: designTokens.typography.fontSizes.body }}> {metric.unit}</span>}\n' +
    '            </div>\n' +
    '            {metric.trend && (\n' +
    '              <div className="metric-trend" style={{\n' +
    '                fontSize: designTokens.typography.fontSizes.caption,\n' +
    '                color: metric.trend === \'up\' ? designTokens.colors.success : \n' +
    '                       metric.trend === \'down\' ? designTokens.colors.error : \n' +
    '                       designTokens.colors.warning\n' +
    '              }}>\n' +
    '                {metric.trend === \'up\' ? \'↗\' : metric.trend === \'down\' ? \'↘\' : \'→\'} {metric.trend}\n' +
    '              </div>\n' +
    '            )}\n' +
    '          </div>\n' +
    '        ))}\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  );\n' +
    '};',

  modelViewer: 
    'import React, { useState } from \'react\';\n' +
    'import { designTokens } from \'../styles/design-tokens\';\n\n' +
    'interface ModelViewerProps {\n' +
    '  modelUrl?: string;\n' +
    '  onModelLoad?: () => void;\n' +
    '  onModelError?: (error: string) => void;\n' +
    '  className?: string;\n' +
    '}\n\n' +
    'export const ModelViewer: React.FC<ModelViewerProps> = ({\n' +
    '  modelUrl,\n' +
    '  onModelLoad,\n' +
    '  onModelError,\n' +
    '  className = \'\'\n' +
    '}) => {\n' +
    '  const [isLoading, setIsLoading] = useState(false);\n' +
    '  const [viewMode, setViewMode] = useState<\'3d\' | \'2d\'>(\'3d\');\n\n' +
    '  const handleModelLoad = () => {\n' +
    '    setIsLoading(false);\n' +
    '    onModelLoad?.();\n' +
    '  };\n\n' +
    '  const handleModelError = (error: string) => {\n' +
    '    setIsLoading(false);\n' +
    '    onModelError?.(error);\n' +
    '  };\n\n' +
    '  return (\n' +
    '    <div \n' +
    '      className={"model-viewer " + className}\n' +
    '      style={{\n' +
    '        backgroundColor: \'#1a1a1a\',\n' +
    '        padding: designTokens.spacing.md,\n' +
    '        borderRadius: \'8px\',\n' +
    '        color: \'white\'\n' +
    '      }}\n' +
    '    >\n' +
    '      <div className="viewer-controls" style={{ marginBottom: designTokens.spacing.md }}>\n' +
    '        <h3 style={{\n' +
    '          color: designTokens.colors.geological.mineral,\n' +
    '          fontSize: designTokens.typography.fontSizes.h3,\n' +
    '          marginBottom: designTokens.spacing.sm\n' +
    '        }}>\n' +
    '          3D Geological Model Viewer\n' +
    '        </h3>\n' +
    '        \n' +
    '        <div className="control-buttons" style={{ display: \'flex\', gap: designTokens.spacing.sm }}>\n' +
    '          <button\n' +
    '            onClick={() => setViewMode(\'3d\')}\n' +
    '            style={{\n' +
    '              backgroundColor: viewMode === \'3d\' ? designTokens.colors.primary : \'transparent\',\n' +
    '              color: \'white\',\n' +
    '              border: \'1px solid \' + designTokens.colors.primary,\n' +
    '              padding: designTokens.spacing.xs + \' \' + designTokens.spacing.sm,\n' +
    '              borderRadius: \'4px\',\n' +
    '              cursor: \'pointer\'\n' +
    '            }}\n' +
    '          >\n' +
    '            3D View\n' +
    '          </button>\n' +
    '          <button\n' +
    '            onClick={() => setViewMode(\'2d\')}\n' +
    '            style={{\n' +
    '              backgroundColor: viewMode === \'2d\' ? designTokens.colors.primary : \'transparent\',\n' +
    '              color: \'white\',\n' +
    '              border: \'1px solid \' + designTokens.colors.primary,\n' +
    '              padding: designTokens.spacing.xs + \' \' + designTokens.spacing.sm,\n' +
    '              borderRadius: \'4px\',\n' +
    '              cursor: \'pointer\'\n' +
    '            }}\n' +
    '          >\n' +
    '            2D View\n' +
    '          </button>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '      \n' +
    '      <div \n' +
    '        className="model-container"\n' +
    '        style={{\n' +
    '          border: \'2px solid \' + designTokens.colors.geological.mineral,\n' +
    '          borderRadius: \'4px\',\n' +
    '          height: \'400px\',\n' +
    '          display: \'flex\',\n' +
    '          alignItems: \'center\',\n' +
    '          justifyContent: \'center\',\n' +
    '          backgroundColor: \'#2a2a2a\',\n' +
    '          position: \'relative\'\n' +
    '        }}\n' +
    '      >\n' +
    '        {isLoading ? (\n' +
    '          <div style={{ color: designTokens.colors.geological.mineral }}>\n' +
    '            Loading 3D Model...\n' +
    '          </div>\n' +
    '        ) : (\n' +
    '          <div style={{ \n' +
    '            color: designTokens.colors.geological.mineral,\n' +
    '            textAlign: \'center\'\n' +
    '          }}>\n' +
    '            <div style={{ fontSize: designTokens.typography.fontSizes.h2, marginBottom: designTokens.spacing.sm }}>\n' +
    '              {viewMode.toUpperCase()} View\n' +
    '            </div>\n' +
    '            <p>Interactive Geological Model Component</p>\n' +
    '            {modelUrl && (\n' +
    '              <p style={{ fontSize: designTokens.typography.fontSizes.caption, marginTop: designTokens.spacing.sm }}>\n' +
    '                Model: {modelUrl}\n' +
    '              </p>\n' +
    '            )}\n' +
    '          </div>\n' +
    '        )}\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  );\n' +
    '};',

  analysisPanel: 
    'import React, { useState } from \'react\';\n' +
    'import { designTokens } from \'../styles/design-tokens\';\n\n' +
    'interface AnalysisResult {\n' +
    '  id: string;\n' +
    '  type: string;\n' +
    '  value: string;\n' +
    '  confidence: number;\n' +
    '  timestamp: string;\n' +
    '}\n\n' +
    'interface AnalysisPanelProps {\n' +
    '  results?: AnalysisResult[];\n' +
    '  onAnalysisStart?: () => void;\n' +
    '  onResultSelect?: (result: AnalysisResult) => void;\n' +
    '  className?: string;\n' +
    '}\n\n' +
    'export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({\n' +
    '  results = [],\n' +
    '  onAnalysisStart,\n' +
    '  onResultSelect,\n' +
    '  className = \'\'\n' +
    '}) => {\n' +
    '  const [isAnalyzing, setIsAnalyzing] = useState(false);\n\n' +
    '  const defaultResults: AnalysisResult[] = [\n' +
    '    {\n' +
    '      id: \'1\',\n' +
    '      type: \'Mineral Composition\',\n' +
    '      value: \'Quartz: 45%, Feldspar: 30%, Mica: 25%\',\n' +
    '      confidence: 0.92,\n' +
    '      timestamp: new Date().toISOString()\n' +
    '    },\n' +
    '    {\n' +
    '      id: \'2\',\n' +
    '      type: \'Structural Analysis\',\n' +
    '      value: \'Fault line detected at 45° angle\',\n' +
    '      confidence: 0.87,\n' +
    '      timestamp: new Date().toISOString()\n' +
    '    }\n' +
    '  ];\n\n' +
    '  const displayResults = results.length > 0 ? results : defaultResults;\n\n' +
    '  const handleAnalysisStart = () => {\n' +
    '    setIsAnalyzing(true);\n' +
    '    onAnalysisStart?.();\n' +
    '    // Simulate analysis completion\n' +
    '    setTimeout(() => setIsAnalyzing(false), 3000);\n' +
    '  };\n\n' +
    '  return (\n' +
    '    <div \n' +
    '      className={"analysis-panel " + className}\n' +
    '      style={{\n' +
    '        backgroundColor: \'white\',\n' +
    '        padding: designTokens.spacing.lg,\n' +
    '        borderRadius: \'8px\',\n' +
    '        boxShadow: \'0 2px 8px rgba(0,0,0,0.1)\'\n' +
    '      }}\n' +
    '    >\n' +
    '      <h3 style={{\n' +
    '        color: designTokens.colors.primary,\n' +
    '        fontSize: designTokens.typography.fontSizes.h3,\n' +
    '        marginBottom: designTokens.spacing.md\n' +
    '      }}>\n' +
    '        Geological Analysis Tools\n' +
    '      </h3>\n' +
    '      \n' +
    '      <button\n' +
    '        onClick={handleAnalysisStart}\n' +
    '        disabled={isAnalyzing}\n' +
    '        style={{\n' +
    '          backgroundColor: isAnalyzing ? designTokens.colors.warning : designTokens.colors.primary,\n' +
    '          color: \'white\',\n' +
    '          border: \'none\',\n' +
    '          padding: designTokens.spacing.sm + \' \' + designTokens.spacing.md,\n' +
    '          borderRadius: \'4px\',\n' +
    '          cursor: isAnalyzing ? \'not-allowed\' : \'pointer\',\n' +
    '          marginBottom: designTokens.spacing.lg\n' +
    '        }}\n' +
    '      >\n' +
    '        {isAnalyzing ? \'Analyzing...\' : \'Start Analysis\'}\n' +
    '      </button>\n' +
    '      \n' +
    '      <div className="analysis-results">\n' +
    '        <h4 style={{\n' +
    '          color: designTokens.colors.secondary,\n' +
    '          fontSize: designTokens.typography.fontSizes.body,\n' +
    '          marginBottom: designTokens.spacing.sm\n' +
    '        }}>\n' +
    '          Analysis Results\n' +
    '        </h4>\n' +
    '        \n' +
    '        {displayResults.map((result) => (\n' +
    '          <div \n' +
    '            key={result.id}\n' +
    '            className="result-item"\n' +
    '            onClick={() => onResultSelect?.(result)}\n' +
    '            style={{\n' +
    '              padding: designTokens.spacing.md,\n' +
    '              border: \'1px solid \' + designTokens.colors.geological.soil,\n' +
    '              borderRadius: \'4px\',\n' +
    '              marginBottom: designTokens.spacing.sm,\n' +
    '              cursor: \'pointer\',\n' +
    '              transition: \'background-color 0.2s\'\n' +
    '            }}\n' +
    '            onMouseEnter={(e) => {\n' +
    '              e.currentTarget.style.backgroundColor = \'#f5f5f5\';\n' +
    '            }}\n' +
    '            onMouseLeave={(e) => {\n' +
    '              e.currentTarget.style.backgroundColor = \'white\';\n' +
    '            }}\n' +
    '          >\n' +
    '            <div style={{\n' +
    '              display: \'flex\',\n' +
    '              justifyContent: \'space-between\',\n' +
    '              alignItems: \'center\',\n' +
    '              marginBottom: designTokens.spacing.xs\n' +
    '            }}>\n' +
    '              <strong style={{ color: designTokens.colors.primary }}>\n' +
    '                {result.type}\n' +
    '              </strong>\n' +
    '              <span style={{\n' +
    '                color: designTokens.colors.success,\n' +
    '                fontSize: designTokens.typography.fontSizes.caption\n' +
    '              }}>\n' +
    '                {(result.confidence * 100).toFixed(0)}% confidence\n' +
    '              </span>\n' +
    '            </div>\n' +
    '            <p style={{ margin: 0, color: designTokens.colors.secondary }}>\n' +
    '              {result.value}\n' +
    '            </p>\n' +
    '            <small style={{ color: designTokens.colors.geological.rock }}>\n' +
    '              {new Date(result.timestamp).toLocaleString()}\n' +
    '            </small>\n' +
    '          </div>\n' +
    '        ))}\n' +
    '      </div>\n' +
    '    </div>\n' +
    '  );\n' +
    '};'
};

// Generate components from templates
function generateComponents() {
  console.log('🎨 Generating React components from Figma templates...');
  
  const componentsDir = path.join(__dirname, '..', 'src', 'components');
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }
  
  Object.entries(componentTemplates).forEach(([componentName, template]) => {
    const fileName = componentName.charAt(0).toLowerCase() + componentName.slice(1) + '.tsx';
    const filePath = path.join(componentsDir, fileName);
    
    fs.writeFileSync(filePath, template.trim());
    console.log('  ✅ Generated: src/components/' + fileName);
  });
  
  // Create index file
  const indexContent = Object.keys(componentTemplates)
    .map(name => 'export { ' + name + ' } from \'./' + name.charAt(0).toLowerCase() + name.slice(1) + '\';')
    .join('\n');
  
  fs.writeFileSync(path.join(componentsDir, 'index.ts'), indexContent);
  console.log('  ✅ Generated: src/components/index.ts');
}

// Main execution
if (require.main === module) {
  generateComponents();
  console.log('\n🎉 All components generated successfully!');
  console.log('📝 Next steps:');
  console.log('  1. Update figma-config.json with your actual Figma file ID and access token');
  console.log('  2. Run the design tokens generator: npm run generate-tokens');
  console.log('  3. Import and use the components in your React app');
}

module.exports = { generateComponents }; 