# Visual Testing with Chromatic

This project uses Chromatic for visual regression testing and UI review workflows.

## Setup

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up Chromatic Project**
   - Visit [chromatic.com](https://chromatic.com)
   - Connect your GitHub repository
   - Copy your project token
   - Add `CHROMATIC_PROJECT_TOKEN` to your environment variables

3. **Configure Environment**
   \`\`\`bash
   # .env.local
   CHROMATIC_PROJECT_TOKEN=your_project_token_here
   \`\`\`

## Running Visual Tests

### Local Development
\`\`\`bash
# Run Storybook locally
npm run storybook

# Build and test stories
npm run build-storybook
npm run chromatic

# Run with specific options
npx chromatic --only-changed --exit-zero-on-changes
\`\`\`

### CI/CD Pipeline
Visual tests run automatically on:
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

## Story Configuration

### Basic Story
\`\`\`typescript
export const Default: Story = {
  name: "Default State",
  parameters: {
    chromatic: {
      viewports: [375, 768, 1024, 1440],
      delay: 300,
    },
  },
}
\`\`\`

### Advanced Configuration
\`\`\`typescript
export const InteractiveStory: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button'))
  },
  parameters: {
    chromatic: {
      delay: 500,
      diffThreshold: 0.2,
      pauseAnimationAtEnd: true,
    },
  },
}
\`\`\`

## Visual Testing Best Practices

### 1. Comprehensive Coverage
- Test all component variants
- Include different viewport sizes
- Cover light and dark themes
- Test interactive states

### 2. Stable Screenshots
- Use consistent data
- Disable animations when needed
- Set appropriate delays
- Mock dynamic content

### 3. Efficient Testing
- Use `onlyChanged` for faster builds
- Skip non-visual stories
- Group related tests
- Optimize viewport selection

### 4. Review Process
- Review visual changes in Chromatic UI
- Approve legitimate changes
- Reject unintended regressions
- Document visual decisions

## Chromatic Features

### Visual Regression Detection
- Pixel-perfect comparison
- Cross-browser testing
- Responsive design validation
- Animation testing

### Collaboration
- Visual review workflows
- Team collaboration
- Change approval process
- Integration with GitHub PRs

### Performance
- Incremental builds
- Smart diffing
- Parallel processing
- CDN-powered delivery

## Troubleshooting

### Common Issues

1. **Flaky Screenshots**
   - Increase delay times
   - Disable animations
   - Use stable test data
   - Check for async operations

2. **Missing Stories**
   - Verify story exports
   - Check file naming
   - Review Storybook config
   - Validate story parameters

3. **Build Failures**
   - Check TypeScript errors
   - Verify dependencies
   - Review build logs
   - Test locally first

### Debug Commands
\`\`\`bash
# Debug Storybook build
npm run build-storybook -- --debug

# Run Chromatic with verbose output
npx chromatic --debug

# Test specific stories
npx chromatic --only-story-names="Button/*"
\`\`\`

## Integration with Development Workflow

### Pre-commit Hooks
Visual tests are included in the pre-commit workflow:
\`\`\`bash
npm run check-all  # Includes visual testing
\`\`\`

### GitHub Integration
- Automatic PR checks
- Visual diff comments
- Status updates
- Merge blocking on failures

### Continuous Deployment
- Visual approval gates
- Automated releases
- Rollback capabilities
- Performance monitoring
