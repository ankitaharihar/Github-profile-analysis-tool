import { useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const LANG_COLORS = {
  JavaScript: "#f7df1e",
  Python: "#3572A5",
  Java: "#b07219",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

export default function App() {
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState(null);
  const [languages, setLanguages] = useState({});
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRepo, setSelectedRepo] = useState(null);

  const analyzeProfile = async () => {
    if (!username.trim()) {
      setError("Enter a username");
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

      // ✅ FIXED
      setRepos(Array.isArray(repoRes.data.data) ? repoRes.data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: Object.keys(languages),
    datasets: [
      {
        data: Object.values(languages),
        backgroundColor: Object.keys(languages).map(
          (l) => LANG_COLORS[l] || "#6366f1"
        ),
      },
    ],
  };

  const topRepos = Array.isArray(repos)
    ? [...repos]
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5)
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-pink-500 bg-clip-text text-transparent">
            GitHub Profile Analyzer
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Analyze any developer instantly
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-8">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyzeProfile()}
            placeholder="Enter GitHub username..."
            className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none"
          />
          <button
            onClick={analyzeProfile}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold"
          >
            {loading ? "Loading..." : "Analyze"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-10 text-slate-400">
            Fetching data...
          </div>
        )}

        {/* Profile */}
        {profile && !loading && (
          <div className="space-y-6">

            {/* Profile Card */}
            <div className="bg-slate-900 p-6 rounded-xl flex gap-6 items-center">
              <img
                src={profile.avatar_url}
                alt=""
                className="w-20 h-20 rounded-full"
              />
              <div>
                <h2 className="text-xl font-bold">
                  {profile.name || profile.login}
                </h2>
                <p className="text-slate-400">@{profile.login}</p>
                {profile.bio && (
                  <p className="text-sm text-slate-400 mt-2">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Repos", value: profile.public_repos },
                { label: "Followers", value: profile.followers },
                { label: "Following", value: profile.following },
                { label: "Gists", value: profile.public_gists || 0 },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-slate-900 p-4 rounded-xl text-center"
                >
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-sm text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Bottom Grid */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Languages */}
              <div className="bg-slate-900 p-5 rounded-xl">
                <h3 className="text-sm text-slate-400 mb-4">
                  Languages
                </h3>
                {Object.keys(languages).length > 0 ? (
                  <Pie data={chartData} />
                ) : (
                  <p className="text-slate-500 text-sm">
                    No data
                  </p>
                )}
              </div>

              {/* Top Repos */}
              <div className="bg-slate-900 p-5 rounded-xl">
                <h3 className="text-sm text-slate-400 mb-4">
                  Top Repositories
                </h3>

                {topRepos.length > 0 ? (
                  topRepos.map((repo) => (
                    <div
                      key={repo.id}
                      className="mb-3 p-3 bg-slate-800 rounded-lg"
                    >
                      <p className="font-semibold text-indigo-400">
                        {repo.name}
                      </p>
                      {repo.description && (
                        <p className="text-xs text-slate-400">
                          {repo.description}
                        </p>
                      )}
                      <div className="text-xs text-slate-500 mt-1">
                        ⭐ {repo.stargazers_count} | 🍴 {repo.forks_count}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">
                    No repos found
                  </p>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}