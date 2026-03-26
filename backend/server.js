require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

// axios instance with GitHub token auth
const githubAPI = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  },
});

// test route
app.get("/", (req, res) => {
  res.send("GitHub API Running");
});

// profile route
app.get("/api/github/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const response = await githubAPI.get(`/users/${username}`);
    res.json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      status === 404
        ? "User not found"
        : status === 403
        ? "Rate limit exceeded"
        : "Failed to fetch profile";
    res.status(status).json({ message });
  }
});

// repositories route — with pagination + sorting
app.get("/api/github/:username/repos", async (req, res) => {
  const { username } = req.params;

  const page = parseInt(req.query.page) || 1;
  const per_page = parseInt(req.query.per_page) || 10;
  const sort = ["created", "updated", "pushed", "full_name"].includes(req.query.sort)
    ? req.query.sort
    : "updated";
  const direction = req.query.direction === "asc" ? "asc" : "desc";

  try {
    const response = await githubAPI.get(`/users/${username}/repos`, {
      params: { page, per_page, sort, direction },
    });

    // total count from Link header for pagination metadata
    const linkHeader = response.headers["link"] || "";
    const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
    const totalPages = lastPageMatch ? parseInt(lastPageMatch[1]) : page;

    res.json({
      data: response.data,
      pagination: {
        page,
        per_page,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    });
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      status === 404
        ? "User not found"
        : status === 403
        ? "Rate limit exceeded"
        : "Failed to fetch repositories";
    res.status(status).json({ message });
  }
});

// languages route
app.get("/api/github/:username/languages", async (req, res) => {
  const { username } = req.params;

  try {
    // fetch up to 100 repos for better language accuracy
    const response = await githubAPI.get(`/users/${username}/repos`, {
      params: { per_page: 100, sort: "updated" },
    });

    const languageCount = {};
    response.data.forEach((repo) => {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }
    });

    // sort by frequency
    const sorted = Object.entries(languageCount)
      .sort((a, b) => b[1] - a[1])
      .reduce((acc, [lang, count]) => {
        acc[lang] = count;
        return acc;
      }, {});

    res.json(sorted);
  } catch (error) {
    const status = error.response?.status || 500;
    const message =
      status === 404
        ? "User not found"
        : status === 403
        ? "Rate limit exceeded"
        : "Error fetching languages";
    res.status(status).json({ message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
