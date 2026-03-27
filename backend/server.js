import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const LANG_COLORS = {
  JavaScript: "#f7df1e", Python: "#3572A5", Java: "#b07219",
  TypeScript: "#3178c6", HTML: "#e34c26", CSS: "#563d7c",
  "C++": "#f34b7d", "C#": "#178600", Go: "#00ADD8",
  Ruby: "#701516", Rust: "#dea584", PHP: "#4F5D95",
};

const POPULAR_USERS = [
  "torvalds", "gaearon", "sindresorhus", "tj", "yyx990803",
  "addyosmani", "jeresig", "dhh", "nvie", "kennethreitz",
];

export default function App() {
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState(null);
  const [languages, setLanguages] = useState({});
  const [repos, setRepos] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gh_recent") || "[]"); }
    catch { return []; }
  });
  const inputRef = useRef(null);
  const suggestRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!suggestRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setUsername(val);
    if (val.trim().length >= 1) {
      const filtered = [
        ...recentSearches.filter(u => u.toLowerCase().includes(val.toLowerCase())),
        ...POPULAR_USERS.filter(u =>
          u.toLowerCase().includes(val.toLowerCase()) &&
          !recentSearches.includes(u)
        ),
      ].slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions(recentSearches.slice(0, 5));
      setShowSuggestions(recentSearches.length > 0);
    }
  };

  const handleFocus = () => {
    if (!username.trim() && recentSearches.length > 0) {
      setSuggestions(recentSearches.slice(0, 5));
      setShowSuggestions(true);
    }
  };

  const fetchRepos = async (user, page = 1) => {
    const repoRes = await axios.get(
      `http://localhost:5000/api/github/${user}/repos?page=${page}&per_page=10&sort=updated`
    );
    const repoData = Array.isArray(repoRes.data) ? repoRes.data : (repoRes.data.data || []);
    const paginationData = repoRes.data.pagination || null;
    return { repoData, paginationData };
  };

  const analyzeProfile = async (user = username, page = 1) => {
    if (!user.trim()) { setError("Please enter a GitHub username"); return; }
    setLoading(true);
    setError("");
    setProfile(null);
    setShowSuggestions(false);
    setCurrentPage(page);

    try {
      const [profileRes, langRes, { repoData, paginationData }] = await Promise.all([
        axios.get(`http://localhost:5000/api/github/${user}`),
        axios.get(`http://localhost:5000/api/github/${user}/languages`),
        fetchRepos(user, page),
      ]);

      setProfile(profileRes.data);
      setLanguages(langRes.data);
      setRepos(repoData);
      setPagination(paginationData);

      const updated = [user, ...recentSearches.filter(u => u !== user)].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem("gh_recent", JSON.stringify(updated));

    } catch (err) {
      const msg = err.response?.data?.message || "User not found or server error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage) => {
    if (!profile) return;
    setLoading(true);
    try {
      const { repoData, paginationData } = await fetchRepos(profile.login, newPage);
      setRepos(repoData);
      setPagination(paginationData);
      setCurrentPage(newPage);
    } catch {
      setError("Failed to fetch page");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") analyzeProfile();
    if (e.key === "Escape") setShowSuggestions(false);
  };

  const chartData = {
    labels: Object.keys(languages),
    datasets: [{
      data: Object.values(languages),
      backgroundColor: Object.keys(languages).map(l => LANG_COLORS[l] || "#6366f1"),
      borderWidth: 2,
      borderColor: "#0f172a",
    }],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#94a3b8", font: { size: 11 }, padding: 10, boxWidth: 10 },
      },
    },
  };

  return (
    <div
      className="min-h-screen text-slate-200 px-4 py-12"
      style={{
        background: "#080c14",
        backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.15) 0%, transparent 60%)"
      }}
    >
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs tracking-[3px] uppercase text-indigo-400 border border-indigo-500/30 px-4 py-1 rounded-full mb-5 bg-indigo-500/5">
            Dev Intelligence
          </span>
          <h1 className="text-5xl font-black tracking-tight mb-3"
            style={{
              background: "linear-gradient(135deg, #e2e8f0 0%, #6366f1 50%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
            GitHub Intelligence Pro
          </h1>
          <p className="text-slate-500 font-mono text-sm">// advanced developer analytics platform</p>
        </div>

        {/* Search */}
        <div className="flex gap-3 justify-center mb-10">
          <div className="relative flex-1 max-w-md" ref={suggestRef}>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg select-none">⌕</span>
            <input
              ref={inputRef}
              value={username}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              placeholder="github username..."
              className="w-full pl-10 pr-4 py-3.5 rounded-xl text-slate-200 font-mono text-sm outline-none transition-all placeholder:text-slate-600"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div
                className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50 shadow-2xl"
                style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {recentSearches.some(r => suggestions.includes(r)) && (
                  <div className="px-4 pt-3 pb-1">
                    <span className="text-xs text-slate-600 font-mono uppercase tracking-widest">Recent</span>
                  </div>
                )}
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setUsername(s); analyzeProfile(s); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-mono text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-300 transition-colors"
                  >
                    <span className="text-base">{recentSearches.includes(s) ? "🕐" : "👤"}</span>
                    {s}
                    {recentSearches.includes(s) && (
                      <span className="ml-auto text-xs text-slate-600">recent</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => analyzeProfile()}
            disabled={loading}
            className="px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              boxShadow: "0 4px 20px rgba(99,102,241,0.3)"
            }}
          >
            {loading ? "Analyzing..." : "Analyze →"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 mb-6 px-5 py-4 rounded-xl"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
            <span>⚠</span>
            <span className="font-mono text-sm text-red-300">{error}</span>
            <button onClick={() => setError("")} className="ml-auto text-red-400 text-lg leading-none">✕</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <span className="font-mono text-sm text-slate-500">fetching profile data...</span>
          </div>
        )}

        {/* Profile */}
        {profile && !loading && (
          <div className="space-y-5">

            {/* Profile Card */}
            <div className="rounded-2xl p-7 flex gap-7 flex-wrap items-start"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="w-24 h-24 rounded-full shrink-0"
                style={{ border: "3px solid rgba(99,102,241,0.4)" }}
              />
              <div className="flex-1 min-w-[200px]">
                <h2 className="text-2xl font-black text-slate-100">{profile.name || profile.login}</h2>
                <p className="font-mono text-sm text-indigo-400 mb-3">@{profile.login}</p>
                {profile.bio && (
                  <p className="text-slate-500 text-sm mb-4 leading-relaxed max-w-lg">{profile.bio}</p>
                )}
                <div className="flex flex-wrap gap-4 text-slate-500 font-mono text-xs">
                  {profile.location && <span>📍 {profile.location}</span>}
                  {profile.company && <span>🏢 {profile.company}</span>}
                  {profile.blog && <span>🔗 {profile.blog}</span>}
                  {profile.twitter_username && <span>𝕏 @{profile.twitter_username}</span>}
                </div>
                <a
                  href={profile.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg font-mono text-xs text-slate-400 hover:text-indigo-300 transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  ⎋ View on GitHub
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { n: profile.public_repos, l: "Repositories" },
                { n: profile.followers, l: "Followers" },
                { n: profile.following, l: "Following" },
                { n: profile.public_gists || 0, l: "Gists" },
              ].map(s => (
                <div key={s.l}
                  className="rounded-2xl p-5 text-center hover:-translate-y-1 transition-transform"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="text-3xl font-black font-mono"
                    style={{
                      background: "linear-gradient(135deg,#818cf8,#a78bfa)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}>{s.n}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Chart + Repos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Languages */}
              <div className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-5">Languages Used</p>
                {Object.keys(languages).length > 0 ? (
                  <div className="max-w-[200px] mx-auto">
                    <Pie data={chartData} options={chartOptions} />
                  </div>
                ) : (
                  <p className="text-slate-600 font-mono text-sm">No language data.</p>
                )}
              </div>

              {/* Repos */}
              <div className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="font-mono text-xs uppercase tracking-widest text-slate-500 mb-4">Repositories</p>

                <div className="space-y-2">
                  {repos.length > 0 ? repos.map(repo => (
                    <a key={repo.id}
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl p-3 transition-colors group"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div className="text-sm font-bold text-indigo-300 group-hover:text-indigo-200 truncate">{repo.name}</div>
                      {repo.description && (
                        <div className="text-xs text-slate-600 mt-0.5 truncate">{repo.description}</div>
                      )}
                      <div className="flex gap-3 mt-1.5 font-mono text-xs text-slate-600">
                        {repo.language && (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full inline-block"
                              style={{ background: LANG_COLORS[repo.language] || "#6366f1" }} />
                            {repo.language}
                          </span>
                        )}
                        <span>⭐ {repo.stargazers_count}</span>
                        <span>🍴 {repo.forks_count}</span>
                      </div>
                    </a>
                  )) : (
                    <p className="text-slate-600 font-mono text-sm">No repositories found.</p>
                  )}
                </div>

                {/* Pagination */}
                {pagination && (pagination.has_prev || pagination.has_next) && (
                  <div className="flex items-center justify-between mt-5 pt-4"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.has_prev || loading}
                      className="px-3 py-1.5 rounded-lg font-mono text-xs disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:text-indigo-300 transition-colors"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    >← Prev</button>
                    <span className="font-mono text-xs text-slate-500">
                      Page {currentPage} / {pagination.total_pages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.has_next || loading}
                      className="px-3 py-1.5 rounded-lg font-mono text-xs disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:text-indigo-300 transition-colors"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    >Next →</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}