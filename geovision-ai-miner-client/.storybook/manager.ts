import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';

const theme = create({
  base: 'dark',
  brandTitle: 'GeoVision AI Miner',
  brandUrl: 'https://geo-miner.com',
  brandImage: undefined,
  brandTarget: '_self',

  // Color palette
  colorPrimary: '#1976d2',
  colorSecondary: '#dc004e',

  // UI
  appBg: '#1a1a2e',
  appContentBg: '#16213e',
  appBorderColor: '#0f3460',
  appBorderRadius: 8,

  // Text colors
  textColor: '#ffffff',
  textInverseColor: '#000000',

  // Toolbar default and active colors
  barTextColor: '#94a3b8',
  barSelectedColor: '#1976d2',
  barBg: '#16213e',

  // Form colors
  inputBg: '#2d3748',
  inputBorder: '#4a5568',
  inputTextColor: '#ffffff',
  inputBorderRadius: 4,
});

addons.setConfig({
  theme,
  sidebar: {
    showRoots: true,
  },
  panelPosition: 'bottom',
}); 