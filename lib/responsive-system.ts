export const responsiveSystem = {
  breakpoints: {
    mobile: "320px",
    mobileLarge: "425px",
    tablet: "768px",
    laptop: "1024px",
    desktop: "1440px",
    desktopLarge: "2560px",
  },

  // Geological data specific responsive rules
  dataDisplay: {
    mobile: {
      charts: {
        height: "200px",
        fontSize: "12px",
        padding: "8px",
      },
      tables: {
        fontSize: "12px",
        cellPadding: "4px",
        hideColumns: ["metadata", "details"],
      },
      cards: {
        padding: "12px",
        gap: "8px",
      },
    },
    tablet: {
      charts: {
        height: "300px",
        fontSize: "14px",
        padding: "16px",
      },
      tables: {
        fontSize: "14px",
        cellPadding: "8px",
        hideColumns: ["details"],
      },
      cards: {
        padding: "16px",
        gap: "12px",
      },
    },
    desktop: {
      charts: {
        height: "400px",
        fontSize: "16px",
        padding: "24px",
      },
      tables: {
        fontSize: "14px",
        cellPadding: "12px",
        hideColumns: [],
      },
      cards: {
        padding: "24px",
        gap: "16px",
      },
    },
  },

  // Component-specific responsive behavior
  components: {
    navigation: {
      mobile: "collapsed",
      tablet: "horizontal",
      desktop: "full",
    },
    sidebar: {
      mobile: "hidden",
      tablet: "overlay",
      desktop: "fixed",
    },
    dashboard: {
      mobile: "1-column",
      tablet: "2-column",
      desktop: "3-column",
    },
  },
}
