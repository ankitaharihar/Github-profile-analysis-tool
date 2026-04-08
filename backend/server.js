require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
const BASE_URL = "https://api.github.com";
const COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const getMailer = () => {
  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user,
      pass,
    },
  });
};

const getPrimaryEmail = (emails = []) => {
  const primary = emails.find((entry) => entry.primary && entry.verified);
  return primary?.email || emails.find((entry) => entry.verified)?.email || "";
};

const sendLoginEmail = async (user) => {
  if (!user.email) return false;

  const mailer = getMailer();
  if (!mailer) {
    console.warn("Email credentials are not configured. Skipping login email.");
    return false;
  }

  await mailer.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: user.email,
    subject: "You signed in to GitHub Intelligence Pro",
    text: `Hi ${user.name || user.login || "there"},\n\nA successful ${user.provider} login was detected for your GitHub Intelligence Pro session.\n\nIf this was not you, please review your account activity.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2 style="margin:0 0 12px">Login successful</h2>
        <p>Hi ${user.name || user.login || "there"},</p>
        <p>A successful <strong>${user.provider}</strong> login was detected for your GitHub Intelligence Pro session.</p>
        <p>If this was not you, please review your account activity.</p>
      </div>
    `,
  });

  return true;
};

const storeAuthUser = (res, user) => {
  res.cookie("oauth_user", JSON.stringify(user), {
    ...COOKIE_OPTIONS,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
};

const makeStateCookie = (provider) => `${provider}_oauth_state`;

const buildState = () => crypto.randomBytes(16).toString("hex");

const redirectToFrontend = (res, query = {}) => {
  const url = new URL(FRONTEND_URL);
  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return res.redirect(url.toString());
};

app.get("/auth/github", (req, res) => {
  const state = buildState();
  res.cookie(makeStateCookie("github"), state, {
    ...COOKIE_OPTIONS,
    httpOnly: true,
    maxAge: 1000 * 60 * 10,
  });

  const redirectUri = `${BACKEND_URL}/auth/github/callback`;
  const scope = encodeURIComponent("read:user user:email");

  const url =
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${scope}` +
    `&state=${state}`;

  res.redirect(url);
});

app.get("/auth/google", (req, res) => {
  const state = buildState();
  res.cookie(makeStateCookie("google"), state, {
    ...COOKIE_OPTIONS,
    httpOnly: true,
    maxAge: 1000 * 60 * 10,
  });

  const redirectUri = `${BACKEND_URL}/auth/google/callback`;
  const scope = encodeURIComponent("openid email profile");

  const url =
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&access_type=offline` +
    `&prompt=consent` +
    `&state=${state}`;

  res.redirect(url);
});

app.get("/auth/github/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;
    const storedState = req.cookies[makeStateCookie("github")];

    res.clearCookie(makeStateCookie("github"), COOKIE_OPTIONS);

    if (error) {
      return redirectToFrontend(res, { login_error: String(error) });
    }

    if (!code || !state || !storedState || state !== storedState) {
      return redirectToFrontend(res, { login_error: "github_state_mismatch" });
    }

    const redirectUri = `${BACKEND_URL}/auth/github/callback`;
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
        state,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return redirectToFrontend(res, { login_error: "github_token_missing" });
    }

    const profileResponse = await axios.get(`${BASE_URL}/user`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    const emailResponse = await axios.get(`${BASE_URL}/user/emails`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    const profile = profileResponse.data;
    const user = {
      provider: "github",
      id: String(profile.id),
      login: profile.login,
      name: profile.name || profile.login,
      email: getPrimaryEmail(emailResponse.data),
      avatarUrl: profile.avatar_url,
    };

    await sendLoginEmail(user);
    storeAuthUser(res, user);

    return redirectToFrontend(res, { login_success: "github" });
  } catch (err) {
    console.error("GitHub auth callback error:", err);
    return redirectToFrontend(res, { login_error: "github_callback_failed" });
  }
});

app.get("/auth/google/callback", async (req, res) => {
  try {
    const { code, state, error } = req.query;
    const storedState = req.cookies[makeStateCookie("google")];

    res.clearCookie(makeStateCookie("google"), COOKIE_OPTIONS);

    if (error) {
      return redirectToFrontend(res, { login_error: String(error) });
    }

    if (!code || !state || !storedState || state !== storedState) {
      return redirectToFrontend(res, { login_error: "google_state_mismatch" });
    }

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${BACKEND_URL}/auth/google/callback`,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      return redirectToFrontend(res, { login_error: "google_token_missing" });
    }

    const profileResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const profile = profileResponse.data;
    const user = {
      provider: "google",
      id: String(profile.id),
      login: profile.email?.split("@")[0] || profile.name || "google-user",
      name: profile.name || profile.email,
      email: profile.email,
      avatarUrl: profile.picture,
    };

    await sendLoginEmail(user);
    storeAuthUser(res, user);

    return redirectToFrontend(res, { login_success: "google" });
  } catch (err) {
    console.error("Google auth callback error:", err);
    return redirectToFrontend(res, { login_error: "google_callback_failed" });
  }
});

app.get("/api/github/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const response = await axios.get(`${BASE_URL}/users/${username}`);
    res.json(response.data);
  } catch {
    res.status(500).json({ message: "User not found" });
  }
});

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
        total_pages: page + 1,
      },
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch repos" });
  }
});

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});