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
  const [readme, setReadme] = useState("");

  // 🔥 OPEN REPO + FETCH README
  const openRepo = async (repo) => {
    setSelectedRepo(repo);
    setReadme("Loading README...");

    try {
      const res = await axios.get(
        `https://api.github.com/repos/${repo.owner.login}/${repo.name}/readme`
      );

      const decoded = atob(res.data.content);
      setReadme(decoded);
    } catch {
      setReadme("No README available");
    }
  };

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
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-8">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyzeProfile()}
            placeholder="Enter GitHub username..."
            className="flex-1 px-4 py-3 rounded-lg bg-slate-800"
          />
          <button
            onClick={analyzeProfile}
            className="px-6 py-3 bg-indigo-600 rounded-lg"
          >
            {loading ? "Loading..." : "Analyze"}
          </button>
        </div>

        {error && <div className="text-red-400 mb-4">{error}</div>}

        {profile && !loading && (
          <div className="space-y-6">

            {/* Profile */}
            <div className="bg-slate-900 p-6 rounded-xl flex gap-6 items-center">
              <img src={profile.avatar_url} className="w-20 h-20 rounded-full" />
              <div>
                <h2 className="text-xl font-bold">{profile.login}</h2>
                <p className="text-slate-400">{profile.bio}</p>
              </div>
            </div>

            {/* Bottom */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Languages */}
              <div className="bg-slate-900 p-5 rounded-xl">
                <Pie data={chartData} />
              </div>

              {/* Repos */}
              <div className="bg-slate-900 p-5 rounded-xl">
                {topRepos.map((repo) => (
                  <div
                    key={repo.id}
                    onClick={() => openRepo(repo)}
                    className="mb-3 p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700"
                  >
                    <p className="text-indigo-400 font-semibold">{repo.name}</p>
                    <p className="text-xs text-slate-400">{repo.description}</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}
      </div>

      {/* 🔥 VS CODE MODAL */}
      {selectedRepo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="w-[90%] max-w-4xl bg-[#0d1117] rounded-xl overflow-hidden">

            {/* Top bar */}
            <div className="flex justify-between p-3 bg-[#161b22]">
              <span>{selectedRepo.name}</span>
              <button onClick={() => setSelectedRepo(null)}>✕</button>
            </div>

            {/* Content */}
            <div className="p-5 max-h-[500px] overflow-y-auto font-mono text-sm text-gray-300">

              <pre className="whitespace-pre-wrap">{readme}</pre>

              <a
                href={selectedRepo.html_url}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-4 px-4 py-2 bg-indigo-600 rounded"
              >
                Open on GitHub
              </a>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}