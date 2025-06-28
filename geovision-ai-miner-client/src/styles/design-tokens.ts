export interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    geological: {
      rock: string;
      mineral: string;
      soil: string;
      water: string;
    };
  };
  typography: {
    fontFamily: string;
    fontSizes: {
      h1: string;
      h2: string;
      h3: string;
      body: string;
      caption: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export const designTokens: DesignTokens = {
  "colors": {
    "primary": "#1976d2",
    "secondary": "#dc004e",
    "success": "#4caf50",
    "warning": "#ff9800",
    "error": "#f44336",
    "geological": {
      "rock": "#8B4513",
      "mineral": "#FFD700",
      "soil": "#DEB887",
      "water": "#4682B4"
    }
  },
  "typography": {
    "fontFamily": "Roboto, sans-serif",
    "fontSizes": {
      "h1": "2.5rem",
      "h2": "2rem",
      "h3": "1.75rem",
      "body": "1rem",
      "caption": "0.875rem"
    }
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem",
    "xl": "2rem"
  }
};
