import type { Meta, StoryObj } from '@storybook/react';
import { GISMap } from './GISMap';

const meta: Meta<typeof GISMap> = {
  title: 'Geospatial/GISMap',
  component: GISMap,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Interactive GIS map component for displaying geological layers, drill holes, and spatial features with Mapbox integration.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    center: {
      control: { type: 'object' },
      description: 'Map center coordinates [longitude, latitude]',
    },
    zoom: {
      control: { type: 'range', min: 1, max: 20, step: 1 },
      description: 'Initial zoom level',
    },
    show3D: {
      control: { type: 'boolean' },
      description: 'Whether to show the map in 3D mode',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample GIS layers
const sampleLayers = [
  {
    id: 'geology-layer',
    name: 'Geological Formations',
    type: 'geojson' as const,
    source: 'https://example.com/geology.geojson',
    visible: true,
    opacity: 0.8,
    color: '#1976d2',
  },
  {
    id: 'faults-layer',
    name: 'Fault Lines',
    type: 'geojson' as const,
    source: 'https://example.com/faults.geojson',
    visible: true,
    opacity: 1.0,
    color: '#dc004e',
  },
  {
    id: 'mineralization-layer',
    name: 'Mineralization Zones',
    type: 'geojson' as const,
    source: 'https://example.com/mineralization.geojson',
    visible: false,
    opacity: 0.6,
    color: '#ff9800',
  },
];

// Sample drill holes
const sampleDrillHoles = [
  {
    id: 'DH-001',
    coordinates: [-122.4194, 37.7749] as [number, number],
    depth: 150.5,
    samples: [
      { depth: 10, grade: 2.5, mineral: 'Gold' },
      { depth: 25, grade: 1.8, mineral: 'Gold' },
      { depth: 45, grade: 3.2, mineral: 'Gold' },
    ],
  },
  {
    id: 'DH-002',
    coordinates: [-122.4180, 37.7755] as [number, number],
    depth: 200.0,
    samples: [
      { depth: 15, grade: 1.9, mineral: 'Gold' },
      { depth: 35, grade: 2.7, mineral: 'Gold' },
      { depth: 60, grade: 1.5, mineral: 'Gold' },
    ],
  },
  {
    id: 'DH-003',
    coordinates: [-122.4200, 37.7740] as [number, number],
    depth: 175.3,
    samples: [
      { depth: 20, grade: 3.1, mineral: 'Gold' },
      { depth: 40, grade: 2.3, mineral: 'Gold' },
      { depth: 70, grade: 1.7, mineral: 'Gold' },
    ],
  },
];

// Sample geological features
const sampleGeologicalFeatures = [
  {
    id: 'fault-001',
    type: 'fault' as const,
    geometry: {
      type: 'LineString',
      coordinates: [
        [-122.4194, 37.7749],
        [-122.4180, 37.7755],
        [-122.4165, 37.7760],
      ],
    },
    properties: {
      name: 'Main Fault Zone',
      description: 'Primary fault system running through the mining area',
      confidence: 0.95,
      age: 'Tertiary',
    },
  },
  {
    id: 'fold-001',
    type: 'fold' as const,
    geometry: {
      type: 'LineString',
      coordinates: [
        [-122.4200, 37.7740],
        [-122.4210, 37.7735],
        [-122.4220, 37.7730],
      ],
    },
    properties: {
      name: 'Anticline Structure',
      description: 'Major anticlinal fold affecting mineralization',
      confidence: 0.88,
      age: 'Cretaceous',
    },
  },
  {
    id: 'contact-001',
    type: 'contact' as const,
    geometry: {
      type: 'LineString',
      coordinates: [
        [-122.4185, 37.7752],
        [-122.4195, 37.7747],
        [-122.4205, 37.7742],
      ],
    },
    properties: {
      name: 'Granite-Sediment Contact',
      description: 'Contact between granite intrusion and sedimentary rocks',
      confidence: 0.92,
      age: 'Jurassic',
    },
  },
];

export const Default: Story = {
  args: {
    center: [-122.4194, 37.7749],
    zoom: 14,
    layers: sampleLayers,
    drillHoles: sampleDrillHoles,
    geologicalFeatures: sampleGeologicalFeatures,
    show3D: false,
  },
};

export const ThreeDimensional: Story = {
  args: {
    center: [-122.4194, 37.7749],
    zoom: 14,
    layers: sampleLayers,
    drillHoles: sampleDrillHoles,
    geologicalFeatures: sampleGeologicalFeatures,
    show3D: true,
  },
};

export const HighZoom: Story = {
  args: {
    center: [-122.4194, 37.7749],
    zoom: 18,
    layers: sampleLayers,
    drillHoles: sampleDrillHoles,
    geologicalFeatures: sampleGeologicalFeatures,
    show3D: false,
  },
};

export const DrillHolesOnly: Story = {
  args: {
    center: [-122.4194, 37.7749],
    zoom: 14,
    layers: [],
    drillHoles: sampleDrillHoles,
    geologicalFeatures: [],
    show3D: false,
  },
};

export const GeologicalFeaturesOnly: Story = {
  args: {
    center: [-122.4194, 37.7749],
    zoom: 14,
    layers: [],
    drillHoles: [],
    geologicalFeatures: sampleGeologicalFeatures,
    show3D: false,
  },
};

export const EmptyMap: Story = {
  args: {
    center: [-122.4194, 37.7749],
    zoom: 12,
    layers: [],
    drillHoles: [],
    geologicalFeatures: [],
    show3D: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the base map without any geological data layers.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    center: [-122.4194, 37.7749],
    zoom: 14,
    layers: sampleLayers,
    drillHoles: sampleDrillHoles,
    geologicalFeatures: sampleGeologicalFeatures,
    show3D: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive map with click handlers for drill holes and geological features.',
      },
    },
  },
}; 