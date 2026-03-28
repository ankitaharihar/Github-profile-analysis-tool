const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const BASE_URL = "https://api.github.com";

// Get user profile
app.get("/api/github/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const response = await axios.get(`${BASE_URL}/users/${username}`);
    res.json(response.data);
  } catch {
    res.status(500).json({ message: "User not found" });
  }
});

// Get repos
app.get("/api/github/:username/repos", async (req, res) => {
  try {
    const { username } = req.params;
    const { page = 1, per_page = 10 } = req.query;

    const response = await axios.get(
      `${BASE_URL}/users/${username}/repos?page=${page}&per_page=${per_page}&sort=updated`
    );

    res.json({
      data: response.data,
      pagination: {
        has_prev: page > 1,
        has_next: response.data.length === Number(per_page),
        total_pages: page + 1 // simple logic (can improve later)
      }
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch repos" });
  }
});

// Get languages
app.get("/api/github/:username/languages", async (req, res) => {
  try {
    const { username } = req.params;

    const repos = await axios.get(`${BASE_URL}/users/${username}/repos`);
    const langStats = {};

    for (let repo of repos.data) {
      if (repo.language) {
        langStats[repo.language] =
          (langStats[repo.language] || 0) + 1;
      }
    }

    res.json(langStats);
  } catch {
    res.status(500).json({ message: "Failed to fetch languages" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});