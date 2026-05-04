import dotenv from "dotenv";
dotenv.config();

import colors from "colors";
import app from "./app.js";
import connectDB from "./config/db.js";
connectDB();

/* ===================== START ===================== */
const PORT = parseInt(process.env.PORT || "5001", 10);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.bgCyan.bold);
});

/* ── Permanent fix: if port is busy, kill the occupying process & retry ── */
server.on("error", async (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`⚠️  Port ${PORT} busy — killing old process...`.yellow);
    try {
      const { execSync } = await import("child_process");
      // Windows: find PID using netstat and kill it
      const out = execSync(`netstat -ano | findstr :${PORT}`, { encoding: "utf8" });
      const lines = out.trim().split("\n");
      const pids = new Set();
      lines.forEach((line) => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== "0") pids.add(pid);
      });
      pids.forEach((pid) => {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
          console.log(`✅ Killed PID ${pid}`.green);
        } catch {}
      });
      // Retry after 1 second
      setTimeout(() => {
        server.listen(PORT, () => {
          console.log(`✅ Server restarted on port ${PORT}`.bgGreen.bold);
        });
      }, 1000);
    } catch (e) {
      console.error("Could not auto-kill process:", e.message);
      process.exit(1);
    }
  } else {
    console.error("Server error:", err);
    process.exit(1);
  }
});
