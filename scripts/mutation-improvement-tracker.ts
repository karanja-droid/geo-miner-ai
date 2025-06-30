#!/usr/bin/env ts-node

import fs from "fs"
import path from "path"

interface ImprovementTask {
  id: string
  title: string
  category: "conditional-logic" | "error-handling" | "state-management" | "form-validation" | "edge-cases"
  priority: "critical" | "high" | "medium" | "low"
  estimatedEffort: string
  expectedImprovement: string
  status: "not-started" | "in-progress" | "completed" | "blocked"
  assignee?: string
  dueDate?: string
  completedDate?: string
  beforeScore?: number
  afterScore?: number
  notes?: string[]
}

interface ImprovementPlan {
  version: string
  createdDate: string
  lastUpdated: string
  overallGoal: {
    currentScore: number
    targetScore: number
    deadline: string
  }
  tasks: ImprovementTask[]
  milestones: {
    name: string
    targetDate: string
    targetScore: number
    completed: boolean
  }[]
}

class MutationImprovementTracker {
  private planFile = "reports/mutation/improvement-plan.json"
  private plan: ImprovementPlan

  constructor() {
    this.plan = this.loadOrCreatePlan()
  }

  private loadOrCreatePlan(): ImprovementPlan {
    if (fs.existsSync(this.planFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.planFile, "utf8"))
      } catch (error) {
        console.warn("Failed to load existing plan, creating new one")
      }
    }

    return this.createDefaultPlan()
  }

  private createDefaultPlan(): ImprovementPlan {
    const now = new Date().toISOString()

    return {
      version: "1.0.0",
      createdDate: now,
      lastUpdated: now,
      overallGoal: {
        currentScore: 65,
        targetScore: 80,
        deadline: "2024-06-30",
      },
      tasks: [
        // Critical Priority Tasks
        {
          id: "auth-conditional-logic",
          title: "Strengthen conditional logic testing in authentication context",
          category: "conditional-logic",
          priority: "critical",
          estimatedEffort: "1 week",
          expectedImprovement: "+8% mutation score",
          status: "not-started",
        },
        {
          id: "api-error-handling",
          title: "Implement comprehensive error handling tests for API client",
          category: "error-handling",
          priority: "critical",
          estimatedEffort: "1.5 weeks",
          expectedImprovement: "+6% mutation score",
          status: "not-started",
        },
        {
          id: "dashboard-state-management",
          title: "Enhance state management testing in dashboard component",
          category: "state-management",
          priority: "critical",
          estimatedEffort: "1 week",
          expectedImprovement: "+5% mutation score",
          status: "not-started",
        },
        {
          id: "ai-analysis-validation",
          title: "Add comprehensive validation testing for AI analysis panel",
          category: "form-validation",
          priority: "high",
          estimatedEffort: "0.5 weeks",
          expectedImprovement: "+4% mutation score",
          status: "not-started",
        },
        // High Priority Tasks
        {
          id: "boundary-conditions",
          title: "Add boundary condition tests across all components",
          category: "edge-cases",
          priority: "high",
          estimatedEffort: "2 weeks",
          expectedImprovement: "+7% mutation score",
          status: "not-started",
        },
        {
          id: "dataset-manager-logic",
          title: "Improve logical operator testing in dataset manager",
          category: "conditional-logic",
          priority: "high",
          estimatedEffort: "1 week",
          expectedImprovement: "+3% mutation score",
          status: "not-started",
        },
        // Medium Priority Tasks
        {
          id: "form-edge-cases",
          title: "Test form validation edge cases and special characters",
          category: "form-validation",
          priority: "medium",
          estimatedEffort: "1 week",
          expectedImprovement: "+3% mutation score",
          status: "not-started",
        },
        {
          id: "component-props",
          title: "Test component prop handling and default values",
          category: "edge-cases",
          priority: "medium",
          estimatedEffort: "1.5 weeks",
          expectedImprovement: "+4% mutation score",
          status: "not-started",
        },
      ],
      milestones: [
        {
          name: "Phase 1: Critical Issues",
          targetDate: "2024-03-31",
          targetScore: 72,
          completed: false,
        },
        {
          name: "Phase 2: High-Impact Improvements",
          targetDate: "2024-05-15",
          targetScore: 77,
          completed: false,
        },
        {
          name: "Phase 3: Quality Refinement",
          targetDate: "2024-06-30",
          targetScore: 80,
          completed: false,
        },
      ],
    }
  }

  updateTask(taskId: string, updates: Partial<ImprovementTask>): void {
    const taskIndex = this.plan.tasks.findIndex((task) => task.id === taskId)
    if (taskIndex === -1) {
      throw new Error(`Task not found: ${taskId}`)
    }

    this.plan.tasks[taskIndex] = { ...this.plan.tasks[taskIndex], ...updates }
    this.plan.lastUpdated = new Date().toISOString()

    if (updates.status === "completed" && !updates.completedDate) {
      this.plan.tasks[taskIndex].completedDate = new Date().toISOString()
    }

    this.savePlan()
  }

  addNote(taskId: string, note: string): void {
    const task = this.plan.tasks.find((t) => t.id === taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    if (!task.notes) {
      task.notes = []
    }

    task.notes.push(`${new Date().toISOString()}: ${note}`)
    this.plan.lastUpdated = new Date().toISOString()
    this.savePlan()
  }

  getProgress(): {
    overall: number
    byPriority: Record<string, number>
    byCategory: Record<string, number>
    completedTasks: number
    totalTasks: number
  } {
    const totalTasks = this.plan.tasks.length
    const completedTasks = this.plan.tasks.filter((task) => task.status === "completed").length

    const byPriority: Record<string, number> = {}
    const byCategory: Record<string, number> = {}
    ;["critical", "high", "medium", "low"].forEach((priority) => {
      const priorityTasks = this.plan.tasks.filter((task) => task.priority === priority)
      const completedPriorityTasks = priorityTasks.filter((task) => task.status === "completed")
      byPriority[priority] = priorityTasks.length > 0 ? (completedPriorityTasks.length / priorityTasks.length) * 100 : 0
    })
    ;["conditional-logic", "error-handling", "state-management", "form-validation", "edge-cases"].forEach(
      (category) => {
        const categoryTasks = this.plan.tasks.filter((task) => task.category === category)
        const completedCategoryTasks = categoryTasks.filter((task) => task.status === "completed")
        byCategory[category] =
          categoryTasks.length > 0 ? (completedCategoryTasks.length / categoryTasks.length) * 100 : 0
      },
    )

    return {
      overall: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      byPriority,
      byCategory,
      completedTasks,
      totalTasks,
    }
  }

  generateStatusReport(): string {
    const progress = this.getProgress()
    const upcomingTasks = this.plan.tasks
      .filter((task) => task.status === "not-started" || task.status === "in-progress")
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      })
      .slice(0, 5)

    const blockedTasks = this.plan.tasks.filter((task) => task.status === "blocked")

    return `
# Mutation Testing Improvement Status Report

**Generated**: ${new Date().toISOString()}
**Overall Progress**: ${progress.overall.toFixed(1)}% (${progress.completedTasks}/${progress.totalTasks} tasks)

## Current Goal
- **Target Score**: ${this.plan.overallGoal.targetScore}%
- **Current Score**: ${this.plan.overallGoal.currentScore}%
- **Deadline**: ${this.plan.overallGoal.deadline}

## Progress by Priority
${Object.entries(progress.byPriority)
  .map(([priority, percent]) => `- **${priority.charAt(0).toUpperCase() + priority.slice(1)}**: ${percent.toFixed(1)}%`)
  .join("\n")}

## Progress by Category
${Object.entries(progress.byCategory)
  .map(([category, percent]) => `- **${category.replace("-", " ")}**: ${percent.toFixed(1)}%`)
  .join("\n")}

## Upcoming Tasks (Next 5)
${upcomingTasks
  .map(
    (task) => `
### ${task.title}
- **Priority**: ${task.priority}
- **Category**: ${task.category}
- **Effort**: ${task.estimatedEffort}
- **Expected Improvement**: ${task.expectedImprovement}
- **Status**: ${task.status}
${task.assignee ? `- **Assignee**: ${task.assignee}` : ""}
${task.dueDate ? `- **Due Date**: ${task.dueDate}` : ""}
`,
  )
  .join("\n")}

${
  blockedTasks.length > 0
    ? `
## Blocked Tasks (${blockedTasks.length})
${blockedTasks
  .map(
    (task) => `
### ${task.title}
- **Priority**: ${task.priority}
- **Reason**: ${task.notes?.slice(-1)[0] || "No reason provided"}
`,
  )
  .join("\n")}
`
    : ""
}

## Milestones
${this.plan.milestones
  .map(
    (milestone) => `
### ${milestone.name}
- **Target Date**: ${milestone.targetDate}
- **Target Score**: ${milestone.targetScore}%
- **Status**: ${milestone.completed ? "✅ Completed" : "🔄 In Progress"}
`,
  )
  .join("\n")}

## Recent Activity
${this.plan.tasks
  .filter((task) => task.notes && task.notes.length > 0)
  .slice(0, 5)
  .map(
    (task) => `
### ${task.title}
${task.notes
  ?.slice(-2)
  .map((note) => `- ${note}`)
  .join("\n")}
`,
  )
  .join("\n")}
    `
  }

  private savePlan(): void {
    const dir = path.dirname(this.planFile)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    fs.writeFileSync(this.planFile, JSON.stringify(this.plan, null, 2))
  }

  exportPlan(): ImprovementPlan {
    return { ...this.plan }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  const tracker = new MutationImprovementTracker()

  if (args.length === 0) {
    // Generate status report
    const report = tracker.generateStatusReport()
    console.log(report)

    // Save report to file
    const reportPath = "reports/mutation/improvement-status.md"
    fs.writeFileSync(reportPath, report)
    console.log(`\n📄 Status report saved to: ${reportPath}`)
    return
  }

  const command = args[0]

  switch (command) {
    case "update":
      if (args.length < 3) {
        console.error("Usage: update <taskId> <field=value> [field=value...]")
        process.exit(1)
      }

      const taskId = args[1]
      const updates: Partial<ImprovementTask> = {}

      args.slice(2).forEach((arg) => {
        const [field, value] = arg.split("=")
        if (field && value) {
          ;(updates as any)[field] = value
        }
      })

      tracker.updateTask(taskId, updates)
      console.log(`✅ Updated task: ${taskId}`)
      break

    case "note":
      if (args.length < 3) {
        console.error("Usage: note <taskId> <note>")
        process.exit(1)
      }

      tracker.addNote(args[1], args.slice(2).join(" "))
      console.log(`✅ Added note to task: ${args[1]}`)
      break

    case "progress":
      const progress = tracker.getProgress()
      console.log(`Overall Progress: ${progress.overall.toFixed(1)}%`)
      console.log(`Completed Tasks: ${progress.completedTasks}/${progress.totalTasks}`)
      break

    default:
      console.error(`Unknown command: ${command}`)
      console.log("Available commands: update, note, progress")
      process.exit(1)
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Command failed:", error)
    process.exit(1)
  })
}

export { MutationImprovementTracker }
