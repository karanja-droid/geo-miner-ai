import type { Meta, StoryObj } from '@storybook/react';
import { DrillHoleAnalyzer } from './DrillHoleAnalyzer';

const meta: Meta<typeof DrillHoleAnalyzer> = {
  title: 'Geospatial/DrillHoleAnalyzer',
  component: DrillHoleAnalyzer,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Comprehensive drill hole data analyzer with cross-sections, grade analysis, and statistical reporting for mining applications.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showCrossSection: {
      control: { type: 'boolean' },
      description: 'Whether to show the depth vs grade cross-section chart',
    },
    showGradeAnalysis: {
      control: { type: 'boolean' },
      description: 'Whether to show the grade distribution analysis',
    },
    showStatisticalAnalysis: {
      control: { type: 'boolean' },
      description: 'Whether to show statistical analysis and tables',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample drill hole data
const sampleDrillHoles = [
  {
    id: 'DH-001',
    name: 'Drill Hole DH-001',
    coordinates: [-122.4194, 37.7749] as [number, number],
    elevation: 1250.5,
    totalDepth: 200.0,
    collar: {
      x: 500000,
      y: 4000000,
      z: 1250.5,
      azimuth: 45.0,
      dip: -90.0,
    },
    samples: [
      { depth: 10, grade: 2.5, mineral: 'Gold', lithology: 'Granite' },
      { depth: 25, grade: 1.8, mineral: 'Gold', lithology: 'Granite' },
      { depth: 45, grade: 3.2, mineral: 'Gold', lithology: 'Quartz Vein' },
      { depth: 65, grade: 2.1, mineral: 'Gold', lithology: 'Quartz Vein' },
      { depth: 85, grade: 4.1, mineral: 'Gold', lithology: 'Quartz Vein' },
      { depth: 105, grade: 1.9, mineral: 'Gold', lithology: 'Granite' },
      { depth: 125, grade: 2.8, mineral: 'Gold', lithology: 'Granite' },
      { depth: 145, grade: 3.5, mineral: 'Gold', lithology: 'Quartz Vein' },
      { depth: 165, grade: 2.3, mineral: 'Gold', lithology: 'Quartz Vein' },
      { depth: 185, grade: 1.7, mineral: 'Gold', lithology: 'Granite' },
    ],
  },
  {
    id: 'DH-002',
    name: 'Drill Hole DH-002',
    coordinates: [-122.4180, 37.7755] as [number, number],
    elevation: 1248.2,
    totalDepth: 175.0,
    collar: {
      x: 500100,
      y: 4000100,
      z: 1248.2,
      azimuth: 45.0,
      dip: -90.0,
    },
    samples: [
      { depth: 15, grade: 1.9, mineral: 'Gold', lithology: 'Granite' },
      { depth: 35, grade: 2.7, mineral: 'Gold', lithology: 'Quartz Vein' },
      { depth: 55, grade: 1.5, mineral: 'Gold', lithology: 'Granite' },
      { depth: 75, grade: 3.8, mineral: 'Gold', lithology: 'Quartz Vein' },
      { depth: 95, grade: 2.4, mineral: 'Gold', lithology: 'Quartz Vein' },
      { depth: 115, grade: 1.6, mineral: 'Gold', lithology: 'Granite' },
      { depth: 135, grade: 2.9, mineral: 'Gold', lithology: 'Quartz Vein' },
      { depth: 155, grade: 2.1, mineral: 'Gold', lithology: 'Granite' },
    ],
  },
  {
    id: 'DH-003',
    name: 'Drill Hole DH-003',
    coordinates: [-122.4200, 37.7740] as [number, number],
    elevation: 1252.8,
    totalDepth: 225.0,
    collar: {
      x: 499900,
      y: 3999900,
      z: 1252.8,
      azimuth: 45.0,
      dip: -90.0,
    },
    samples: [
      { depth: 20, grade: 3.1, mineral: 'Gold', lithology: 'Quartz Vein' },
      { depth: 40, grade: 2.3, mineral: 'Gold', lithology: 'Granite' },
      { depth: 60, grade: 1.7, mineral: 'Gold', lithology: 'Granite' },
      { depth: 80, grade: 4.2, mineral: 'Gold', lithology: 'Quartz Vein' },
      { depth: 100, grade: 3.6, mineral: 'Gold', lithology: 'Quartz Vein' },
      { depth: 120, grade: 2.0, mineral: 'Gold', lithology: 'Granite' },
      { depth: 140, grade: 1.8, mineral: 'Gold', lithology: 'Granite' },
      { depth: 160, grade: 3.4, mineral: 'Gold', lithology: 'Quartz Vein' },
      { depth: 180, grade: 2.7, mineral: 'Gold', lithology: 'Quartz Vein' },
      { depth: 200, grade: 1.9, mineral: 'Gold', lithology: 'Granite' },
      { depth: 220, grade: 2.5, mineral: 'Gold', lithology: 'Quartz Vein' },
    ],
  },
];

// Multi-mineral drill hole data
const multiMineralDrillHoles = [
  {
    id: 'DH-M001',
    name: 'Multi-Mineral DH-M001',
    coordinates: [-122.4194, 37.7749] as [number, number],
    elevation: 1250.5,
    totalDepth: 150.0,
    collar: {
      x: 500000,
      y: 4000000,
      z: 1250.5,
      azimuth: 45.0,
      dip: -90.0,
    },
    samples: [
      { depth: 10, grade: 2.5, mineral: 'Gold', lithology: 'Granite' },
      { depth: 25, grade: 1.8, mineral: 'Gold', lithology: 'Granite' },
      { depth: 45, grade: 3.2, mineral: 'Gold', lithology: 'Quartz Vein' },
      { depth: 65, grade: 2.1, mineral: 'Gold', lithology: 'Quartz Vein' },
      { depth: 85, grade: 4.1, mineral: 'Gold', lithology: 'Quartz Vein' },
      { depth: 10, grade: 0.8, mineral: 'Copper', lithology: 'Granite' },
      { depth: 25, grade: 1.2, mineral: 'Copper', lithology: 'Granite' },
      { depth: 45, grade: 0.9, mineral: 'Copper', lithology: 'Quartz Vein' },
      { depth: 65, grade: 1.5, mineral: 'Copper', lithology: 'Quartz Vein' },
      { depth: 85, grade: 0.7, mineral: 'Copper', lithology: 'Quartz Vein' },
    ],
  },
];

export const Default: Story = {
  args: {
    drillHoles: sampleDrillHoles,
    selectedHole: 'DH-001',
    showCrossSection: true,
    showGradeAnalysis: true,
    showStatisticalAnalysis: true,
  },
};

export const CrossSectionOnly: Story = {
  args: {
    drillHoles: sampleDrillHoles,
    selectedHole: 'DH-001',
    showCrossSection: true,
    showGradeAnalysis: false,
    showStatisticalAnalysis: false,
  },
};

export const GradeAnalysisOnly: Story = {
  args: {
    drillHoles: sampleDrillHoles,
    selectedHole: 'DH-002',
    showCrossSection: false,
    showGradeAnalysis: true,
    showStatisticalAnalysis: false,
  },
};

export const StatisticsOnly: Story = {
  args: {
    drillHoles: sampleDrillHoles,
    selectedHole: 'DH-003',
    showCrossSection: false,
    showGradeAnalysis: false,
    showStatisticalAnalysis: true,
  },
};

export const MultiMineral: Story = {
  args: {
    drillHoles: multiMineralDrillHoles,
    selectedHole: 'DH-M001',
    showCrossSection: true,
    showGradeAnalysis: true,
    showStatisticalAnalysis: true,
  },
};

export const NoData: Story = {
  args: {
    drillHoles: [],
    selectedHole: undefined,
    showCrossSection: true,
    showGradeAnalysis: true,
    showStatisticalAnalysis: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows the component state when no drill hole data is available.',
      },
    },
  },
};

export const DeepDrillHole: Story = {
  args: {
    drillHoles: [
      {
        ...sampleDrillHoles[0],
        id: 'DH-DEEP',
        name: 'Deep Drill Hole DH-DEEP',
        totalDepth: 500.0,
        samples: Array.from({ length: 50 }, (_, i) => ({
          depth: (i + 1) * 10,
          grade: 1.5 + Math.random() * 3,
          mineral: 'Gold',
          lithology: i % 3 === 0 ? 'Quartz Vein' : 'Granite',
        })),
      },
    ],
    selectedHole: 'DH-DEEP',
    showCrossSection: true,
    showGradeAnalysis: true,
    showStatisticalAnalysis: true,
  },
}; 