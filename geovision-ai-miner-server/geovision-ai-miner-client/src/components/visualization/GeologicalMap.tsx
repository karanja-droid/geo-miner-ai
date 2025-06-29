import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import { MapIcon, LayersIcon, DownloadIcon } from '@heroicons/react/24/outline';

interface GeologicalMapProps {
  data?: any;
  title?: string;
}

const GeologicalMap: React.FC<GeologicalMapProps> = ({ 
  data, 
  title = "Geological Map" 
}) => {
  const [mapData, setMapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading geological data
    setTimeout(() => {
      setMapData({
        type: 'scattermapbox',
        lat: [40.7128, 40.7589, 40.7505, 40.7484],
        lon: [-74.0060, -73.9851, -73.9934, -73.9857],
        mode: 'markers',
        marker: {
          size: 12,
          color: ['red', 'blue', 'green', 'yellow'],
          opacity: 0.8
        },
        text: ['Sample Point 1', 'Sample Point 2', 'Sample Point 3', 'Sample Point 4'],
        hoverinfo: 'text'
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <Card title={title}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading geological data...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card title={title}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
            <LayersIcon className="w-4 h-4 mr-1" />
            Layers
          </button>
          <button className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            <DownloadIcon className="w-4 h-4 mr-1" />
            Export
          </button>
        </div>
      </div>
      
      <div className="bg-gray-100 rounded-lg p-4 h-96 flex items-center justify-center">
        <div className="text-center">
          <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Interactive geological map will be displayed here</p>
          <p className="text-sm text-gray-500 mt-2">
            Sample points: {mapData?.lat?.length || 0} locations
          </p>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-blue-900">Lithology</h4>
          <p className="text-sm text-blue-700">Granite, Basalt, Limestone</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <h4 className="font-medium text-green-900">Mineralization</h4>
          <p className="text-sm text-green-700">Copper, Gold, Silver</p>
        </div>
      </div>
    </Card>
  );
};

export default GeologicalMap; 