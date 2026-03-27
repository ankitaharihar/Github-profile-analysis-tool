import { useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #080c14;
    font-family: 'Syne', sans-serif;
    color: #e2e8f0;
  }

  .app-wrapper {
    min-height: 100vh;
    background: #080c14;
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.15) 0%, transparent 60%),
      radial-gradient(ellipse 40% 30% at 80% 80%, rgba(236,72,153,0.08) 0%, transparent 50%);
    padding: 48px 20px;
  }

  .container {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
  }

  /* Header */
  .header {
    text-align: center;
    margin-bottom: 48px;
    animation: fadeDown 0.6s ease both;
  }

  .header-badge {
    display: inline-block;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #6366f1;
    border: 1px solid rgba(99,102,241,0.3);
    padding: 4px 14px;
    border-radius: 20px;
    margin-bottom: 20px;
    background: rgba(99,102,241,0.05);
  }

  .header h1 {
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 800;
    background: linear-gradient(135deg, #e2e8f0 0%, #6366f1 50%, #ec4899 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
    letter-spacing: -1px;
  }

  .header p {
    color: #475569;
    font-size: 15px;
    margin-top: 10px;
    font-family: 'Space Mono', monospace;
  }

  /* Search Box */
  .search-box {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 48px;
    animation: fadeUp 0.6s 0.2s ease both;
  }

  .search-input-wrap {
    position: relative;
    flex: 1;
    max-width: 420px;
  }

  .search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #475569;
    font-size: 16px;
  }

  .search-input {
    width: 100%;
    padding: 14px 16px 14px 44px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    color: #e2e8f0;
    font-size: 15px;
    font-family: 'Space Mono', monospace;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
  }

  .search-input::placeholder { color: #334155; }

  .search-input:focus {
    border-color: rgba(99,102,241,0.5);
    background: rgba(99,102,241,0.05);
  }

  .analyze-btn {
    padding: 14px 28px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Syne', sans-serif;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
    white-space: nowrap;
    box-shadow: 0 4px 20px rgba(99,102,241,0.3);
  }

  .analyze-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(99,102,241,0.45);
  }

  .analyze-btn:active { transform: translateY(0); }
  .analyze-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* Loading */
  .loading-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 60px 0;
    animation: fadeIn 0.3s ease;
  }

  .spinner {
    width: 44px;
    height: 44px;
    border: 3px solid rgba(99,102,241,0.15);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .loading-text {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    color: #475569;
    letter-spacing: 1px;
  }

  /* Error */
  .error-box {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 12px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    animation: shake 0.4s ease;
  }

  .error-icon { font-size: 20px; }

  .error-text {
    font-size: 14px;
    color: #fca5a5;
    font-family: 'Space Mono', monospace;
  }

  .error-close {
    margin-left: auto;
    background: none;
    border: none;
    color: #ef4444;
    cursor: pointer;
    font-size: 18px;
    line-height: 1;
    padding: 0 4px;
  }

  /* Profile Card */
  .profile-section {
    animation: fadeUp 0.5s ease both;
  }

  .profile-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 32px;
    margin-bottom: 24px;
    display: flex;
    gap: 28px;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .avatar-wrap {
    position: relative;
    flex-shrink: 0;
  }

  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 3px solid rgba(99,102,241,0.4);
    display: block;
  }

  .avatar-ring {
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 2px solid transparent;
    background: linear-gradient(135deg, #6366f1, #ec4899) border-box;
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
    animation: rotateBorder 4s linear infinite;
  }

  .profile-info { flex: 1; min-width: 200px; }

  .profile-name {
    font-size: 26px;
    font-weight: 800;
    color: #f1f5f9;
    margin-bottom: 4px;
  }

  .profile-login {
    font-family: 'Space Mono', monospace;
    font-size: 13px;
    color: #6366f1;
    margin-bottom: 12px;
  }

  .profile-bio {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 16px;
    line-height: 1.6;
    max-width: 500px;
  }

  .profile-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #475569;
    font-family: 'Space Mono', monospace;
  }

  .meta-item span:first-child { font-size: 15px; }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 20px 16px;
    text-align: center;
    transition: border-color 0.2s, transform 0.2s;
  }

  .stat-card:hover {
    border-color: rgba(99,102,241,0.3);
    transform: translateY(-2px);
  }

  .stat-number {
    font-size: 28px;
    font-weight: 800;
    font-family: 'Space Mono', monospace;
    background: linear-gradient(135deg, #6366f1, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stat-label {
    font-size: 11px;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-top: 4px;
  }

  /* Charts + Repos Grid */
  .bottom-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  @media (max-width: 640px) {
    .bottom-grid { grid-template-columns: 1fr; }
    .profile-card { flex-direction: column; }
    .search-box { flex-direction: column; align-items: stretch; }
    .search-input-wrap { max-width: 100%; }
  }

  .panel {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 24px;
  }

  .panel-title {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #475569;
    margin-bottom: 20px;
    font-family: 'Space Mono', monospace;
  }

  .chart-wrap {
    max-width: 220px;
    margin: 0 auto;
  }

  /* Repo Cards */
  .repo-card {
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 10px;
    padding: 14px;
    margin-bottom: 10px;
    transition: border-color 0.2s;
    cursor: default;
  }

  .repo-card:hover { border-color: rgba(99,102,241,0.3); }

  .repo-name {
    font-size: 14px;
    font-weight: 700;
    color: #a5b4fc;
    margin-bottom: 6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .repo-desc {
    font-size: 12px;
    color: #475569;
    margin-bottom: 8px;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .repo-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #334155;
    font-family: 'Space Mono', monospace;
  }

  .lang-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #6366f1;
    margin-right: 4px;
    vertical-align: middle;
  }

  /* GitHub link button */
  .gh-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 16px;
    padding: 10px 18px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    color: #94a3b8;
    font-size: 13px;
    font-family: 'Space Mono', monospace;
    text-decoration: none;
    transition: border-color 0.2s, color 0.2s;
  }

  .gh-link:hover { border-color: rgba(99,102,241,0.4); color: #a5b4fc; }

  /* Animations */
  @keyframes fadeDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-6px); }
    40%, 80% { transform: translateX(6px); }
  }

  @keyframes rotateBorder {
    to { transform: rotate(360deg); }
  }
`;

const LANG_COLORS = {
  JavaScript: "#f7df1e", Python: "#3572A5", Java: "#b07219",
  TypeScript: "#3178c6", HTML: "#e34c26", CSS: "#563d7c",
  "C++": "#f34b7d", "C#": "#178600", Go: "#00ADD8",
  Ruby: "#701516", Rust: "#dea584", PHP: "#4F5D95",
};

export default function App() {
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState(null);
  const [languages, setLanguages] = useState({});
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeProfile = async () => {
    if (!username.trim()) {
      setError("Please enter a GitHub username");
      return;
    }
    setLoading(true);
    setError("");
    setProfile(null);

    try {
      const [profileRes, langRes, repoRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/github/${username}`),
        axios.get(`http://localhost:5000/api/github/${username}/languages`),
        axios.get(`http://localhost:5000/api/github/${username}/repos`),
      ]);
      setProfile(profileRes.data);
      setLanguages(langRes.data);
      setRepos(Array.isArray(repoRes.data) ? repoRes.data : []);
      setRepos(repoRes.data);
    } catch (err) {
      const msg = err.response?.data?.message || "User not found or API error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") analyzeProfile();
  };

  const chartData = {
    labels: Object.keys(languages),
    datasets: [{
      data: Object.values(languages),
      backgroundColor: Object.keys(languages).map(
        (lang) => LANG_COLORS[lang] || "#6366f1"
      ),
      borderWidth: 2,
      borderColor: "#080c14",
    }],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#64748b",
          font: { size: 11, family: "Space Mono" },
          padding: 12,
          boxWidth: 10,
        },
      },
    },
  };

  const topRepos = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

  return (
    <>
      <style>{styles}</style>
      <div className="app-wrapper">
        <div className="container">

          {/* Header */}
          <div className="header">
            <div className="header-badge">Dev Intelligence</div>
            <h1>GitHub Intelligence Pro</h1>
            <p>// advanced developer analytics platform</p>
          </div>

          {/* Search */}
          <div className="search-box">
            <div className="search-input-wrap">
              <span className="search-icon">⌕</span>
              <input
                className="search-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="github username..."
              />
            </div>
            <button
              className="analyze-btn"
              onClick={analyzeProfile}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Analyze Profile →"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="error-box">
              <span className="error-icon">⚠</span>
              <span className="error-text">{error}</span>
              <button className="error-close" onClick={() => setError("")}>✕</button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="loading-wrap">
              <div className="spinner" />
              <span className="loading-text">fetching profile data...</span>
            </div>
          )}

          {/* Profile */}
          {profile && !loading && (
            <div className="profile-section">

              {/* Profile Card */}
              <div className="profile-card">
                <div className="avatar-wrap">
                  <img className="avatar" src={profile.avatar_url} alt="avatar" />
                  <div className="avatar-ring" />
                </div>
                <div className="profile-info">
                  <div className="profile-name">{profile.name || profile.login}</div>
                  <div className="profile-login">@{profile.login}</div>
                  {profile.bio && (
                    <div className="profile-bio">{profile.bio}</div>
                  )}
                  <div className="profile-meta">
                    {profile.location && (
                      <span className="meta-item">
                        <span>📍</span> {profile.location}
                      </span>
                    )}
                    {profile.company && (
                      <span className="meta-item">
                        <span>🏢</span> {profile.company}
                      </span>
                    )}
                    {profile.blog && (
                      <span className="meta-item">
                        <span>🔗</span> {profile.blog}
                      </span>
                    )}
                    {profile.twitter_username && (
                      <span className="meta-item">
                        <span>𝕏</span> @{profile.twitter_username}
                      </span>
                    )}
                  </div>
                  <a
                    className="gh-link"
                    href={profile.html_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ⎋ View on GitHub
                  </a>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                {[
                  { number: profile.public_repos, label: "Repositories" },
                  { number: profile.followers, label: "Followers" },
                  { number: profile.following, label: "Following" },
                  { number: profile.public_gists || 0, label: "Gists" },
                ].map((s) => (
                  <div className="stat-card" key={s.label}>
                    <div className="stat-number">{s.number}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Charts + Repos */}
              <div className="bottom-grid">

                {/* Language Pie */}
                <div className="panel">
                  <div className="panel-title">Languages Used</div>
                  {Object.keys(languages).length > 0 ? (
                    <div className="chart-wrap">
                      <Pie data={chartData} options={chartOptions} />
                    </div>
                  ) : (
                    <p style={{ color: "#334155", fontSize: "13px", fontFamily: "Space Mono" }}>
                      No language data found.
                    </p>
                  )}
                </div>

                {/* Top Repos */}
                <div className="panel">
                  <div className="panel-title">Top Repositories</div>
                  {topRepos.length > 0 ? topRepos.map((repo) => (
                    <div className="repo-card" key={repo.id}>
                      <div className="repo-name">{repo.name}</div>
                      {repo.description && (
                        <div className="repo-desc">{repo.description}</div>
                      )}
                      <div className="repo-meta">
                        {repo.language && (
                          <span>
                            <span
                              className="lang-dot"
                              style={{ background: LANG_COLORS[repo.language] || "#6366f1" }}
                            />
                            {repo.language}
                          </span>
                        )}
                        <span>⭐ {repo.stargazers_count}</span>
                        <span>🍴 {repo.forks_count}</span>
                      </div>
                    </div>
                  )) : (
                    <p style={{ color: "#334155", fontSize: "13px", fontFamily: "Space Mono" }}>
                      No repositories found.
                    </p>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}