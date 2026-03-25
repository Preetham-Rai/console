const express = require("express");
const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function loadPort(defaultPort = 3000) {
  try {
    const configPath = path.resolve(__dirname, "../../config.yaml");
    const raw = fs.readFileSync(configPath, "utf-8");
    const cfg = yaml.load(raw);
    const svc = cfg.services.find((s) => (s.name = "user-service"));
    return svc?.port ?? defaultPort;
  } catch (error) {
    return defaultPort;
  }
}

const PORT = process.env.PORT || loadPort();

const app = express();
app.use(express.json());

let users = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "admin" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "user" },
];
let nextId = 3;

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "user-service", port: PORT });
});

app.get("/users", (req, res) => {
  res.json({ data: users, total: users.length });
});

app.get("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ data: user });
});

app.post("/users", (req, res) => {
  const { name, email, role = "user" } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }
  const user = { id: nextId++, name, email, role };
  users.push(user);
  res.status(201).json({ data: user });
});

app.put("/users/:id", (req, res) => {
  const idx = users.findIndex((u) => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  users[idx] = { ...users[idx], ...req.body, id: users[idx].id };
  res.json({ data: users[idx] });
});

app.delete("/users/:id", (req, res) => {
  const idx = users.findIndex((u) => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  users.splice(idx, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`[user-service] running on http://localhost:${PORT}`);
});
