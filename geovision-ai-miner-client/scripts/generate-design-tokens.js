#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Figma API configuration
const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;

// Design tokens from Figma config
const designTokens = {
  colors: {
    primary: '#1976d2',
    secondary: '#dc004e',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    geological: {
      rock: '#8B4513',
      mineral: '#FFD700',
      soil: '#DEB887',
      water: '#4682B4'
    }
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    fontSizes: {
      h1: '2.5rem',
      h2: '2rem',
      h3: '1.75rem',
      body: '1rem',
      caption: '0.875rem'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  }
};

// Generate CSS variables
function generateCSSVariables() {
  let css = ':root {\n';
  
  // Colors
  Object.entries(designTokens.colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      css += `  --color-${key}: ${value};\n`;
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) => {
        css += `  --color-${key}-${subKey}: ${subValue};\n`;
      });
    }
  });
  
  // Typography
  css += `  --font-family: ${designTokens.typography.fontFamily};\n`;
  Object.entries(designTokens.typography.fontSizes).forEach(([key, value]) => {
    css += `  --font-size-${key}: ${value};\n`;
  });
  
  // Spacing
  Object.entries(designTokens.spacing).forEach(([key, value]) => {
    css += `  --spacing-${key}: ${value};\n`;
  });
  
  css += '}\n';
  return css;
}

// Generate TypeScript types
function generateTypeScriptTypes() {
  let types = 'export interface DesignTokens {\n';
  types += '  colors: {\n';
  types += '    primary: string;\n';
  types += '    secondary: string;\n';
  types += '    success: string;\n';
  types += '    warning: string;\n';
  types += '    error: string;\n';
  types += '    geological: {\n';
  types += '      rock: string;\n';
  types += '      mineral: string;\n';
  types += '      soil: string;\n';
  types += '      water: string;\n';
  types += '    };\n';
  types += '  };\n';
  types += '  typography: {\n';
  types += '    fontFamily: string;\n';
  types += '    fontSizes: {\n';
  types += '      h1: string;\n';
  types += '      h2: string;\n';
  types += '      h3: string;\n';
  types += '      body: string;\n';
  types += '      caption: string;\n';
  types += '    };\n';
  types += '  };\n';
  types += '  spacing: {\n';
  types += '    xs: string;\n';
  types += '    sm: string;\n';
  types += '    md: string;\n';
  types += '    lg: string;\n';
  types += '    xl: string;\n';
  types += '  };\n';
  types += '}\n\n';
  
  types += 'export const designTokens: DesignTokens = ' + JSON.stringify(designTokens, null, 2) + ';\n';
  return types;
}

// Generate utility classes
function generateUtilityClasses() {
  let utilities = '';
  
  // Color utilities
  Object.entries(designTokens.colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      utilities += `.text-${key} { color: var(--color-${key}); }\n`;
      utilities += `.bg-${key} { background-color: var(--color-${key}); }\n`;
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([subKey, subValue]) => {
        utilities += `.text-${key}-${subKey} { color: var(--color-${key}-${subKey}); }\n`;
        utilities += `.bg-${key}-${subKey} { background-color: var(--color-${key}-${subKey}); }\n`;
      });
    }
  });
  
  // Spacing utilities
  Object.entries(designTokens.spacing).forEach(([key, value]) => {
    utilities += `.p-${key} { padding: var(--spacing-${key}); }\n`;
    utilities += `.m-${key} { margin: var(--spacing-${key}); }\n`;
  });
  
  return utilities;
}

// Main execution
function main() {
  console.log('🎨 Generating design tokens from Figma configuration...');
  
  // Create output directory
  const outputDir = path.join(__dirname, '..', 'src', 'styles');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate and write files
  const cssVariables = generateCSSVariables();
  const typescriptTypes = generateTypeScriptTypes();
  const utilityClasses = generateUtilityClasses();
  
  // Write CSS variables
  fs.writeFileSync(
    path.join(outputDir, 'design-tokens.css'),
    cssVariables + '\n' + utilityClasses
  );
  
  // Write TypeScript types
  fs.writeFileSync(
    path.join(outputDir, 'design-tokens.ts'),
    typescriptTypes
  );
  
  console.log('✅ Design tokens generated successfully!');
  console.log('📁 Files created:');
  console.log('  - src/styles/design-tokens.css');
  console.log('  - src/styles/design-tokens.ts');
}

if (require.main === module) {
  main();
}

module.exports = {
  generateCSSVariables,
  generateTypeScriptTypes,
  generateUtilityClasses
}; 