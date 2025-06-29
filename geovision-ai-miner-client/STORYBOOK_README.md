# Storybook Documentation - GeoVision AI Miner

## Overview

Storybook is a development environment for UI components that allows you to:
- Build components in isolation
- Test different states and variations
- Document component usage and props
- Share components across your team
- Test component interactions and accessibility

## Getting Started

### Prerequisites

Make sure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- The project dependencies installed (`npm install`)

### Running Storybook

```bash
# Start Storybook in development mode
npm run storybook

# Build Storybook for production
npm run build-storybook

# Serve the built Storybook
npm run storybook:serve
```

Storybook will be available at `http://localhost:6006` by default.

## Project Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   ├── Card.tsx
│   │   ├── Card.stories.tsx
│   │   ├── Input.tsx
│   │   └── Input.stories.tsx
│   ├── visualization/         # Geological visualization components
│   │   ├── GeologicalMap.tsx
│   │   └── geologicalMap.stories.tsx
│   └── ...
.storybook/
├── main.ts                   # Storybook configuration
├── preview.ts                # Global decorators and parameters
└── manager.ts                # UI theme and addons
```

## Component Stories

### Writing Stories

Each component should have a corresponding `.stories.tsx` file. Here's the structure:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

// Component metadata
const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Story variations
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};
```

### Story Categories

We organize stories into categories:

- **UI**: Basic UI components (Button, Card, Input, etc.)
- **Visualization**: Geological and data visualization components
- **Layout**: Layout and structural components
- **Forms**: Form-related components
- **Navigation**: Navigation and routing components

## Geological Theme

Our Storybook uses a custom geological theme with:

- **Primary Color**: `#1976d2` (Deep Blue)
- **Secondary Color**: `#dc004e` (Mineral Red)
- **Background**: Dark theme with geological color palette
- **Typography**: Clean, readable fonts optimized for technical content

## Best Practices

### 1. Component Documentation

Always include:
- Component description in the meta
- Props documentation with `argTypes`
- Usage examples
- Accessibility considerations

```tsx
const meta: Meta<typeof GeologicalMap> = {
  title: 'Visualization/GeologicalMap',
  component: GeologicalMap,
  parameters: {
    docs: {
      description: {
        component: 'Interactive geological map component for displaying mining data and geological features.',
      },
    },
  },
  argTypes: {
    data: {
      description: 'Geological data points to display on the map',
      control: { type: 'object' },
    },
    zoom: {
      description: 'Initial zoom level',
      control: { type: 'range', min: 1, max: 20, step: 1 },
    },
  },
};
```

### 2. Interactive Controls

Use Storybook controls to make stories interactive:

```tsx
argTypes: {
  variant: {
    control: { type: 'select' },
    options: ['primary', 'secondary', 'outline'],
    description: 'Visual style variant',
  },
  disabled: {
    control: { type: 'boolean' },
    description: 'Whether the component is disabled',
  },
  size: {
    control: { type: 'radio' },
    options: ['sm', 'md', 'lg'],
    description: 'Component size',
  },
}
```

### 3. Story Variations

Create multiple stories to showcase different states:

```tsx
export const Default: Story = {
  args: {
    children: 'Default State',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading State',
  },
};

export const Error: Story = {
  args: {
    error: 'Something went wrong',
    children: 'Error State',
  },
};
```

### 4. Accessibility Testing

Include accessibility testing in your stories:

```tsx
export const Accessibility: Story = {
  args: {
    children: 'Accessible Button',
    'aria-label': 'Primary action button',
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'button-name',
            enabled: true,
          },
        ],
      },
    },
  },
};
```

## Addons and Tools

### Installed Addons

- **@storybook/addon-essentials**: Core addons (docs, controls, actions)
- **@storybook/addon-interactions**: Testing component interactions
- **@storybook/addon-a11y**: Accessibility testing
- **@storybook/addon-viewport**: Testing responsive design
- **@storybook/addon-backgrounds**: Testing different backgrounds

### Using Addons

#### Viewport Testing
```tsx
export const Mobile: Story = {
  args: {
    children: 'Mobile View',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
```

#### Background Testing
```tsx
export const LightBackground: Story = {
  args: {
    children: 'Light Background',
  },
  parameters: {
    backgrounds: {
      default: 'light',
    },
  },
};
```

## Testing with Storybook

### Visual Regression Testing

Storybook can be used for visual regression testing:

```bash
# Install Chromatic for visual testing
npm install --save-dev chromatic

# Run visual tests
npx chromatic --project-token=<your-token>
```

### Interaction Testing

Test component interactions:

```tsx
import { expect } from '@storybook/test';
import { within, userEvent } from '@storybook/testing-library';

export const InteractionTest: Story = {
  args: {
    children: 'Click Me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    await userEvent.click(button);
    
    // Assert the expected behavior
    await expect(button).toHaveTextContent('Clicked!');
  },
};
```

## Deployment

### Static Build

Build Storybook for deployment:

```bash
npm run build-storybook
```

The built files will be in the `storybook-static` directory.

### GitHub Pages Deployment

Add to your CI/CD pipeline:

```yaml
- name: Build Storybook
  run: npm run build-storybook

- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./storybook-static
```

## Troubleshooting

### Common Issues

1. **Stories not loading**: Check file naming and imports
2. **Controls not working**: Verify `argTypes` configuration
3. **Styling issues**: Ensure CSS imports are correct
4. **Performance**: Use `parameters.docs.source.type = 'dynamic'` for large components

### Debug Mode

Run Storybook in debug mode:

```bash
DEBUG=* npm run storybook
```

## Contributing

### Adding New Components

1. Create the component in `src/components/`
2. Create a corresponding `.stories.tsx` file
3. Add comprehensive documentation
4. Include accessibility considerations
5. Test with different states and variations

### Story Guidelines

- Use descriptive story names
- Include realistic data and props
- Test edge cases and error states
- Document any special requirements
- Keep stories focused and simple

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Storybook Addons](https://storybook.js.org/addons)
- [Component Testing](https://storybook.js.org/docs/writing-tests/introduction)
- [Accessibility Testing](https://storybook.js.org/docs/writing-tests/accessibility-testing)

## Support

For questions about Storybook setup or usage:
- Check the [Storybook documentation](https://storybook.js.org/docs)
- Review existing stories in the project
- Consult the team's component library guidelines 