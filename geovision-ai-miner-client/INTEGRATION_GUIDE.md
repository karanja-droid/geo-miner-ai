# GeoVision AI Miner - Integration Guide

## Overview

This guide covers the integration of advanced geospatial components with the backend APIs for the GeoVision AI Miner platform. The system includes Photogrammetry, LiDAR, GIS mapping, Drill Hole analysis, and Offline functionality.

## Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [API Service Layer](#api-service-layer)
3. [Component Integration](#component-integration)
4. [Data Flow](#data-flow)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Setup & Configuration

### Environment Variables

Create a `.env` file in your frontend project root:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
```

### Dependencies

Ensure you have the required dependencies installed:

```bash
npm install axios three @types/three mapbox-gl recharts
```

## API Service Layer

The API service layer (`src/services/api.ts`) provides type-safe access to all backend endpoints.

### Authentication

The API service automatically handles authentication using JWT tokens:

```typescript
import { photogrammetryAPI } from '../services/api';

// Token is automatically included in requests
const data = await photogrammetryAPI.listByProject('project-id');
```

### Error Handling

The service includes automatic error handling:

```typescript
try {
  const result = await photogrammetryAPI.upload(file, metadata);
} catch (error) {
  if (error.response?.status === 401) {
    // Redirect to login
  }
  console.error('Upload failed:', error);
}
```

## Component Integration

### 1. Photogrammetry Viewer

```tsx
import React, { useState, useEffect } from 'react';
import { PhotogrammetryViewer } from './components/geospatial/PhotogrammetryViewer';
import { photogrammetryAPI } from '../services/api';

const PhotogrammetryPage = () => {
  const [photogrammetryData, setPhotogrammetryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await photogrammetryAPI.get('photogrammetry-id');
        setPhotogrammetryData(data);
      } catch (error) {
        console.error('Failed to load photogrammetry data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <PhotogrammetryViewer
      data={photogrammetryData}
      pointSize={2}
      showIntensity={true}
      autoRotate={false}
    />
  );
};
```

### 2. GIS Map

```tsx
import React, { useState, useEffect } from 'react';
import { GISMap } from './components/geospatial/GISMap';
import { gisAPI, drillHoleAPI } from '../services/api';

const GISPage = () => {
  const [layers, setLayers] = useState([]);
  const [drillHoles, setDrillHoles] = useState([]);
  const [geologicalFeatures, setGeologicalFeatures] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [layersData, drillHolesData] = await Promise.all([
        gisAPI.listByProject('project-id'),
        drillHoleAPI.listByProject('project-id'),
      ]);

      setLayers(layersData);
      setDrillHoles(drillHolesData);
    };

    loadData();
  }, []);

  const handleDrillHoleSelect = (drillHole) => {
    console.log('Selected drill hole:', drillHole);
  };

  const handleFeatureClick = (feature) => {
    console.log('Clicked feature:', feature);
  };

  return (
    <GISMap
      center={[-122.4194, 37.7749]}
      zoom={14}
      layers={layers}
      drillHoles={drillHoles}
      geologicalFeatures={geologicalFeatures}
      onDrillHoleSelect={handleDrillHoleSelect}
      onFeatureClick={handleFeatureClick}
      show3D={false}
    />
  );
};
```

### 3. LiDAR Viewer

```tsx
import React, { useState, useEffect } from 'react';
import { LiDARViewer } from './components/geospatial/LiDARViewer';
import { lidarAPI } from '../services/api';

const LiDARPage = () => {
  const [lidarData, setLidarData] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await lidarAPI.get('lidar-id');
      setLidarData(data);
    };

    loadData();
  }, []);

  return (
    <LiDARViewer
      data={lidarData}
      pointSize={1.5}
      showIntensity={true}
      autoRotate={false}
    />
  );
};
```

### 4. Drill Hole Analyzer

```tsx
import React, { useState, useEffect } from 'react';
import { DrillHoleAnalyzer } from './components/geospatial/DrillHoleAnalyzer';
import { drillHoleAPI } from '../services/api';

const DrillHolePage = () => {
  const [drillHoles, setDrillHoles] = useState([]);
  const [selectedHole, setSelectedHole] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await drillHoleAPI.listByProject('project-id');
      setDrillHoles(data);
      if (data.length > 0) {
        setSelectedHole(data[0].drillhole_id);
      }
    };

    loadData();
  }, []);

  const handleHoleSelect = (holeId) => {
    setSelectedHole(holeId);
  };

  return (
    <DrillHoleAnalyzer
      drillHoles={drillHoles}
      selectedHole={selectedHole}
      onHoleSelect={handleHoleSelect}
      showCrossSection={true}
      showGradeAnalysis={true}
      showStatisticalAnalysis={true}
    />
  );
};
```

### 5. Offline Manager

```tsx
import React, { useState, useEffect } from 'react';
import { OfflineManager } from './components/geospatial/OfflineManager';
import { offlineSyncAPI } from '../services/api';

const OfflinePage = () => {
  const [syncStatus, setSyncStatus] = useState(null);

  useEffect(() => {
    const loadStatus = async () => {
      const status = await offlineSyncAPI.getSyncStatus('project-id');
      setSyncStatus(status);
    };

    loadStatus();
  }, []);

  const handleSync = async (data) => {
    try {
      await offlineSyncAPI.createSync({
        user_id: 'current-user-id',
        project_id: 'project-id',
        data_type: 'drill-hole',
        data_id: 'data-id',
        operation: 'create',
        data_snapshot: data,
      });
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  const handleDataUpdate = (data) => {
    console.log('Data updated:', data);
  };

  return (
    <OfflineManager
      onSync={handleSync}
      onDataUpdate={handleDataUpdate}
      maxStorageSize={100}
    />
  );
};
```

## Data Flow

### Upload Flow

1. **File Upload**: User selects file in component
2. **API Call**: Component calls appropriate API service
3. **Backend Processing**: File is stored and metadata saved
4. **Response**: Component receives confirmation and updates UI

### Sync Flow

1. **Offline Changes**: User makes changes while offline
2. **Local Storage**: Changes stored in browser storage
3. **Sync Request**: When online, changes sent to backend
4. **Conflict Resolution**: Backend resolves conflicts if any
5. **Confirmation**: UI updated with sync status

### Real-time Updates

```tsx
// Example: Real-time drill hole updates
useEffect(() => {
  const interval = setInterval(async () => {
    const updatedData = await drillHoleAPI.listByProject('project-id');
    setDrillHoles(updatedData);
  }, 30000); // Update every 30 seconds

  return () => clearInterval(interval);
}, []);
```

## Best Practices

### 1. Error Handling

```tsx
const ComponentWithErrorHandling = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOperation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await apiCall();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div>
      {loading && <div>Loading...</div>}
      {/* Component content */}
    </div>
  );
};
```

### 2. Loading States

```tsx
const ComponentWithLoading = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await apiCall();
        setData(result);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return <div>{/* Component with data */}</div>;
};
```

### 3. Optimistic Updates

```tsx
const ComponentWithOptimisticUpdates = () => {
  const [data, setData] = useState([]);

  const handleAdd = async (newItem) => {
    // Optimistic update
    setData(prev => [...prev, newItem]);

    try {
      await apiCall(newItem);
    } catch (error) {
      // Revert on error
      setData(prev => prev.filter(item => item.id !== newItem.id));
      console.error('Failed to add item:', error);
    }
  };

  return <div>{/* Component */}</div>;
};
```

### 4. Data Caching

```tsx
const useCachedData = (key, fetchFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem(key);
    if (cached) {
      setData(JSON.parse(cached));
      setLoading(false);
    }

    const loadData = async () => {
      try {
        const result = await fetchFunction();
        setData(result);
        localStorage.setItem(key, JSON.stringify(result));
      } finally {
        setLoading(false);
      }
    };

    if (!cached) {
      loadData();
    }
  }, [key, fetchFunction]);

  return { data, loading };
};
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS settings include frontend domain
   - Check API URL configuration

2. **Authentication Issues**
   - Verify JWT token is valid
   - Check token expiration
   - Ensure proper login flow

3. **File Upload Failures**
   - Check file size limits
   - Verify file format support
   - Ensure proper multipart/form-data encoding

4. **Performance Issues**
   - Implement data pagination
   - Use virtual scrolling for large datasets
   - Optimize 3D rendering settings

### Debug Mode

Enable debug logging:

```typescript
// In your API service
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use(request => {
    console.log('API Request:', request);
    return request;
  });

  api.interceptors.response.use(response => {
    console.log('API Response:', response);
    return response;
  });
}
```

### Performance Monitoring

```tsx
const usePerformanceMonitor = (componentName) => {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      console.log(`${componentName} render time: ${endTime - startTime}ms`);
    };
  });
};
```

## Conclusion

This integration guide provides the foundation for using all geospatial components with the backend APIs. Follow the patterns and best practices outlined to ensure robust, performant, and maintainable code.

For additional support, refer to the Storybook documentation and API reference documentation. 