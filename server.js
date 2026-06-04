import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;
const VOTES_FILE = path.join(process.cwd(), "votes_data.json");

// Middleware to parse JSON payloads
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// Dynamic in-memory and local file votes persistence
function getVotes() {
  try {
    if (fs.existsSync(VOTES_FILE)) {
      const data = fs.readFileSync(VOTES_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading votes file, returning defaults:", err);
  }
  return { sweet: 12580, salty: 12845 };
}

function saveVotes(votes) {
  try {
    fs.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving votes file:", err);
  }
}

// 1. API Endpoint: Get Votes
app.get("/api/votes", (req, res) => {
  const votes = getVotes();
  res.json(votes);
});

// 2. API Endpoint: Post Vote
app.post("/api/votes", (req, res) => {
  const { camp } = req.body;
  if (camp !== "sweet" && camp !== "salty") {
    res.status(400).json({ error: "Invalid camp specification" });
    return;
  }
  const votes = getVotes();
  if (camp === "sweet") {
    votes.sweet += 1 + Math.floor(Math.random() * 3);
  } else {
    votes.salty += 1 + Math.floor(Math.random() * 3);
  }
  saveVotes(votes);
  res.json({ success: true, votes });
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on port ${PORT}`);
  });
}

startServer();
