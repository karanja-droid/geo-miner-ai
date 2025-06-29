import type { Meta, StoryObj } from '@storybook/react';
import { PhotogrammetryViewer } from './PhotogrammetryViewer';

const meta: Meta<typeof PhotogrammetryViewer> = {
  title: 'Geospatial/PhotogrammetryViewer',
  component: PhotogrammetryViewer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: '3D point cloud viewer for photogrammetry data with interactive controls and geological theming.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    pointSize: {
      control: { type: 'range', min: 0.5, max: 5, step: 0.5 },
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

// Sample photogrammetry data
const sampleData = {
  points: Array.from({ length: 1000 }, (_, i) => ({
    x: (Math.random() - 0.5) * 100,
    y: (Math.random() - 0.5) * 100,
    z: Math.random() * 50,
    intensity: Math.random() * 255,
    color: [Math.random() * 255, Math.random() * 255, Math.random() * 255] as [number, number, number],
  })),
  metadata: {
    resolution: 2.5,
    coverage: 'Mining Site A - North Section',
    date: '2024-01-15',
    camera: 'DJI Phantom 4 Pro',
  },
};

// Geological feature data
const geologicalData = {
  points: Array.from({ length: 2000 }, (_, i) => ({
    x: (Math.random() - 0.5) * 150,
    y: (Math.random() - 0.5) * 150,
    z: Math.random() * 75,
    intensity: Math.random() * 255,
    color: [100 + Math.random() * 155, 50 + Math.random() * 100, 50 + Math.random() * 100] as [number, number, number],
  })),
  metadata: {
    resolution: 1.8,
    coverage: 'Geological Formation B',
    date: '2024-02-20',
    camera: 'SenseFly eBee X',
  },
};

export const Default: Story = {
  args: {
    data: sampleData,
    pointSize: 2,
    showIntensity: false,
    autoRotate: false,
  },
};

export const WithIntensity: Story = {
  args: {
    data: sampleData,
    pointSize: 1.5,
    showIntensity: true,
    autoRotate: false,
  },
};

export const AutoRotating: Story = {
  args: {
    data: sampleData,
    pointSize: 2,
    showIntensity: false,
    autoRotate: true,
  },
};

export const LargePoints: Story = {
  args: {
    data: sampleData,
    pointSize: 4,
    showIntensity: false,
    autoRotate: false,
  },
};

export const GeologicalFormation: Story = {
  args: {
    data: geologicalData,
    pointSize: 2.5,
    showIntensity: true,
    autoRotate: false,
  },
};

export const HighDensity: Story = {
  args: {
    data: {
      points: Array.from({ length: 5000 }, (_, i) => ({
        x: (Math.random() - 0.5) * 80,
        y: (Math.random() - 0.5) * 80,
        z: Math.random() * 40,
        intensity: Math.random() * 255,
        color: [150 + Math.random() * 105, 150 + Math.random() * 105, 150 + Math.random() * 105] as [number, number, number],
      })),
      metadata: {
        resolution: 0.8,
        coverage: 'High-Density Survey Area',
        date: '2024-03-10',
        camera: 'Leica BLK360',
      },
    },
    pointSize: 1,
    showIntensity: false,
    autoRotate: false,
  },
};

export const Loading: Story = {
  args: {
    data: { points: [], metadata: { resolution: 0, coverage: '', date: '', camera: '' } },
    pointSize: 2,
    showIntensity: false,
    autoRotate: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the loading state when no data is provided.',
      },
    },
  },
}; 