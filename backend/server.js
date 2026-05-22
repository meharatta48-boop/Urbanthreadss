import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import colors from "colors";
import app from "./app.js";
import connectDB from "./config/db.js";
import * as https from "https";

(async () => {
  await connectDB();

  // Enable CORS for frontend domains
  app.use(
    cors({
      origin: [
        "https://www.urbanthreadss.store",
        "https://urbanthreadss.store",
        "http://localhost:5173",
      ],
      credentials: true,
    })
  );

  // Keep-alive ping system to prevent Render from sleeping
  setInterval(() => {
    https.get("https://urbanthreadss.onrender.com/api/health", (res) => {
      console.log(`Keep-alive ping: ${res.statusCode}`.green);
    }).on("error", (e) => {
      console.log(`Keep-alive ping error: ${e.message}`.red);
    });
  }, 14 * 60 * 1000);

  const PORT = process.env.PORT || 5001;
  const server = app.listen(PORT, () => {
    console.log(`✅ Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`.bgGreen.bold);
  });

  // Permanent fix: if port is busy, kill the occupying process & retry
  server.on("error", async (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`⚠️  Port ${PORT} busy — killing old process...`.yellow);
      try {
        const { execSync } = await import("child_process");
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
        setTimeout(() => {
          server.listen(PORT, () => console.log(`✅ Server restarted on port ${PORT}`.bgGreen.bold));
        }, 1000);
      } catch (e) {
        console.error("Could not auto‑kill process:", e.message);
        process.exit(1);
      }
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });
})();
