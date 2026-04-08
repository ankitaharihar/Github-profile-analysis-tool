import { useState } from "react";
import axios from "axios";

import {
  LanguageChart,
  RadarChartBox,
  ActivityChart
} from "./components/Charts";

// 🔥 SCORE
const calculateScore = (profile, repos) => {
  if (!profile || !repos) return 0;

  const repoCount = repos.length;
  const stars = repos.reduce((a, r) => a + r.stargazers_count, 0);
  const followers = profile.followers || 0;

  const recentRepos = repos.filter(r => {
    const diff =
      (Date.now() - new Date(r.updated_at)) / (1000 * 60 * 60 * 24);
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

export default function App() {
  const [username, setUsername] = useState(() => {
    try {
      return localStorage.getItem("lastUsername") || "";
    } catch {
      return "";
    }
  });
  const [authUser, setAuthUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("authUser");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
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

  const handleLogin = (event) => {
    event.preventDefault();

    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      return;
    }

    const sessionUser = {
      username: loginForm.username.trim()
    };

    setAuthUser(sessionUser);
    localStorage.setItem("authUser", JSON.stringify(sessionUser));
    setShowLogin(false);
    setLoginForm({ username: "", password: "" });
  };

  const handleSignOut = () => {
    setAuthUser(null);
    setShowHistory(false);
    setProfile(null);
    setRepos([]);
    setUsername("");
    localStorage.removeItem("authUser");
    localStorage.removeItem("lastUsername");
  };

  // 🔍 SUGGESTIONS
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

  // 🔥 FETCH
  const analyzeProfile = async (user = username) => {
    if (!user || !authUser) return;

    setLoading(true);
    setProfile(null); // 👉 old profile hide

    try {
      const [profileRes, repoRes] = await Promise.all([
        axios.get(`https://api.github.com/users/${user}`),
        axios.get(`https://api.github.com/users/${user}/repos?per_page=100`)
      ]);

      setProfile(profileRes.data);
      setRepos(repoRes.data || []);
      localStorage.setItem("lastUsername", user);

      // 🔥 SAVE HISTORY
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
    <div className="min-h-screen bg-[#020617] text-white px-6 py-10">
      <div className="sticky top-4 z-40 mx-auto mb-8 flex w-full max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-[#0f172a]/90 px-4 py-3 shadow-xl shadow-black/30 backdrop-blur">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Home</p>
          <h2 className="text-sm font-semibold text-gray-100">
            Search profiles, open history, and reuse past searches
          </h2>
          {authUser && (
            <p className="mt-1 text-xs text-emerald-300">
              Signed in as {authUser.username}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory((value) => !value)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            {showHistory ? "Close history" : "History"}
          </button>

          {!authUser ? (
            <button
              onClick={() => setShowLogin(true)}
              className="rounded-full bg-linear-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-medium shadow-lg shadow-indigo-500/20"
            >
              Login
            </button>
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

      {/* TITLE */}
      <h1 className="text-4xl text-center font-bold bg-linear-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent mb-6">
        GitHub Intelligence Pro
      </h1>

      {/* SEARCH */}
      <div className="flex flex-col items-center gap-3 mb-10 relative">

        <div className="flex gap-3">
          <input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              fetchSuggestions(e.target.value);
            }}
            onFocus={() => setShowDropdown(true)}
            onKeyDown={(e) => e.key === "Enter" && analyzeProfile()}
            placeholder="Enter GitHub username"
            disabled={!authUser}
            className="w-96 px-4 py-2 rounded-lg bg-[#1e293b] border border-white/10"
          />

          <button
            onClick={() => analyzeProfile()}
            disabled={!authUser}
            className="px-5 py-2 bg-linear-to-r from-indigo-500 to-purple-500 rounded-lg"
          >
            {loading ? "Loading..." : "Analyze"}
          </button>
        </div>

        {!authUser && (
          <div className="w-full max-w-4xl rounded-2xl border border-dashed border-white/10 bg-[#0f172a]/40 p-4 text-sm text-gray-300">
            Search aur history use karne ke liye pehle Login button dabao.
          </div>
        )}

        {/* HISTORY */}
        {showHistory && history.length > 0 && (
          <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#0f172a]/70 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold tracking-wide text-gray-200">Recent searches</h3>
              <span className="text-xs text-gray-500">Stored locally in your browser</span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {history.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setUsername(item);
                    analyzeProfile(item);
                  }}
                  className="px-3 py-1 text-sm bg-white/5 border border-white/10 rounded-full hover:bg-indigo-500/20"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {showHistory && history.length === 0 && (
          <div className="w-full max-w-4xl rounded-2xl border border-dashed border-white/10 bg-[#0f172a]/40 p-4 text-sm text-gray-400">
            No search history yet.
          </div>
        )}

        {/* SUGGESTIONS */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute top-20 w-96 bg-[#0f172a] border border-white/10 rounded-xl shadow-lg z-50">
            {suggestions.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  setUsername(user.login);
                  setShowDropdown(false);
                  analyzeProfile(user.login);
                }}
                className="flex items-center gap-3 p-3 hover:bg-indigo-500/20 cursor-pointer"
              >
                <img src={user.avatar_url} className="w-8 h-8 rounded-full" />
                <p className="text-sm text-gray-300">{user.login}</p>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* PROFILE */}
      {profile && (
        <>
          {/* HEADER */}
          <div className="p-6 rounded-2xl bg-[#0f172a]/80 border border-white/10 mb-6">
            <h2 className="text-2xl font-semibold">
              {profile.name || profile.login}
            </h2>
            <p className="text-gray-400">@{profile.login}</p>
            <p className="text-sm mt-2">{profile.bio}</p>
          </div>

          {/* STATS */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">

            <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-white/10">
              <p>Developer Score</p>
              <h1 className="text-4xl font-bold">{score}</h1>
              <p className="text-indigo-400 text-sm">{level}</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-white/10">
              <p>Repositories</p>
              <h2 className="text-3xl">{repos.length}</h2>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-white/10">
              <p>Followers</p>
              <h2 className="text-3xl">{profile.followers}</h2>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-white/10">
              <p>Total Stars</p>
              <h2 className="text-3xl">
                {repos.reduce((a, r) => a + r.stargazers_count, 0)}
              </h2>
            </div>

          </div>

          {/* CHARTS */}
          <div className="grid md:grid-cols-2 gap-6">

            <div className="p-6 rounded-2xl bg-[#0f172a]/80 border border-white/10">
              <h2 className="mb-4">Languages</h2>
              <LanguageChart repos={repos} />
            </div>

            <div className="p-6 rounded-2xl bg-[#0f172a]/80 border border-white/10">
              <h2 className="mb-4">Skills</h2>
              <RadarChartBox repos={repos} />
            </div>

            <div className="col-span-2 p-6 rounded-2xl bg-[#0f172a]/80 border border-white/10">
              <h2 className="mb-4">Activity</h2>
              <ActivityChart repos={repos} />
            </div>

          </div>
        </>
      )}

      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl shadow-black/40">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Login</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Sign in to continue</h3>
              <p className="mt-2 text-sm text-gray-400">
                Ye local session login hai. Analysis aur history tabhi unlock hogi.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="mb-2 block text-sm text-gray-300">Username</label>
                <input
                  value={loginForm.username}
                  onChange={(event) =>
                    setLoginForm((prev) => ({ ...prev, username: event.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-white outline-none focus:border-indigo-400"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm((prev) => ({ ...prev, password: event.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#1e293b] px-4 py-3 text-white outline-none focus:border-indigo-400"
                  placeholder="Enter a password"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 px-4 py-3 text-sm font-medium"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}