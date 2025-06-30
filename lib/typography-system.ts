import { designTokens } from "./design-tokens"

export const typographySystem = {
  // Heading scales optimized for geological data
  headings: {
    h1: {
      fontSize: designTokens.typography.scales["4xl"],
      fontWeight: "700",
      lineHeight: "1.2",
      letterSpacing: "-0.025em",
      fontFamily: designTokens.typography.fontFamilies.primary.join(", "),
    },
    h2: {
      fontSize: designTokens.typography.scales["3xl"],
      fontWeight: "600",
      lineHeight: "1.3",
      letterSpacing: "-0.015em",
      fontFamily: designTokens.typography.fontFamilies.primary.join(", "),
    },
    h3: {
      fontSize: designTokens.typography.scales["2xl"],
      fontWeight: "600",
      lineHeight: "1.4",
      fontFamily: designTokens.typography.fontFamilies.primary.join(", "),
    },
    dataHeader: {
      fontSize: designTokens.typography.scales.lg,
      fontWeight: "500",
      lineHeight: "1.5",
      fontFamily: designTokens.typography.fontFamilies.mono.join(", "),
    },
  },

  // Body text optimized for readability in data-dense interfaces
  body: {
    large: {
      fontSize: designTokens.typography.scales.lg,
      fontWeight: "400",
      lineHeight: "1.6",
      fontFamily: designTokens.typography.fontFamilies.primary.join(", "),
    },
    base: {
      fontSize: designTokens.typography.scales.base,
      fontWeight: "400",
      lineHeight: "1.5",
      fontFamily: designTokens.typography.fontFamilies.primary.join(", "),
    },
    small: {
      fontSize: designTokens.typography.scales.sm,
      fontWeight: "400",
      lineHeight: "1.4",
      fontFamily: designTokens.typography.fontFamilies.primary.join(", "),
    },
    dataLabel: {
      fontSize: designTokens.typography.scales.xs,
      fontWeight: "500",
      lineHeight: "1.3",
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
      fontFamily: designTokens.typography.fontFamilies.primary.join(", "),
    },
  },

  // Specialized text for geological data
  data: {
    coordinate: {
      fontSize: designTokens.typography.scales.sm,
      fontWeight: "400",
      lineHeight: "1.4",
      fontFamily: designTokens.typography.fontFamilies.mono.join(", "),
    },
    measurement: {
      fontSize: designTokens.typography.scales.base,
      fontWeight: "600",
      lineHeight: "1.2",
      fontFamily: designTokens.typography.fontFamilies.mono.join(", "),
    },
    percentage: {
      fontSize: designTokens.typography.scales.lg,
      fontWeight: "700",
      lineHeight: "1.1",
      fontFamily: designTokens.typography.fontFamilies.mono.join(", "),
    },
  },
}

export type TypographyVariant =
  | keyof typeof typographySystem.headings
  | keyof typeof typographySystem.body
  | keyof typeof typographySystem.data
