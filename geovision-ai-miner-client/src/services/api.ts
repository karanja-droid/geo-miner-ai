import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface PhotogrammetryData {
  photogrammetry_id: string;
  project_id: string;
  name: string;
  description?: string;
  file_type: string;
  file_url: string;
  metadata?: any;
  upload_date?: string;
  uploader_id: string;
}

export interface LiDARData {
  lidar_id: string;
  project_id: string;
  name: string;
  description?: string;
  file_type: string;
  file_url: string;
  metadata?: any;
  upload_date?: string;
  uploader_id: string;
}

export interface GISLayer {
  layer_id: string;
  project_id: string;
  name: string;
  description?: string;
  layer_type: string;
  data_source: string;
  metadata?: any;
  visible: boolean;
  opacity: number;
  upload_date?: string;
  uploader_id: string;
}

export interface DrillHole {
  drillhole_id: string;
  project_id: string;
  collar_geom: any;
  elevation?: number;
  drilling_date?: string;
  driller?: string;
  status?: string;
}

export interface DrillInterval {
  interval_id: string;
  drillhole_id: string;
  from_depth: number;
  to_depth: number;
  lithology?: string;
  azm?: number;
  dip?: number;
}

export interface Assay {
  assay_id: string;
  interval_id: string;
  element: string;
  value: number;
  unit: string;
  qc_flag?: string;
}

export interface OfflineSync {
  sync_id: string;
  user_id: string;
  project_id: string;
  data_type: string;
  data_id: string;
  operation: string;
  data_snapshot?: any;
  status: string;
  conflict_resolution?: any;
  created_at?: string;
  synced_at?: string;
}

export interface SyncStatus {
  is_online: boolean;
  last_sync?: string;
  pending_items: number;
  total_size: number;
  sync_progress: number;
}

// Photogrammetry API
export const photogrammetryAPI = {
  upload: async (file: File, data: {
    name: string;
    fileType: string;
    description?: string;
    projectId: string;
    metadata?: any;
  }): Promise<PhotogrammetryData> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', data.name);
    formData.append('fileType', data.fileType);
    if (data.description) formData.append('description', data.description);
    formData.append('projectId', data.projectId);
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));

    const response = await api.post('/data/photogrammetry/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  get: async (photogrammetryId: string): Promise<PhotogrammetryData> => {
    const response = await api.get(`/data/photogrammetry/${photogrammetryId}`);
    return response.data;
  },

  listByProject: async (projectId: string): Promise<PhotogrammetryData[]> => {
    const response = await api.get(`/data/photogrammetry/project/${projectId}`);
    return response.data;
  },
};

// LiDAR API
export const lidarAPI = {
  upload: async (file: File, data: {
    name: string;
    fileType: string;
    description?: string;
    projectId: string;
    metadata?: any;
  }): Promise<LiDARData> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', data.name);
    formData.append('fileType', data.fileType);
    if (data.description) formData.append('description', data.description);
    formData.append('projectId', data.projectId);
    if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));

    const response = await api.post('/data/lidar/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  get: async (lidarId: string): Promise<LiDARData> => {
    const response = await api.get(`/data/lidar/${lidarId}`);
    return response.data;
  },

  listByProject: async (projectId: string): Promise<LiDARData[]> => {
    const response = await api.get(`/data/lidar/project/${projectId}`);
    return response.data;
  },
};

// GIS API
export const gisAPI = {
  createLayer: async (layer: Omit<GISLayer, 'layer_id' | 'upload_date' | 'uploader_id'>): Promise<GISLayer> => {
    const response = await api.post('/data/gis/layers', layer);
    return response.data;
  },

  getLayer: async (layerId: string): Promise<GISLayer> => {
    const response = await api.get(`/data/gis/layers/${layerId}`);
    return response.data;
  },

  listByProject: async (projectId: string): Promise<GISLayer[]> => {
    const response = await api.get(`/data/gis/layers/project/${projectId}`);
    return response.data;
  },

  updateVisibility: async (layerId: string, visible: boolean, opacity: number = 1.0): Promise<any> => {
    const formData = new FormData();
    formData.append('visible', visible.toString());
    formData.append('opacity', opacity.toString());

    const response = await api.patch(`/data/gis/layers/${layerId}/visibility`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// Drill Hole API
export const drillHoleAPI = {
  create: async (drillhole: Omit<DrillHole, 'drillhole_id'>): Promise<DrillHole> => {
    const response = await api.post('/data/drillholes', drillhole);
    return response.data;
  },

  get: async (drillholeId: string): Promise<DrillHole> => {
    const response = await api.get(`/data/drillholes/${drillholeId}`);
    return response.data;
  },

  listByProject: async (projectId: string): Promise<DrillHole[]> => {
    const response = await api.get(`/data/drillholes/project/${projectId}`);
    return response.data;
  },

  createInterval: async (interval: Omit<DrillInterval, 'interval_id'>): Promise<DrillInterval> => {
    const response = await api.post('/data/drill-intervals', interval);
    return response.data;
  },

  getIntervals: async (drillholeId: string): Promise<DrillInterval[]> => {
    const response = await api.get(`/data/drill-intervals/${drillholeId}`);
    return response.data;
  },

  createAssay: async (assay: Omit<Assay, 'assay_id'>): Promise<Assay> => {
    const response = await api.post('/data/assays', assay);
    return response.data;
  },

  getAssaysByInterval: async (intervalId: string): Promise<Assay[]> => {
    const response = await api.get(`/data/assays/interval/${intervalId}`);
    return response.data;
  },
};

// Offline Sync API
export const offlineSyncAPI = {
  createSync: async (syncData: Omit<OfflineSync, 'sync_id' | 'created_at' | 'synced_at'>): Promise<OfflineSync> => {
    const response = await api.post('/data/offline/sync', syncData);
    return response.data;
  },

  getPendingSyncs: async (projectId?: string): Promise<OfflineSync[]> => {
    const params = projectId ? { project_id: projectId } : {};
    const response = await api.get('/data/offline/sync/pending', { params });
    return response.data;
  },

  updateSyncStatus: async (syncId: string, status: string): Promise<any> => {
    const formData = new FormData();
    formData.append('status', status);

    const response = await api.patch(`/data/offline/sync/${syncId}/status`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  resolveConflicts: async (syncId: string, resolution: any): Promise<any> => {
    const response = await api.post(`/data/offline/sync/${syncId}/resolve`, resolution);
    return response.data;
  },

  getSyncStatus: async (projectId?: string): Promise<SyncStatus> => {
    const params = projectId ? { project_id: projectId } : {};
    const response = await api.get('/data/offline/sync/status', { params });
    return response.data;
  },
};

// Utility functions
export const apiUtils = {
  // Check if user is online
  isOnline: () => navigator.onLine,

  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Generate unique ID
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Debounce function for API calls
  debounce: <T extends (...args: any[]) => any>(func: T, wait: number): T => {
    let timeout: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    }) as T;
  },
};

export default api; 