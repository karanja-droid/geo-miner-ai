/**
 * Helper utilities for mutation testing
 */

export interface MutationTestResult {
  mutationScore: number
  totalMutants: number
  killedMutants: number
  survivedMutants: number
  timeoutMutants: number
  noCoverageMutants: number
}

export interface MutationThresholds {
  high: number
  low: number
  break: number
}

export class MutationTestAnalyzer {
  static analyzeResults(results: MutationTestResult): {
    status: "excellent" | "good" | "needs-improvement" | "poor"
    recommendations: string[]
  } {
    const { mutationScore } = results
    let status: "excellent" | "good" | "needs-improvement" | "poor"
    const recommendations: string[] = []

    if (mutationScore >= 90) {
      status = "excellent"
      recommendations.push("Excellent mutation score! Your tests are very effective.")
    } else if (mutationScore >= 80) {
      status = "good"
      recommendations.push("Good mutation score. Consider adding edge case tests.")
    } else if (mutationScore >= 60) {
      status = "needs-improvement"
      recommendations.push("Mutation score needs improvement. Focus on testing business logic.")
      recommendations.push("Add tests for error conditions and edge cases.")
    } else {
      status = "poor"
      recommendations.push("Low mutation score indicates weak test coverage.")
      recommendations.push("Review and strengthen your test suite.")
      recommendations.push("Focus on testing critical business logic paths.")
    }

    if (results.noCoverageMutants > 0) {
      recommendations.push(`${results.noCoverageMutants} mutants have no test coverage. Add tests for uncovered code.`)
    }

    if (results.timeoutMutants > results.totalMutants * 0.1) {
      recommendations.push("High number of timeout mutants. Consider optimizing test performance.")
    }

    return { status, recommendations }
  }

  static generateReport(results: MutationTestResult): string {
    const analysis = this.analyzeResults(results)

    return `
Mutation Testing Report
======================

Mutation Score: ${results.mutationScore.toFixed(2)}%
Status: ${analysis.status.toUpperCase()}

Mutant Statistics:
- Total Mutants: ${results.totalMutants}
- Killed: ${results.killedMutants}
- Survived: ${results.survivedMutants}
- Timeout: ${results.timeoutMutants}
- No Coverage: ${results.noCoverageMutants}

Recommendations:
${analysis.recommendations.map((rec) => `- ${rec}`).join("\n")}
    `
  }
}

export const MUTATION_THRESHOLDS: Record<string, MutationThresholds> = {
  components: {
    high: 85,
    low: 70,
    break: 60,
  },
  lib: {
    high: 90,
    low: 80,
    break: 70,
  },
  utils: {
    high: 95,
    low: 85,
    break: 75,
  },
  default: {
    high: 80,
    low: 60,
    break: 50,
  },
}

export function getMutationThreshold(filePath: string): MutationThresholds {
  if (filePath.includes("/components/")) {
    return MUTATION_THRESHOLDS.components
  }
  if (filePath.includes("/lib/")) {
    return MUTATION_THRESHOLDS.lib
  }
  if (filePath.includes("/utils/")) {
    return MUTATION_THRESHOLDS.utils
  }
  return MUTATION_THRESHOLDS.default
}
