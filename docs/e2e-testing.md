# End-to-End Testing with Playwright

This project uses Playwright for comprehensive end-to-end testing across multiple browsers and devices.

## Setup

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Install Playwright Browsers**
   \`\`\`bash
   npm run test:e2e:install
   \`\`\`

## Running E2E Tests

### Local Development
\`\`\`bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug specific test
npm run test:e2e:debug

# View test report
npm run test:e2e:report
\`\`\`

### Specific Test Suites
\`\`\`bash
# Authentication tests
npm run test:e2e:auth

# Dashboard functionality
npm run test:e2e:dashboard

# Accessibility tests
npm run test:e2e:accessibility

# Performance tests
npm run test:e2e:performance

# Cross-browser compatibility
npm run test:e2e:cross-browser
\`\`\`

## Test Structure

### Page Object Model
Tests use the Page Object Model pattern for maintainable and reusable code:

\`\`\`typescript
// e2e/pages/login.page.ts
export class LoginPage {
  constructor(private page: Page) {}
  
  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
  }
}
\`\`\`

### Test Categories

1. **Authentication Tests** (`e2e/auth.spec.ts`)
   - Login/logout workflows
   - Form validation
   - Error handling
   - Session management

2. **Dashboard Tests** (`e2e/dashboard.spec.ts`)
   - Navigation between tabs
   - Data visualization
   - Responsive design
   - User interactions

3. **AI Analysis Tests** (`e2e/ai-analysis.spec.ts`)
   - Analysis creation workflow
   - Provider selection
   - Progress tracking
   - Results display

4. **Dataset Management** (`e2e/dataset-management.spec.ts`)
   - File upload simulation
   - Dataset filtering
   - Metadata display
   - Action menus

5. **Accessibility Tests** (`e2e/accessibility.spec.ts`)
   - WCAG compliance
   - Keyboard navigation
   - Screen reader compatibility
   - ARIA attributes

6. **Performance Tests** (`e2e/performance.spec.ts`)
   - Page load times
   - Core Web Vitals
   - Large dataset handling
   - Memory usage

## Browser Support

Tests run across multiple browsers:
- **Chromium** (Chrome, Edge)
- **Firefox**
- **WebKit** (Safari)
- **Mobile browsers** (Chrome Mobile, Safari Mobile)

## Test Configuration

### Environment Variables
\`\`\`bash
# .env.test
PLAYWRIGHT_BASE_URL=http://localhost:3000
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_TIMEOUT=30000
\`\`\`

### Custom Configuration
\`\`\`typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
})
\`\`\`

## Best Practices

### 1. Reliable Selectors
- Use data-testid attributes
- Prefer role-based selectors
- Avoid CSS selectors that may change

\`\`\`typescript
// Good
await page.getByRole('button', { name: /sign in/i })
await page.getByTestId('login-form')

// Avoid
await page.locator('.btn-primary')
\`\`\`

### 2. Wait Strategies
- Use explicit waits
- Wait for network idle
- Check element states

\`\`\`typescript
// Wait for navigation
await page.waitForURL('/dashboard')

// Wait for element
await expect(page.getByText('Welcome')).toBeVisible()

// Wait for network
await page.waitForLoadState('networkidle')
\`\`\`

### 3. Test Data Management
- Use consistent test data
- Mock API responses
- Clean up after tests

\`\`\`typescript
// Mock API response
await page.route('**/api/v1/auth/login', async (route) => {
  await route.fulfill({ json: mockAuthResponse })
})
\`\`\`

### 4. Error Handling
- Take screenshots on failure
- Capture console logs
- Record videos for debugging

## Debugging Tests

### Debug Mode
\`\`\`bash
# Run specific test in debug mode
npx playwright test auth.spec.ts --debug

# Debug with specific browser
npx playwright test --project=chromium --debug
\`\`\`

### Trace Viewer
\`\`\`bash
# Generate trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
\`\`\`

### Screenshots and Videos
- Screenshots: `test-results/`
- Videos: `test-results/`
- Traces: `test-results/`

## CI/CD Integration

### GitHub Actions
- Runs on push/PR to main branches
- Tests across multiple browsers
- Uploads artifacts for debugging
- Parallel execution for speed

### Test Reports
- HTML reports with screenshots
- JUnit XML for CI integration
- JSON results for analysis
- GitHub annotations for failures

## Maintenance

### Updating Tests
1. Keep page objects in sync with UI changes
2. Update selectors when components change
3. Add tests for new features
4. Remove tests for deprecated features

### Performance Monitoring
- Track test execution times
- Monitor flaky tests
- Optimize slow tests
- Regular browser updates

### Accessibility Compliance

This project uses Playwright and axe-core for automated accessibility testing.

#### Running Accessibility Tests

To run the accessibility tests, use the following command:

\`\`\`bash
npm run test:e2e:accessibility
\`\`\`

This command executes the tests defined in `e2e/accessibility.spec.ts`, which uses axe-core to scan the application for accessibility violations.

#### Writing Accessibility Tests

The `e2e/accessibility.spec.ts` file contains examples of how to write accessibility tests using Playwright and axe-core. Here’s a basic example:

\`\`\`typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('should not have accessibility violations on the home page', async ({ page }) => {
  await page.goto('/');
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
\`\`\`

This test navigates to the home page (`/`) and uses `AxeBuilder` to analyze the page for accessibility violations. The test then asserts that there are no violations.

#### Manual Accessibility Testing Guidelines

In addition to automated testing, manual accessibility testing is crucial for ensuring a fully accessible application. Here are some guidelines for manual testing:

1. **Keyboard Navigation**:
   - Ensure all interactive elements can be reached using the keyboard.
   - Verify the focus order is logical and intuitive.
   - Test for proper focus indicators on interactive elements.
2. **Screen Reader Compatibility**:
   - Use a screen reader (e.g., NVDA, VoiceOver) to navigate the application.
   - Verify that all meaningful content is properly announced.
   - Ensure that ARIA attributes are correctly implemented to provide additional context.
3. **Color Contrast**:
   - Check that text and interactive elements have sufficient color contrast.
   - Use tools like the [WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/) to verify contrast ratios.
4. **Image Alt Text**:
   - Ensure all images have descriptive `alt` text, unless they are purely decorative.
   - Verify that `alt` text accurately conveys the image's content and purpose.
5. **Form Labels**:
   - Ensure all form fields have clear and properly associated labels.
   - Verify that labels are correctly linked to their corresponding input elements.
6. **Semantic HTML**:
   - Use semantic HTML elements (e.g., `<article>`, `<nav>`, `<aside>`) to structure content.
   - Ensure proper use of headings (`<h1>` to `<h6>`) to create a logical document outline.
7. **ARIA Attributes**:
   - Use ARIA attributes to enhance accessibility for dynamic content and interactive components.
   - Verify that ARIA attributes are correctly implemented and provide meaningful information.
8. **Zoom and Text Resizing**:
   - Test the application at different zoom levels (e.g., 200%, 400%) to ensure content remains readable and usable.
   - Verify that text can be resized without losing functionality or content.

By combining automated and manual accessibility testing, we can ensure that the GeoMiner AI platform is accessible to all users, regardless of their abilities.
