import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile input component with geological styling and validation support.',
      },
    },
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
      description: 'The type of input field',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'geological', 'mining'],
      description: 'The visual style variant of the input',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the input is disabled',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the input is required',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text for the input',
    },
    label: {
      control: { type: 'text' },
      description: 'Label for the input field',
    },
    error: {
      control: { type: 'text' },
      description: 'Error message to display',
    },
    onChange: { action: 'changed' },
    onBlur: { action: 'blurred' },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
    type: 'text',
    variant: 'default',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
    variant: 'default',
  },
};

export const Required: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    type: 'password',
    required: true,
    variant: 'default',
  },
};

export const Geological: Story = {
  args: {
    label: 'Mineral Type',
    placeholder: 'Enter mineral type (e.g., Gold, Silver)',
    type: 'text',
    variant: 'geological',
  },
};

export const Mining: Story = {
  args: {
    label: 'Site Coordinates',
    placeholder: 'Enter GPS coordinates',
    type: 'text',
    variant: 'mining',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'This input is disabled',
    type: 'text',
    disabled: true,
    variant: 'default',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
    error: 'Please enter a valid email address',
    variant: 'default',
  },
};

export const NumberInput: Story = {
  args: {
    label: 'Depth (meters)',
    placeholder: 'Enter depth',
    type: 'number',
    variant: 'geological',
  },
};

export const SearchInput: Story = {
  args: {
    label: 'Search Deposits',
    placeholder: 'Search by location, mineral type, or coordinates...',
    type: 'search',
    variant: 'mining',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-6 max-w-md">
      <Input
        label="Default Input"
        placeholder="Default variant"
        variant="default"
      />
      <Input
        label="Geological Input"
        placeholder="Geological variant"
        variant="geological"
      />
      <Input
        label="Mining Input"
        placeholder="Mining variant"
        variant="mining"
      />
      <Input
        label="Error Input"
        placeholder="With error state"
        variant="default"
        error="This field has an error"
      />
      <Input
        label="Disabled Input"
        placeholder="Disabled state"
        variant="default"
        disabled={true}
      />
      <Input
        label="Required Input"
        placeholder="Required field"
        variant="default"
        required={true}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All input variants and states displayed together for comparison.',
      },
    },
  },
}; 