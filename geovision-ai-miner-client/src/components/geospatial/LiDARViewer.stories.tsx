import type { Meta, StoryObj } from '@storybook/react';
import { LiDARViewer } from './LiDARViewer';

const meta: Meta<typeof LiDARViewer> = {
  title: 'Geospatial/LiDARViewer',
  component: LiDARViewer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'High-density LiDAR point cloud viewer for geological and mining applications with intensity mapping.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    pointSize: {
      control: { type: 'range', min: 0.5, max: 3, step: 0.5 },
      description: 'Size of individual points in the point cloud',
    },
    showIntensity: {
      control: { type: 'boolean' },
      description: 'Whether to color points by intensity values',
    },
    autoRotate: {
      control: { type: 'boolean' },
      description: 'Whether the camera should automatically rotate around the point cloud',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample LiDAR data
const sampleData = {
  points: Array.from({ length: 2000 }, (_, i) => ({
    x: (Math.random() - 0.5) * 120,
    y: (Math.random() - 0.5) * 120,
    z: Math.random() * 60,
    intensity: Math.random() * 255,
    classification: Math.floor(Math.random() * 10),
  })),
  metadata: {
    resolution: 5.2,
    area: 'Mining Site Survey Area',
    date: '2024-01-20',
    source: 'Terrestrial LiDAR Scanner',
    pointCount: 2000,
  },
};

// High-density LiDAR data
const highDensityData = {
  points: Array.from({ length: 10000 }, (_, i) => ({
    x: (Math.random() - 0.5) * 80,
    y: (Math.random() - 0.5) * 80,
    z: Math.random() * 40,
    intensity: Math.random() * 255,
    classification: Math.floor(Math.random() * 10),
  })),
  metadata: {
    resolution: 1.2,
    area: 'High-Density Survey Zone',
    date: '2024-02-15',
    source: 'Airborne LiDAR',
    pointCount: 10000,
  },
};

// Geological structure data
const geologicalData = {
  points: Array.from({ length: 5000 }, (_, i) => ({
    x: (Math.random() - 0.5) * 100,
    y: (Math.random() - 0.5) * 100,
    z: Math.random() * 50,
    intensity: 100 + Math.random() * 155,
    classification: Math.floor(Math.random() * 5),
  })),
  metadata: {
    resolution: 2.8,
    area: 'Geological Formation C',
    date: '2024-03-05',
    source: 'Mobile LiDAR System',
    pointCount: 5000,
  },
};

export const Default: Story = {
  args: {
    data: sampleData,
    pointSize: 1.5,
    showIntensity: false,
    autoRotate: false,
  },
};

export const WithIntensity: Story = {
  args: {
    data: sampleData,
    pointSize: 1.2,
    showIntensity: true,
    autoRotate: false,
  },
};

export const AutoRotating: Story = {
  args: {
    data: sampleData,
    pointSize: 1.5,
    showIntensity: false,
    autoRotate: true,
  },
};

export const HighDensity: Story = {
  args: {
    data: highDensityData,
    pointSize: 0.8,
    showIntensity: true,
    autoRotate: false,
  },
};

export const LargePoints: Story = {
  args: {
    data: sampleData,
    pointSize: 2.5,
    showIntensity: false,
    autoRotate: false,
  },
};

export const GeologicalStructure: Story = {
  args: {
    data: geologicalData,
    pointSize: 1.8,
    showIntensity: true,
    autoRotate: false,
  },
};

export const SmallPoints: Story = {
  args: {
    data: highDensityData,
    pointSize: 0.5,
    showIntensity: false,
    autoRotate: false,
  },
};

export const Loading: Story = {
  args: {
    data: { points: [], metadata: { resolution: 0, area: '', date: '', source: '', pointCount: 0 } },
    pointSize: 1.5,
    showIntensity: false,
    autoRotate: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading state when no LiDAR data is provided.',
      },
    },
  },
}; 