import type { FullConfig } from "@playwright/test"
import fs from "fs"

async function globalTeardown(config: FullConfig) {
  console.log("🧹 Starting global teardown...")

  try {
    // Clean up authentication state
    if (fs.existsSync("e2e/auth-state.json")) {
      fs.unlinkSync("e2e/auth-state.json")
    }

    // Clean up test artifacts
    console.log("✅ Global teardown completed")
  } catch (error) {
    console.error("❌ Global teardown failed:", error)
  }
}

export default globalTeardown
