import type { Meta, StoryObj } from '@storybook/react';
import { GeologicalMap } from './geologicalMap';

const meta: Meta<typeof GeologicalMap> = {
  title: 'Visualization/GeologicalMap',
  component: GeologicalMap,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'An interactive geological map component for displaying mining exploration data.',
      },
    },
  },
  argTypes: {
    center: {
      control: { type: 'object' },
      description: 'Center coordinates of the map',
    },
    zoom: {
      control: { type: 'number', min: 1, max: 20 },
      description: 'Initial zoom level',
    },
    data: {
      control: { type: 'object' },
      description: 'Geological data points to display',
    },
    onPointClick: { action: 'point clicked' },
    onMapClick: { action: 'map clicked' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    center: { lat: -23.5505, lng: -46.6333 },
    zoom: 10,
    data: [
      {
        id: 1,
        lat: -23.5505,
        lng: -46.6333,
        type: 'gold',
        concentration: 85,
        depth: 150,
        status: 'active'
      },
      {
        id: 2,
        lat: -23.5600,
        lng: -46.6400,
        type: 'silver',
        concentration: 72,
        depth: 200,
        status: 'exploration'
      }
    ],
  },
};

export const EmptyMap: Story = {
  args: {
    center: { lat: 0, lng: 0 },
    zoom: 2,
    data: [],
  },
};

export const MultipleDeposits: Story = {
  args: {
    center: { lat: -23.5505, lng: -46.6333 },
    zoom: 8,
    data: [
      {
        id: 1,
        lat: -23.5505,
        lng: -46.6333,
        type: 'gold',
        concentration: 85,
        depth: 150,
        status: 'active'
      },
      {
        id: 2,
        lat: -23.5600,
        lng: -46.6400,
        type: 'silver',
        concentration: 72,
        depth: 200,
        status: 'exploration'
      },
      {
        id: 3,
        lat: -23.5400,
        lng: -46.6200,
        type: 'copper',
        concentration: 65,
        depth: 300,
        status: 'planning'
      },
      {
        id: 4,
        lat: -23.5700,
        lng: -46.6500,
        type: 'iron',
        concentration: 90,
        depth: 100,
        status: 'active'
      }
    ],
  },
};

export const HighZoom: Story = {
  args: {
    center: { lat: -23.5505, lng: -46.6333 },
    zoom: 15,
    data: [
      {
        id: 1,
        lat: -23.5505,
        lng: -46.6333,
        type: 'gold',
        concentration: 85,
        depth: 150,
        status: 'active'
      }
    ],
  },
};

export const DifferentRegion: Story = {
  args: {
    center: { lat: -33.8688, lng: 151.2093 }, // Sydney, Australia
    zoom: 10,
    data: [
      {
        id: 1,
        lat: -33.8688,
        lng: 151.2093,
        type: 'coal',
        concentration: 78,
        depth: 250,
        status: 'active'
      },
      {
        id: 2,
        lat: -33.8700,
        lng: 151.2100,
        type: 'gold',
        concentration: 92,
        depth: 180,
        status: 'exploration'
      }
    ],
  },
}; 