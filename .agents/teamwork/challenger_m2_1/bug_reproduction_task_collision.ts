import assert from "node:assert/strict";
import { overviewService } from "../../../src/services/overviewService";

async function runBugReproduction() {
  console.log("=== EMPIRICAL REPRODUCTION: TASK ID COLLISION IN ADDTASK ===");

  await overviewService.resetState();

  // Rapidly add 5 tasks synchronously
  const tasks = [];
  for (let i = 0; i < 5; i++) {
    const task = await overviewService.addTask({
      title: `Rapid Task ${i + 1}`,
      category: "work",
      categoryLabel: "Work · Engineering",
      priority: "medium",
      isCompleted: false,
    });
    tasks.push(task);
  }

  console.log("Generated Task IDs:");
  tasks.forEach((t, i) => console.log(`  Task ${i + 1}: id = "${t.id}"`));

  const uniqueIds = new Set(tasks.map((t) => t.id));
  console.log(`Total tasks added: ${tasks.length}, Unique IDs generated: ${uniqueIds.size}`);

  if (uniqueIds.size < tasks.length) {
    console.error(`\n🚨 CRITICAL BUG CONFIRMED: Collision detected! ${tasks.length - uniqueIds.size} duplicate IDs generated.`);
    console.error("Cause: `id: \`task-\${Date.now()}\`` relies purely on millisecond timestamp without counter or entropy.");
    console.error("Impact: React key conflicts, broken task toggling in DailyFocusCard / overviewService.toggleTask.");
    process.exit(1);
  } else {
    console.log("No collision observed in this run (tasks spanned multiple milliseconds).");
  }
}

runBugReproduction().catch((err) => {
  console.error("Test harness error:", err);
  process.exit(2);
});
