import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
} from 'recharts';

interface DrillSample {
  depth: number;
  grade: number;
  mineral: string;
  lithology: string;
  density?: number;
  porosity?: number;
  recovery?: number;
}

interface DrillHole {
  id: string;
  name: string;
  coordinates: [number, number];
  elevation: number;
  totalDepth: number;
  samples: DrillSample[];
  collar: {
    x: number;
    y: number;
    z: number;
    azimuth: number;
    dip: number;
  };
}

interface DrillHoleAnalyzerProps {
  drillHoles: DrillHole[];
  selectedHole?: string;
  onHoleSelect?: (holeId: string) => void;
  showCrossSection?: boolean;
  showGradeAnalysis?: boolean;
  showStatisticalAnalysis?: boolean;
  className?: string;
}

export const DrillHoleAnalyzer: React.FC<DrillHoleAnalyzerProps> = ({
  drillHoles,
  selectedHole,
  onHoleSelect,
  showCrossSection = true,
  showGradeAnalysis = true,
  showStatisticalAnalysis = true,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'cross-section' | 'grade-analysis' | 'statistics'>('cross-section');
  const [selectedMineral, setSelectedMineral] = useState<string>('all');

  const selectedHoleData = useMemo(() => {
    return drillHoles.find(hole => hole.id === selectedHole) || drillHoles[0];
  }, [drillHoles, selectedHole]);

  const minerals = useMemo(() => {
    const allMinerals = new Set<string>();
    drillHoles.forEach(hole => {
      hole.samples.forEach(sample => {
        allMinerals.add(sample.mineral);
      });
    });
    return Array.from(allMinerals);
  }, [drillHoles]);

  const filteredSamples = useMemo(() => {
    if (!selectedHoleData) return [];
    if (selectedMineral === 'all') return selectedHoleData.samples;
    return selectedHoleData.samples.filter(sample => sample.mineral === selectedMineral);
  }, [selectedHoleData, selectedMineral]);

  const gradeData = useMemo(() => {
    return filteredSamples.map(sample => ({
      depth: sample.depth,
      grade: sample.grade,
      mineral: sample.mineral,
      lithology: sample.lithology,
    }));
  }, [filteredSamples]);

  const statisticalData = useMemo(() => {
    const stats = minerals.map(mineral => {
      const mineralSamples = drillHoles.flatMap(hole => 
        hole.samples.filter(sample => sample.mineral === mineral)
      );
      
      const grades = mineralSamples.map(s => s.grade);
      const avgGrade = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
      const maxGrade = Math.max(...grades);
      const minGrade = Math.min(...grades);
      
      return {
        mineral,
        averageGrade: avgGrade,
        maxGrade,
        minGrade,
        sampleCount: grades.length,
      };
    });

    return stats;
  }, [drillHoles, minerals]);

  const crossSectionData = useMemo(() => {
    if (!selectedHoleData) return [];
    
    return selectedHoleData.samples.map(sample => ({
      depth: sample.depth,
      grade: sample.grade,
      lithology: sample.lithology,
      mineral: sample.mineral,
    }));
  }, [selectedHoleData]);

  const handleHoleSelect = (holeId: string) => {
    if (onHoleSelect) {
      onHoleSelect(holeId);
    }
  };

  if (!selectedHoleData) {
    return (
      <div className={`drill-hole-analyzer ${className}`}>
        <div className="no-data">
          <h3>No Drill Hole Data Available</h3>
          <p>Please select a drill hole to analyze.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`drill-hole-analyzer ${className}`}>
      {/* Drill Hole Selector */}
      <div className="hole-selector">
        <h3>Drill Hole Analysis</h3>
        <div className="hole-list">
          {drillHoles.map(hole => (
            <button
              key={hole.id}
              className={`hole-button ${hole.id === selectedHole ? 'active' : ''}`}
              onClick={() => handleHoleSelect(hole.id)}
            >
              <strong>{hole.name}</strong>
              <span>Depth: {hole.totalDepth}m</span>
              <span>Samples: {hole.samples.length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Hole Info */}
      <div className="hole-info">
        <h4>{selectedHoleData.name}</h4>
        <div className="info-grid">
          <div>
            <strong>Total Depth:</strong> {selectedHoleData.totalDepth}m
          </div>
          <div>
            <strong>Elevation:</strong> {selectedHoleData.elevation}m
          </div>
          <div>
            <strong>Azimuth:</strong> {selectedHoleData.collar.azimuth}°
          </div>
          <div>
            <strong>Dip:</strong> {selectedHoleData.collar.dip}°
          </div>
          <div>
            <strong>Coordinates:</strong> {selectedHoleData.coordinates[0].toFixed(6)}, {selectedHoleData.coordinates[1].toFixed(6)}
          </div>
        </div>
      </div>

      {/* Mineral Filter */}
      <div className="mineral-filter">
        <label htmlFor="mineral-select">Mineral:</label>
        <select
          id="mineral-select"
          value={selectedMineral}
          onChange={(e) => setSelectedMineral(e.target.value)}
        >
          <option value="all">All Minerals</option>
          {minerals.map(mineral => (
            <option key={mineral} value={mineral}>
              {mineral}
            </option>
          ))}
        </select>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'cross-section' ? 'active' : ''}`}
          onClick={() => setActiveTab('cross-section')}
        >
          Cross Section
        </button>
        <button
          className={`tab-button ${activeTab === 'grade-analysis' ? 'active' : ''}`}
          onClick={() => setActiveTab('grade-analysis')}
        >
          Grade Analysis
        </button>
        <button
          className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          Statistics
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'cross-section' && showCrossSection && (
          <div className="cross-section">
            <h4>Depth vs Grade Cross Section</h4>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={crossSectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="depth" 
                  label={{ value: 'Depth (m)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  label={{ value: 'Grade (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, name]}
                  labelFormatter={(label) => `Depth: ${label}m`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="grade" 
                  stroke="#1976d2" 
                  strokeWidth={2}
                  dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'grade-analysis' && showGradeAnalysis && (
          <div className="grade-analysis">
            <h4>Grade Distribution Analysis</h4>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart data={gradeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="depth" 
                  label={{ value: 'Depth (m)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  label={{ value: 'Grade (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value, name) => [`${value}%`, name]}
                  labelFormatter={(label) => `Depth: ${label}m`}
                />
                <Legend />
                <Scatter 
                  dataKey="grade" 
                  fill="#dc004e" 
                  stroke="#ffffff"
                  strokeWidth={1}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === 'statistics' && showStatisticalAnalysis && (
          <div className="statistics">
            <h4>Statistical Analysis</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={statisticalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mineral" />
                <YAxis label={{ value: 'Grade (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value}%`, 'Grade']} />
                <Legend />
                <Bar dataKey="averageGrade" fill="#1976d2" name="Average Grade" />
                <Bar dataKey="maxGrade" fill="#dc004e" name="Max Grade" />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="stats-table">
              <h5>Detailed Statistics</h5>
              <table>
                <thead>
                  <tr>
                    <th>Mineral</th>
                    <th>Avg Grade (%)</th>
                    <th>Max Grade (%)</th>
                    <th>Min Grade (%)</th>
                    <th>Samples</th>
                  </tr>
                </thead>
                <tbody>
                  {statisticalData.map(stat => (
                    <tr key={stat.mineral}>
                      <td>{stat.mineral}</td>
                      <td>{stat.averageGrade.toFixed(2)}</td>
                      <td>{stat.maxGrade.toFixed(2)}</td>
                      <td>{stat.minGrade.toFixed(2)}</td>
                      <td>{stat.sampleCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 