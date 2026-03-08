const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("GitHub API Running");
});

// profile route
app.get("/api/github/:username", async (req, res) => {
  const username = req.params.username;

  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}`
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "User not found" });
  }
});

// repositories route
app.get("/api/github/:username/repos", async (req, res) => {
  const username = req.params.username;

  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}/repos`
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch repositories" });
  }
});
app.get("/api/github/:username/languages", async (req, res) => {
  const username = req.params.username;

  try {
    const reposResponse = await axios.get(
      `https://api.github.com/users/${username}/repos`
    );

    const repos = reposResponse.data;

    const languageCount = {};

    repos.forEach(repo => {
      const lang = repo.language;

      if (lang) {
        if (!languageCount[lang]) {
          languageCount[lang] = 1;
        } else {
          languageCount[lang]++;
        }
      }
    });

    res.json(languageCount);

  } catch (error) {
    res.status(500).json({ message: "Error fetching languages" });
  }
});
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});