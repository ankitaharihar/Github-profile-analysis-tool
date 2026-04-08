import { useState } from "react";
import axios from "axios";

import {
  LanguageChart,
  RadarChartBox,
  ActivityChart
} from "./components/Charts";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const calculateScore = (profile, repos) => {
  if (!profile || !repos) return 0;

  const repoCount = repos.length;
  const stars = repos.reduce((a, r) => a + r.stargazers_count, 0);
  const followers = profile.followers || 0;

  const recentRepos = repos.filter((repo) => {
    const diff =
      (Date.now() - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24);
    return diff < 30;
  }).length;

  return Math.round(
    Math.min(repoCount * 1.5, 25) +
    Math.min(stars * 2, 25) +
    Math.min(followers * 3, 15) +
    Math.min(recentRepos * 2, 20)
  );
};

const getLevel = (score) => {
  if (score > 80) return "🚀 Pro Developer";
  if (score > 60) return "🔥 Strong";
  if (score > 40) return "⚡ Intermediate";
  return "🌱 Beginner";
};

const readCookie = (name) => {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? cookie.slice(name.length + 1) : null;
};

const getAuthUser = () => {
  const rawCookie = readCookie("oauth_user");

  if (!rawCookie) return null;

  try {
    return JSON.parse(decodeURIComponent(rawCookie));
  } catch {
    try {
      return JSON.parse(rawCookie);
    } catch {
      return null;
    }
  }
};

const clearCookie = (name) => {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
};

const getLoginNotice = () => {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const success = params.get("login_success");
  const error = params.get("login_error");

  if (success) {
    return {
      type: "success",
      text: `Signed in successfully with ${success}.`,
    };
  }

  if (error) {
    return {
      type: "error",
      text: `Login failed: ${error}`,
    };
  }

  return null;
};

export default function App() {
  const [authUser, setAuthUser] = useState(getAuthUser);
  const [loginNotice] = useState(getLoginNotice);
  const [username, setUsername] = useState(() => {
    try {
      return localStorage.getItem("lastUsername") || "";
    } catch {
      return "";
    }
  });
  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("history")) || [];
    } catch {
      return [];
    }
  });

  const startOAuthLogin = (provider) => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  const handleSignOut = () => {
    clearCookie("oauth_user");
    setAuthUser(null);
    setShowHistory(false);
    setProfile(null);
    setRepos([]);
    setUsername("");
    setSuggestions([]);
    setShowDropdown(false);
    localStorage.removeItem("lastUsername");
    localStorage.removeItem("history");
    setHistory([]);
  };

  const fetchSuggestions = async (value) => {
    if (!value) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        `https://api.github.com/search/users?q=${value}`
      );
      setSuggestions(res.data.items.slice(0, 5));
      setShowDropdown(true);
    } catch (err) {
      console.log(err);
    }
  };

  const analyzeProfile = async (user = username) => {
    if (!user || !authUser) return;

    setLoading(true);
    setProfile(null);

    try {
      const [profileRes, repoRes] = await Promise.all([
        axios.get(`https://api.github.com/users/${user}`),
        axios.get(`https://api.github.com/users/${user}/repos?per_page=100`)
      ]);

      setProfile(profileRes.data);
      setRepos(repoRes.data || []);
      localStorage.setItem("lastUsername", user);

      setHistory((prevHistory) => {
        const updated = [user, ...prevHistory.filter((item) => item !== user)].slice(0, 5);
        localStorage.setItem("history", JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  const score = calculateScore(profile, repos);
  const level = getLevel(score);

  return (
    <div className="min-h-screen bg-[#020617] px-6 py-10 text-white">
      <div className="mx-auto mb-6 flex w-full max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-[#0f172a]/90 px-4 py-3 shadow-xl shadow-black/30 backdrop-blur">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Home</p>
          <h2 className="text-sm font-semibold text-gray-100">
            Search profiles, open history, and reuse past searches
          </h2>
          {authUser && (
            <p className="mt-1 text-xs text-emerald-300">
              Signed in as {authUser.name || authUser.login || authUser.email}
              {authUser.provider ? ` via ${authUser.provider}` : ""}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => authUser && setShowHistory((value) => !value)}
            disabled={!authUser}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              authUser
                ? "border-white/10 bg-white/5 hover:bg-white/10"
                : "cursor-not-allowed border-white/5 bg-white/5 text-gray-500"
            }`}
          >
            {showHistory ? "Close history" : "History"}
          </button>

          {!authUser ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => startOAuthLogin("github")}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
              >
                Login with GitHub
              </button>
              <button
                onClick={() => startOAuthLogin("google")}
                className="rounded-full bg-linear-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-medium shadow-lg shadow-indigo-500/20"
              >
                Login with Google
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignOut}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {loginNotice && (
        <div
          className={`mx-auto mb-6 w-full max-w-6xl rounded-2xl border px-4 py-3 text-sm ${
            loginNotice.type === "error"
              ? "border-red-500/20 bg-red-500/10 text-red-200"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          {loginNotice.text}
        </div>
      )}

      <h1 className="mb-6 text-center text-4xl font-bold bg-linear-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
        GitHub Intelligence Pro
      </h1>

      <div className="relative mb-10 flex flex-col items-center gap-3">
        <div className="flex gap-3">
          <input
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              if (authUser) {
                fetchSuggestions(event.target.value);
              }
            }}
            onFocus={() => authUser && setShowDropdown(true)}
            onKeyDown={(event) => event.key === "Enter" && analyzeProfile()}
            placeholder="Enter GitHub username"
            disabled={!authUser}
            className="w-96 rounded-lg border border-white/10 bg-[#1e293b] px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            onClick={() => analyzeProfile()}
            disabled={!authUser}
            className="rounded-lg bg-linear-to-r from-indigo-500 to-purple-500 px-5 py-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Loading..." : "Analyze"}
          </button>
        </div>

        {!authUser && (
          <div className="w-full max-w-4xl rounded-2xl border border-dashed border-white/10 bg-[#0f172a]/40 p-4 text-sm text-gray-300">
            Search aur history use karne ke liye GitHub ya Google login karo.
          </div>
        )}

        {authUser && showHistory && history.length > 0 && (
          <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#0f172a]/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wide text-gray-200">
                Recent searches
              </h3>
              <span className="text-xs text-gray-500">Stored locally in your browser</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {history.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setUsername(item);
                    analyzeProfile(item);
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm hover:bg-indigo-500/20"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {authUser && showHistory && history.length === 0 && (
          <div className="w-full max-w-4xl rounded-2xl border border-dashed border-white/10 bg-[#0f172a]/40 p-4 text-sm text-gray-400">
            No search history yet.
          </div>
        )}

        {showDropdown && suggestions.length > 0 && authUser && (
          <div className="absolute top-20 z-50 w-96 rounded-xl border border-white/10 bg-[#0f172a] shadow-lg">
            {suggestions.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  setUsername(user.login);
                  setShowDropdown(false);
                  analyzeProfile(user.login);
                }}
                className="flex cursor-pointer items-center gap-3 p-3 hover:bg-indigo-500/20"
              >
                <img src={user.avatar_url} className="h-8 w-8 rounded-full" />
                <p className="text-sm text-gray-300">{user.login}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {profile && (
        <>
          <div className="mb-6 rounded-2xl border border-white/10 bg-[#0f172a]/80 p-6">
            <h2 className="text-2xl font-semibold">
              {profile.name || profile.login}
            </h2>
            <p className="text-gray-400">@{profile.login}</p>
            <p className="mt-2 text-sm">{profile.bio}</p>
          </div>

          <div className="mb-6 grid gap-6 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-[#0f172a]/60 p-6">
              <p>Developer Score</p>
              <h1 className="text-4xl font-bold">{score}</h1>
              <p className="text-sm text-indigo-400">{level}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0f172a]/60 p-6">
              <p>Repositories</p>
              <h2 className="text-3xl">{repos.length}</h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0f172a]/60 p-6">
              <p>Followers</p>
              <h2 className="text-3xl">{profile.followers}</h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0f172a]/60 p-6">
              <p>Total Stars</p>
              <h2 className="text-3xl">
                {repos.reduce((a, r) => a + r.stargazers_count, 0)}
              </h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0f172a]/80 p-6">
              <h2 className="mb-4">Languages</h2>
              <LanguageChart repos={repos} />
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0f172a]/80 p-6">
              <h2 className="mb-4">Skills</h2>
              <RadarChartBox repos={repos} />
            </div>

            <div className="col-span-2 rounded-2xl border border-white/10 bg-[#0f172a]/80 p-6">
              <h2 className="mb-4">Activity</h2>
              <ActivityChart repos={repos} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}