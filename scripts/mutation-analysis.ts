#!/usr/bin/env ts-node

import fs from "fs"
import path from "path"

interface MutationResult {
  id: string
  mutatorName: string
  replacement: string
  fileName: string
  location: {
    start: { line: number; column: number }
    end: { line: number; column: number }
  }
  status: "Killed" | "Survived" | "Timeout" | "NoCoverage" | "RuntimeError"
  statusReason?: string
  testsRan?: string[]
  killedBy?: string[]
  coveredBy?: string[]
}

interface MutationReport {
  mutationScore: number
  totalMutants: number
  killedMutants: number
  survivedMutants: number
  timeoutMutants: number
  noCoverageMutants: number
  runtimeErrorMutants: number
  files: Record<
    string,
    {
      mutants: MutationResult[]
      mutationScore: number
    }
  >
}

interface AnalysisFindings {
  criticalIssues: Issue[]
  moderateIssues: Issue[]
  minorIssues: Issue[]
  recommendations: Recommendation[]
  summary: Summary
}

interface Issue {
  severity: "critical" | "moderate" | "minor"
  category: string
  description: string
  affectedFiles: string[]
  survivedMutants: number
  examples: string[]
  impact: string
}

interface Recommendation {
  priority: "high" | "medium" | "low"
  category: string
  action: string
  rationale: string
  estimatedEffort: string
  expectedImprovement: string
}

interface Summary {
  overallScore: number
  totalIssues: number
  highPriorityActions: number
  estimatedImprovementPotential: number
  riskAreas: string[]
}

class MutationAnalyzer {
  private reports: Map<string, MutationReport> = new Map()
  private reportsDir = "reports/mutation"

  constructor() {
    this.loadReports()
  }

  private loadReports(): void {
    const reportFiles = [
      { name: "components", file: "components-mutation-report.json" },
      { name: "lib", file: "lib-mutation-report.json" },
      { name: "full", file: "mutation-report.json" },
    ]

    reportFiles.forEach(({ name, file }) => {
      const reportPath = path.join(this.reportsDir, file)
      if (fs.existsSync(reportPath)) {
        try {
          const report = JSON.parse(fs.readFileSync(reportPath, "utf8"))
          this.reports.set(name, report)
          console.log(`✅ Loaded ${name} mutation report (Score: ${report.mutationScore?.toFixed(2)}%)`)
        } catch (error) {
          console.warn(`⚠️  Failed to load ${name} report:`, error)
        }
      } else {
        console.warn(`⚠️  Report not found: ${reportPath}`)
      }
    })
  }

  analyze(): AnalysisFindings {
    const findings: AnalysisFindings = {
      criticalIssues: [],
      moderateIssues: [],
      minorIssues: [],
      recommendations: [],
      summary: {
        overallScore: 0,
        totalIssues: 0,
        highPriorityActions: 0,
        estimatedImprovementPotential: 0,
        riskAreas: [],
      },
    }

    // Analyze each report
    this.reports.forEach((report, reportName) => {
      this.analyzeReport(report, reportName, findings)
    })

    // Generate summary
    this.generateSummary(findings)

    return findings
  }

  private analyzeReport(report: MutationReport, reportName: string, findings: AnalysisFindings): void {
    console.log(`\n🔍 Analyzing ${reportName} mutation report...`)

    // Analyze survived mutants by category
    this.analyzeSurvivedMutants(report, reportName, findings)

    // Analyze no coverage mutants
    this.analyzeNoCoverageMutants(report, reportName, findings)

    // Analyze timeout mutants
    this.analyzeTimeoutMutants(report, reportName, findings)

    // Analyze file-specific issues
    this.analyzeFileSpecificIssues(report, reportName, findings)

    // Generate recommendations
    this.generateRecommendations(report, reportName, findings)
  }

  private analyzeSurvivedMutants(report: MutationReport, reportName: string, findings: AnalysisFindings): void {
    const survivedByMutator: Record<string, MutationResult[]> = {}
    const survivedByFile: Record<string, MutationResult[]> = {}

    Object.values(report.files).forEach((file) => {
      file.mutants
        .filter((mutant) => mutant.status === "Survived")
        .forEach((mutant) => {
          // Group by mutator
          if (!survivedByMutator[mutant.mutatorName]) {
            survivedByMutator[mutant.mutatorName] = []
          }
          survivedByMutator[mutant.mutatorName].push(mutant)

          // Group by file
          if (!survivedByFile[mutant.fileName]) {
            survivedByFile[mutant.fileName] = []
          }
          survivedByFile[mutant.fileName].push(mutant)
        })
    })

    // Analyze critical mutator patterns
    this.analyzeCriticalMutators(survivedByMutator, reportName, findings)

    // Analyze problematic files
    this.analyzeProblematicFiles(survivedByFile, reportName, findings)
  }

  private analyzeCriticalMutators(
    survivedByMutator: Record<string, MutationResult[]>,
    reportName: string,
    findings: AnalysisFindings,
  ): void {
    const criticalMutators = [
      "ConditionalExpression",
      "EqualityOperator",
      "LogicalOperator",
      "ArithmeticOperator",
      "UpdateOperator",
    ]

    criticalMutators.forEach((mutatorName) => {
      const survived = survivedByMutator[mutatorName] || []
      if (survived.length > 0) {
        const severity = survived.length > 5 ? "critical" : survived.length > 2 ? "moderate" : "minor"

        const issue: Issue = {
          severity,
          category: "Logic Testing",
          description: `${mutatorName} mutations survived, indicating weak logic testing`,
          affectedFiles: [...new Set(survived.map((m) => m.fileName))],
          survivedMutants: survived.length,
          examples: survived.slice(0, 3).map((m) => `${m.fileName}:${m.location.start.line} - ${m.replacement}`),
          impact: this.getImpactDescription(mutatorName, survived.length),
        }

        if (severity === "critical") {
          findings.criticalIssues.push(issue)
        } else if (severity === "moderate") {
          findings.moderateIssues.push(issue)
        } else {
          findings.minorIssues.push(issue)
        }
      }
    })
  }

  private analyzeProblematicFiles(
    survivedByFile: Record<string, MutationResult[]>,
    reportName: string,
    findings: AnalysisFindings,
  ): void {
    Object.entries(survivedByFile).forEach(([fileName, survived]) => {
      if (survived.length > 3) {
        const severity = survived.length > 10 ? "critical" : survived.length > 6 ? "moderate" : "minor"

        const issue: Issue = {
          severity,
          category: "File Coverage",
          description: `High number of survived mutants in ${path.basename(fileName)}`,
          affectedFiles: [fileName],
          survivedMutants: survived.length,
          examples: survived.slice(0, 3).map((m) => `Line ${m.location.start.line}: ${m.mutatorName}`),
          impact: `File may have insufficient test coverage or weak assertions`,
        }

        if (severity === "critical") {
          findings.criticalIssues.push(issue)
        } else if (severity === "moderate") {
          findings.moderateIssues.push(issue)
        } else {
          findings.minorIssues.push(issue)
        }
      }
    })
  }

  private analyzeNoCoverageMutants(report: MutationReport, reportName: string, findings: AnalysisFindings): void {
    if (report.noCoverageMutants > 0) {
      const noCoverageFiles: string[] = []

      Object.values(report.files).forEach((file) => {
        const noCoverageMutants = file.mutants.filter((m) => m.status === "NoCoverage")
        if (noCoverageMutants.length > 0) {
          noCoverageFiles.push(...noCoverageMutants.map((m) => m.fileName))
        }
      })

      const uniqueFiles = [...new Set(noCoverageFiles)]
      const severity = report.noCoverageMutants > 20 ? "critical" : report.noCoverageMutants > 10 ? "moderate" : "minor"

      const issue: Issue = {
        severity,
        category: "Test Coverage",
        description: `${report.noCoverageMutants} mutants have no test coverage`,
        affectedFiles: uniqueFiles,
        survivedMutants: report.noCoverageMutants,
        examples: uniqueFiles.slice(0, 3),
        impact: "Dead code or missing test coverage for important functionality",
      }

      if (severity === "critical") {
        findings.criticalIssues.push(issue)
      } else if (severity === "moderate") {
        findings.moderateIssues.push(issue)
      } else {
        findings.minorIssues.push(issue)
      }
    }
  }

  private analyzeTimeoutMutants(report: MutationReport, reportName: string, findings: AnalysisFindings): void {
    if (report.timeoutMutants > report.totalMutants * 0.1) {
      const issue: Issue = {
        severity: "moderate",
        category: "Test Performance",
        description: `High number of timeout mutants (${report.timeoutMutants})`,
        affectedFiles: [],
        survivedMutants: report.timeoutMutants,
        examples: ["Tests may be too slow or have infinite loops"],
        impact: "Slow test execution and potential reliability issues",
      }

      findings.moderateIssues.push(issue)
    }
  }

  private analyzeFileSpecificIssues(report: MutationReport, reportName: string, findings: AnalysisFindings): void {
    // Analyze specific patterns in key files
    const keyFiles = ["auth-context", "api.ts", "dashboard", "ai-analysis-panel", "geological-map", "dataset-manager"]

    Object.entries(report.files).forEach(([fileName, fileReport]) => {
      const isKeyFile = keyFiles.some((key) => fileName.includes(key))
      if (isKeyFile && fileReport.mutationScore < 70) {
        const issue: Issue = {
          severity: "critical",
          category: "Critical Component",
          description: `Low mutation score in critical file: ${path.basename(fileName)}`,
          affectedFiles: [fileName],
          survivedMutants: fileReport.mutants.filter((m) => m.status === "Survived").length,
          examples: [`Mutation score: ${fileReport.mutationScore.toFixed(2)}%`],
          impact: "Critical business logic may not be properly tested",
        }

        findings.criticalIssues.push(issue)
      }
    })
  }

  private generateRecommendations(report: MutationReport, reportName: string, findings: AnalysisFindings): void {
    // High priority recommendations
    if (report.mutationScore < 60) {
      findings.recommendations.push({
        priority: "high",
        category: "Overall Quality",
        action: `Improve overall test quality for ${reportName}`,
        rationale: `Mutation score of ${report.mutationScore.toFixed(2)}% is below acceptable threshold`,
        estimatedEffort: "2-3 sprints",
        expectedImprovement: "20-30% mutation score increase",
      })
    }

    if (report.noCoverageMutants > 10) {
      findings.recommendations.push({
        priority: "high",
        category: "Test Coverage",
        action: "Add tests for uncovered code paths",
        rationale: `${report.noCoverageMutants} mutants have no test coverage`,
        estimatedEffort: "1-2 sprints",
        expectedImprovement: "10-15% mutation score increase",
      })
    }

    // Medium priority recommendations
    if (report.survivedMutants > report.totalMutants * 0.3) {
      findings.recommendations.push({
        priority: "medium",
        category: "Test Assertions",
        action: "Strengthen test assertions and edge case testing",
        rationale: "High number of survived mutants indicates weak assertions",
        estimatedEffort: "1 sprint",
        expectedImprovement: "10-20% mutation score increase",
      })
    }

    // Low priority recommendations
    if (report.timeoutMutants > 5) {
      findings.recommendations.push({
        priority: "low",
        category: "Test Performance",
        action: "Optimize test performance to reduce timeouts",
        rationale: "Timeout mutants indicate slow or problematic tests",
        estimatedEffort: "0.5 sprint",
        expectedImprovement: "Improved test reliability",
      })
    }
  }

  private generateSummary(findings: AnalysisFindings): void {
    const totalIssues = findings.criticalIssues.length + findings.moderateIssues.length + findings.minorIssues.length
    const highPriorityActions = findings.recommendations.filter((r) => r.priority === "high").length

    // Calculate overall score from all reports
    const scores = Array.from(this.reports.values()).map((r) => r.mutationScore)
    const overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

    // Estimate improvement potential
    const estimatedImprovement = Math.min(95 - overallScore, 30) // Cap at 30% improvement

    // Identify risk areas
    const riskAreas: string[] = []
    if (findings.criticalIssues.some((i) => i.category === "Logic Testing")) {
      riskAreas.push("Business Logic")
    }
    if (findings.criticalIssues.some((i) => i.category === "Critical Component")) {
      riskAreas.push("Core Components")
    }
    if (findings.criticalIssues.some((i) => i.category === "Test Coverage")) {
      riskAreas.push("Code Coverage")
    }

    findings.summary = {
      overallScore,
      totalIssues,
      highPriorityActions,
      estimatedImprovementPotential: estimatedImprovement,
      riskAreas,
    }
  }

  private getImpactDescription(mutatorName: string, count: number): string {
    const impacts: Record<string, string> = {
      ConditionalExpression: "Conditional logic may not be properly tested, leading to incorrect branching",
      EqualityOperator: "Equality comparisons may be flawed, causing incorrect data validation",
      LogicalOperator: "Boolean logic errors could lead to security or functional issues",
      ArithmeticOperator: "Mathematical calculations may be incorrect, affecting business logic",
      UpdateOperator: "Increment/decrement operations may be wrong, causing state issues",
    }

    const baseImpact = impacts[mutatorName] || "Unknown impact"
    const severity = count > 5 ? " (HIGH RISK)" : count > 2 ? " (MEDIUM RISK)" : " (LOW RISK)"

    return baseImpact + severity
  }

  generateReport(findings: AnalysisFindings): string {
    const report = `
# Mutation Testing Analysis Report

## Executive Summary

**Overall Mutation Score:** ${findings.summary.overallScore.toFixed(2)}%
**Total Issues Identified:** ${findings.summary.totalIssues}
**High Priority Actions:** ${findings.summary.highPriorityActions}
**Estimated Improvement Potential:** +${findings.summary.estimatedImprovementPotential.toFixed(1)}%

### Risk Areas
${findings.summary.riskAreas.map((area) => `- ${area}`).join("\n")}

## Critical Issues (${findings.criticalIssues.length})

${findings.criticalIssues
  .map(
    (issue) => `
### ${issue.category}: ${issue.description}
- **Severity:** ${issue.severity.toUpperCase()}
- **Survived Mutants:** ${issue.survivedMutants}
- **Affected Files:** ${issue.affectedFiles.length}
- **Impact:** ${issue.impact}
- **Examples:**
${issue.examples.map((ex) => `  - ${ex}`).join("\n")}
`,
  )
  .join("\n")}

## Moderate Issues (${findings.moderateIssues.length})

${findings.moderateIssues
  .map(
    (issue) => `
### ${issue.category}: ${issue.description}
- **Survived Mutants:** ${issue.survivedMutants}
- **Affected Files:** ${issue.affectedFiles.length}
- **Impact:** ${issue.impact}
`,
  )
  .join("\n")}

## Recommendations

### High Priority
${findings.recommendations
  .filter((r) => r.priority === "high")
  .map(
    (rec) => `
#### ${rec.category}: ${rec.action}
- **Rationale:** ${rec.rationale}
- **Estimated Effort:** ${rec.estimatedEffort}
- **Expected Improvement:** ${rec.expectedImprovement}
`,
  )
  .join("\n")}

### Medium Priority
${findings.recommendations
  .filter((r) => r.priority === "medium")
  .map(
    (rec) => `
#### ${rec.category}: ${rec.action}
- **Rationale:** ${rec.rationale}
- **Estimated Effort:** ${rec.estimatedEffort}
- **Expected Improvement:** ${rec.expectedImprovement}
`,
  )
  .join("\n")}

### Low Priority
${findings.recommendations
  .filter((r) => r.priority === "low")
  .map(
    (rec) => `
#### ${rec.category}: ${rec.action}
- **Rationale:** ${rec.rationale}
- **Estimated Effort:** ${rec.estimatedEffort}
- **Expected Improvement:** ${rec.expectedImprovement}
`,
  )
  .join("\n")}

## Detailed Analysis by Component

${Array.from(this.reports.entries())
  .map(
    ([name, report]) => `
### ${name.charAt(0).toUpperCase() + name.slice(1)} Component
- **Mutation Score:** ${report.mutationScore.toFixed(2)}%
- **Total Mutants:** ${report.totalMutants}
- **Killed:** ${report.killedMutants}
- **Survived:** ${report.survivedMutants}
- **No Coverage:** ${report.noCoverageMutants}
- **Timeouts:** ${report.timeoutMutants}
`,
  )
  .join("\n")}

---
*Report generated on ${new Date().toISOString()}*
    `

    return report
  }

  saveReport(findings: AnalysisFindings): void {
    const report = this.generateReport(findings)
    const reportPath = path.join(this.reportsDir, "mutation-analysis-report.md")

    fs.writeFileSync(reportPath, report)
    console.log(`\n📄 Analysis report saved to: ${reportPath}`)

    // Also save JSON for programmatic access
    const jsonPath = path.join(this.reportsDir, "mutation-analysis-findings.json")
    fs.writeFileSync(jsonPath, JSON.stringify(findings, null, 2))
    console.log(`📄 JSON findings saved to: ${jsonPath}`)
  }
}

// CLI interface
async function main() {
  console.log("🧬 Starting mutation testing analysis...")

  const analyzer = new MutationAnalyzer()
  const findings = analyzer.analyze()

  console.log("\n" + "=".repeat(60))
  console.log("MUTATION TESTING ANALYSIS COMPLETE")
  console.log("=".repeat(60))

  console.log(`\n📊 Overall Score: ${findings.summary.overallScore.toFixed(2)}%`)
  console.log(`🚨 Critical Issues: ${findings.criticalIssues.length}`)
  console.log(`⚠️  Moderate Issues: ${findings.moderateIssues.length}`)
  console.log(`ℹ️  Minor Issues: ${findings.minorIssues.length}`)
  console.log(`🎯 High Priority Actions: ${findings.summary.highPriorityActions}`)

  if (findings.summary.riskAreas.length > 0) {
    console.log(`\n🔴 Risk Areas:`)
    findings.summary.riskAreas.forEach((area) => console.log(`   - ${area}`))
  }

  analyzer.saveReport(findings)

  // Exit with appropriate code
  const exitCode = findings.criticalIssues.length > 0 ? 1 : 0
  process.exit(exitCode)
}

if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Analysis failed:", error)
    process.exit(1)
  })
}

export { MutationAnalyzer }
