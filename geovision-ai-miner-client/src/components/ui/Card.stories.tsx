import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile card component with geological styling for displaying content.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'geological', 'mining'],
      description: 'The visual style variant of the card',
    },
    title: {
      control: { type: 'text' },
      description: 'The title of the card',
    },
    subtitle: {
      control: { type: 'text' },
      description: 'The subtitle of the card',
    },
    hoverable: {
      control: { type: 'boolean' },
      description: 'Whether the card has hover effects',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
    onClick: { action: 'clicked' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <p className="text-gray-600">This is a default card with some content.</p>,
    variant: 'default',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Card Title',
    children: <p className="text-gray-600">This card has a title and content.</p>,
    variant: 'default',
  },
};

export const WithTitleAndSubtitle: Story = {
  args: {
    title: 'Card Title',
    subtitle: 'Card subtitle with additional information',
    children: <p className="text-gray-600">This card has both title and subtitle.</p>,
    variant: 'default',
  },
};

export const Geological: Story = {
  args: {
    title: 'Geological Data',
    subtitle: 'Mineral deposit information',
    children: <p className="text-gray-600">This card uses geological styling.</p>,
    variant: 'geological',
  },
};

export const Mining: Story = {
  args: {
    title: 'Mining Operations',
    subtitle: 'Active mining site data',
    children: <p className="text-gray-600">This card uses mining styling.</p>,
    variant: 'mining',
  },
};

export const Hoverable: Story = {
  args: {
    title: 'Interactive Card',
    subtitle: 'Hover to see effects',
    children: <p className="text-gray-600">This card has hover animations.</p>,
    variant: 'default',
    hoverable: true,
  },
};

export const GeologicalData: Story = {
  args: {
    title: 'Mineral Deposit',
    subtitle: 'Active exploration site',
    children: (
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Location:</span>
          <span className="font-medium">Lat: -23.5505, Long: -46.6333</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Depth:</span>
          <span className="font-medium">150m</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Mineral Type:</span>
          <span className="font-medium text-geological-mineral">Gold</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Concentration:</span>
          <span className="font-medium text-green-600">85%</span>
        </div>
      </div>
    ),
    variant: 'geological',
    hoverable: true,
  },
};

export const InteractiveCard: Story = {
  args: {
    title: 'Interactive Card',
    subtitle: 'Click to view details',
    children: (
      <div>
        <p className="text-gray-600 mb-4">This card can be clicked and interacted with.</p>
        <button className="bg-mining-primary text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          View Details
        </button>
      </div>
    ),
    variant: 'default',
    hoverable: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
      <Card variant="default" title="Default">
        <p className="text-gray-600">Standard card styling</p>
      </Card>
      <Card variant="geological" title="Geological">
        <p className="text-gray-600">Geological theme styling</p>
      </Card>
      <Card variant="mining" title="Mining">
        <p className="text-gray-600">Mining theme styling</p>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All card variants displayed together for comparison.',
      },
    },
  },
}; 