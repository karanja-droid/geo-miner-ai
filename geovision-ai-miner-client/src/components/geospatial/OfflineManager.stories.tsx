import type { Meta, StoryObj } from '@storybook/react';
import { OfflineManager } from './OfflineManager';

const meta: Meta<typeof OfflineManager> = {
  title: 'Geospatial/OfflineManager',
  component: OfflineManager,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Offline data manager for handling data synchronization, conflict resolution, and offline capabilities in mining applications.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    maxStorageSize: {
      control: { type: 'range', min: 50, max: 500, step: 50 },
      description: 'Maximum storage size in MB',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample offline data
const sampleOfflineData = [
  {
    id: 'offline-001',
    type: 'drill-hole' as const,
    name: 'Drill Hole DH-001',
    description: 'New drill hole data collected offline',
    fileType: 'geojson',
    metadata: { resolution: 2.5, coverage: 'North Section' },
    fileUrl: '/data/dh-001.geojson',
    uploadDate: '2024-01-15T10:30:00Z',
    uploaderId: 'user-001',
    synced: false,
    size: 1024 * 50, // 50KB
  },
  {
    id: 'offline-002',
    type: 'geological-feature' as const,
    name: 'Fault Line F-001',
    description: 'Geological fault mapping data',
    fileType: 'shapefile',
    metadata: { confidence: 0.95, age: 'Tertiary' },
    fileUrl: '/data/fault-001.shp',
    uploadDate: '2024-01-16T14:20:00Z',
    uploaderId: 'user-001',
    synced: true,
    size: 1024 * 25, // 25KB
  },
  {
    id: 'offline-003',
    type: 'photogrammetry' as const,
    name: 'Site Survey 2024',
    description: 'Photogrammetry data from drone survey',
    fileType: 'pointcloud',
    metadata: { resolution: 1.8, camera: 'DJI Phantom 4' },
    fileUrl: '/data/survey-2024.las',
    uploadDate: '2024-01-17T09:15:00Z',
    uploaderId: 'user-002',
    synced: false,
    size: 1024 * 1024 * 15, // 15MB
  },
  {
    id: 'offline-004',
    type: 'gis-layer' as const,
    name: 'Mineralization Zones',
    description: 'GIS layer showing mineralization boundaries',
    fileType: 'geojson',
    metadata: { layerType: 'vector', opacity: 0.8 },
    fileUrl: '/data/mineralization.geojson',
    uploadDate: '2024-01-18T16:45:00Z',
    uploaderId: 'user-001',
    synced: false,
    size: 1024 * 75, // 75KB
  },
];

// Large dataset for testing storage limits
const largeOfflineData = [
  ...sampleOfflineData,
  {
    id: 'offline-005',
    type: 'lidar' as const,
    name: 'High-Density LiDAR Survey',
    description: 'Large LiDAR point cloud dataset',
    fileType: 'las',
    metadata: { resolution: 0.5, points: 5000000 },
    fileUrl: '/data/lidar-survey.las',
    uploadDate: '2024-01-19T11:30:00Z',
    uploaderId: 'user-003',
    synced: false,
    size: 1024 * 1024 * 85, // 85MB
  },
  {
    id: 'offline-006',
    type: 'photogrammetry' as const,
    name: 'Orthophoto Mosaic',
    description: 'High-resolution orthophoto mosaic',
    fileType: 'tiff',
    metadata: { resolution: 0.1, bands: 4 },
    fileUrl: '/data/orthophoto.tiff',
    uploadDate: '2024-01-20T13:20:00Z',
    uploaderId: 'user-002',
    synced: false,
    size: 1024 * 1024 * 120, // 120MB
  },
];

export const Default: Story = {
  args: {
    offlineData: sampleOfflineData,
    maxStorageSize: 100,
  },
};

export const LargeDataset: Story = {
  args: {
    offlineData: largeOfflineData,
    maxStorageSize: 200,
  },
};

export const StorageFull: Story = {
  args: {
    offlineData: largeOfflineData,
    maxStorageSize: 50, // Small storage to trigger full state
  },
};

export const AllSynced: Story = {
  args: {
    offlineData: sampleOfflineData.map(item => ({ ...item, synced: true })),
    maxStorageSize: 100,
  },
};

export const NoData: Story = {
  args: {
    offlineData: [],
    maxStorageSize: 100,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component state when no offline data is available.',
      },
    },
  },
};

export const MixedSyncStatus: Story = {
  args: {
    offlineData: [
      { ...sampleOfflineData[0], synced: false },
      { ...sampleOfflineData[1], synced: true },
      { ...sampleOfflineData[2], synced: false },
      { ...sampleOfflineData[3], synced: true },
    ],
    maxStorageSize: 100,
  },
};

export const HighStorageUsage: Story = {
  args: {
    offlineData: largeOfflineData,
    maxStorageSize: 150,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when storage usage is high (near capacity).',
      },
    },
  },
}; 