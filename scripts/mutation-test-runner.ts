#!/usr/bin/env ts-node

import { execSync } from "child_process"
import fs from "fs"
import path from "path"

interface MutationConfig {
  name: string
  configFile: string
  description: string
  thresholds: {
    high: number
    low: number
    break: number
  }
}

const MUTATION_CONFIGS: MutationConfig[] = [
  {
    name: "components",
    configFile: "stryker.components.conf.json",
    description: "React components mutation testing",
    thresholds: { high: 85, low: 70, break: 60 },
  },
  {
    name: "lib",
    configFile: "stryker.lib.conf.json",
    description: "Library functions mutation testing",
    thresholds: { high: 90, low: 80, break: 70 },
  },
  {
    name: "full",
    configFile: "stryker.conf.json",
    description: "Full codebase mutation testing",
    thresholds: { high: 80, low: 60, break: 50 },
  },
]

class MutationTestRunner {
  private reportsDir = "reports/mutation"

  constructor() {
    this.ensureReportsDirectory()
  }

  private ensureReportsDirectory() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true })
    }
  }

  async runMutationTest(config: MutationConfig): Promise<void> {
    console.log(`\n🧬 Running mutation testing: ${config.description}`)
    console.log(`📁 Config: ${config.configFile}`)
    console.log(
      `🎯 Thresholds: High=${config.thresholds.high}%, Low=${config.thresholds.low}%, Break=${config.thresholds.break}%`,
    )

    try {
      const command = `npx stryker run --configFile ${config.configFile}`
      console.log(`\n⚡ Executing: ${command}`)

      execSync(command, {
        stdio: "inherit",
        cwd: process.cwd(),
      })

      console.log(`✅ Mutation testing completed for ${config.name}`)
      this.generateSummaryReport(config)
    } catch (error) {
      console.error(`❌ Mutation testing failed for ${config.name}:`, error)
      throw error
    }
  }

  private generateSummaryReport(config: MutationConfig): void {
    const reportPath = path.join(this.reportsDir, `${config.name}-mutation-report.json`)

    if (fs.existsSync(reportPath)) {
      try {
        const report = JSON.parse(fs.readFileSync(reportPath, "utf8"))
        const mutationScore = report.mutationScore || 0

        console.log(`\n📊 Mutation Score: ${mutationScore.toFixed(2)}%`)

        if (mutationScore >= config.thresholds.high) {
          console.log("🎉 Excellent! Your tests are very effective.")
        } else if (mutationScore >= config.thresholds.low) {
          console.log("👍 Good mutation score. Consider adding more edge case tests.")
        } else if (mutationScore >= config.thresholds.break) {
          console.log("⚠️  Mutation score needs improvement. Focus on testing business logic.")
        } else {
          console.log("🚨 Low mutation score. Your test suite needs significant improvement.")
        }
      } catch (error) {
        console.warn(`⚠️  Could not parse mutation report: ${error}`)
      }
    }
  }

  async runAll(): Promise<void> {
    console.log("🧬 Starting comprehensive mutation testing...")

    for (const config of MUTATION_CONFIGS) {
      await this.runMutationTest(config)
    }

    console.log("\n🎯 All mutation tests completed!")
    this.generateOverallSummary()
  }

  async runSpecific(configName: string): Promise<void> {
    const config = MUTATION_CONFIGS.find((c) => c.name === configName)

    if (!config) {
      console.error(`❌ Unknown mutation test config: ${configName}`)
      console.log(`Available configs: ${MUTATION_CONFIGS.map((c) => c.name).join(", ")}`)
      process.exit(1)
    }

    await this.runMutationTest(config)
  }

  private generateOverallSummary(): void {
    console.log("\n📈 Overall Mutation Testing Summary")
    console.log("=".repeat(50))

    MUTATION_CONFIGS.forEach((config) => {
      const reportPath = path.join(this.reportsDir, `${config.name}-mutation-report.json`)

      if (fs.existsSync(reportPath)) {
        try {
          const report = JSON.parse(fs.readFileSync(reportPath, "utf8"))
          const mutationScore = report.mutationScore || 0
          const status =
            mutationScore >= config.thresholds.high ? "✅" : mutationScore >= config.thresholds.low ? "⚠️" : "❌"

          console.log(`${status} ${config.name.padEnd(15)} ${mutationScore.toFixed(2)}%`)
        } catch (error) {
          console.log(`❓ ${config.name.padEnd(15)} Report not found`)
        }
      }
    })
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const runner = new MutationTestRunner()

  if (args.length === 0) {
    await runner.runAll()
  } else {
    const configName = args[0]
    await runner.runSpecific(configName)
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Mutation testing failed:", error)
    process.exit(1)
  })
}

export { MutationTestRunner }
