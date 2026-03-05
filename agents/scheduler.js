import "dotenv/config";
import cron from "node-cron";
import { execFile } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function runAgent(script, args = []) {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Starting: ${script} ${args.join(" ")}`);

  return new Promise((resolve) => {
    const child = execFile("node", [join(__dirname, script), ...args], {
      cwd: __dirname,
      env: process.env,
      timeout: 10 * 60 * 1000,  // 10 min timeout
    }, (error, stdout, stderr) => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      if (error) {
        console.error(`[${new Date().toISOString()}] FAILED (${elapsed}s): ${script}\n${stderr}`);
      } else {
        console.log(stdout);
        console.log(`[${new Date().toISOString()}] Complete (${elapsed}s): ${script}`);
      }
      resolve();
    });
  });
}

// 6:30am PST daily — morning intelligence run
cron.schedule("30 6 * * *", () => {
  console.log("\n🌅 Morning intelligence run (6:30am PST)");
  runAgent("timeline/run.js");
}, { timezone: "America/Los_Angeles" });

// 12:00pm PST daily — midday refresh
cron.schedule("0 12 * * *", () => {
  console.log("\n☀️ Midday refresh (12:00pm PST)");
  runAgent("timeline/run.js");
}, { timezone: "America/Los_Angeles" });

// Monthly snapshot: 1st of month at 6:00am PST
cron.schedule("0 6 1 * *", () => {
  console.log("\n📸 Monthly snapshot");
  runAgent("snapshot/run.js", ["monthly"]);
}, { timezone: "America/Los_Angeles" });

// Quarterly snapshot: Jan 1, Apr 1, Jul 1, Oct 1 at 6:15am PST
cron.schedule("15 6 1 1,4,7,10 *", () => {
  console.log("\n📸 Quarterly snapshot");
  runAgent("snapshot/run.js", ["quarterly"]);
}, { timezone: "America/Los_Angeles" });

console.log(`\n${"=".repeat(50)}`);
console.log("BBI Agent Scheduler running");
console.log("  Timeline: 6:30am + 12:00pm PST daily");
console.log("  Snapshot: 1st of month (monthly) + Jan/Apr/Jul/Oct (quarterly)");
console.log(`${"=".repeat(50)}\n`);
