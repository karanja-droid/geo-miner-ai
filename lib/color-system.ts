export const colorSystem = {
  // Geological formation colors based on industry standards
  geological: {
    formations: {
      sedimentary: {
        50: "#faf7f2",
        100: "#f3e9d4",
        200: "#e6d2a8",
        300: "#d6b577",
        400: "#c69850",
        500: "#b8833b",
        600: "#a66f32",
        700: "#8b5a2d",
        800: "#714a2b",
        900: "#5c3e26",
      },
      igneous: {
        50: "#fef2f2",
        100: "#fee2e2",
        200: "#fecaca",
        300: "#fca5a5",
        400: "#f87171",
        500: "#ef4444",
        600: "#dc2626",
        700: "#b91c1c",
        800: "#991b1b",
        900: "#7f1d1d",
      },
      metamorphic: {
        50: "#faf5ff",
        100: "#f3e8ff",
        200: "#e9d5ff",
        300: "#d8b4fe",
        400: "#c084fc",
        500: "#a855f7",
        600: "#9333ea",
        700: "#7c3aed",
        800: "#6b21a8",
        900: "#581c87",
      },
    },

    // Mineral-specific color coding
    minerals: {
      copper: {
        50: "#fef7ee",
        100: "#fdecd1",
        200: "#fad6a3",
        300: "#f7b96a",
        400: "#f39030",
        500: "#b87333",
        600: "#dc6803",
        700: "#b45309",
        800: "#92400e",
        900: "#78350f",
      },
      gold: {
        50: "#fefce8",
        100: "#fef9c3",
        200: "#fef08a",
        300: "#fde047",
        400: "#facc15",
        500: "#eab308",
        600: "#ca8a04",
        700: "#a16207",
        800: "#854d0e",
        900: "#713f12",
      },
      iron: {
        50: "#fef2f2",
        100: "#fee2e2",
        200: "#fecaca",
        300: "#fca5a5",
        400: "#f87171",
        500: "#a0522d",
        600: "#dc2626",
        700: "#b91c1c",
        800: "#991b1b",
        900: "#7f1d1d",
      },
      silver: {
        50: "#f8fafc",
        100: "#f1f5f9",
        200: "#e2e8f0",
        300: "#cbd5e1",
        400: "#94a3b8",
        500: "#64748b",
        600: "#475569",
        700: "#334155",
        800: "#1e293b",
        900: "#0f172a",
      },
    },
  },

  // Status and state colors
  status: {
    success: {
      50: "#f0fdf4",
      500: "#22c55e",
      700: "#15803d",
    },
    warning: {
      50: "#fffbeb",
      500: "#f59e0b",
      700: "#d97706",
    },
    error: {
      50: "#fef2f2",
      500: "#ef4444",
      700: "#dc2626",
    },
    info: {
      50: "#eff6ff",
      500: "#3b82f6",
      700: "#1d4ed8",
    },
  },

  // Data visualization colors optimized for accessibility
  dataVisualization: {
    categorical: [
      "#1f77b4", // Blue
      "#ff7f0e", // Orange
      "#2ca02c", // Green
      "#d62728", // Red
      "#9467bd", // Purple
      "#8c564b", // Brown
      "#e377c2", // Pink
      "#7f7f7f", // Gray
      "#bcbd22", // Olive
      "#17becf", // Cyan
    ],
    sequential: {
      blue: ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"],
      green: ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"],
      orange: ["#fff5eb", "#fee6ce", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#a63603", "#7f2704"],
    },
  },
}
