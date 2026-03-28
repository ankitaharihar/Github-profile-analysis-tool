import { useState } from "react";
import axios from "axios";
import RepoModal from "./components/RepoModal";

export default function App() {
  const [username, setUsername] = useState("");

  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);

  const [selectedRepo, setSelectedRepo] = useState(null);
  const [readme, setReadme] = useState("");
  const [files, setFiles] = useState([]);

  const [fileContent, setFileContent] = useState("");
  const [activeFile, setActiveFile] = useState(null);

  // 🔥 Fetch profile + repos
  const analyzeProfile = async () => {
    try {
      const [profileRes, repoRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/github/${username}`),
        axios.get(`http://localhost:5000/api/github/${username}/repos`)
      ]);

      setProfile(profileRes.data);
      setRepos(repoRes.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 Open repo
  const openRepo = async (repo) => {
    setSelectedRepo(repo);
    setReadme("Loading...");
    setFiles([]);
    setActiveFile(null);

    try {
      const readmeRes = await axios.get(
        `https://api.github.com/repos/${repo.owner.login}/${repo.name}/readme`
      );

      const decoded = decodeURIComponent(
        escape(atob(readmeRes.data.content))
      );
      setReadme(decoded);
    } catch {
      setReadme("No README");
    }

    try {
      const fileRes = await axios.get(
        `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contents`
      );

      setFiles(Array.isArray(fileRes.data) ? fileRes.data : []);
    } catch {
      setFiles([]);
    }
  };

  // 🔥 Open file
  const openFile = async (file) => {
    if (file.type !== "file") return;

    setActiveFile(file.name);
    setFileContent("Loading...");

    try {
      const res = await axios.get(file.download_url);
      setFileContent(res.data);
    } catch {
      setFileContent("Error loading file");
    }
  };


  return (
  <div className="min-h-screen bg-[#020617] text-white px-6 py-10">

    {/* Title */}
    <h1 className="text-3xl text-center font-semibold mb-10">
      GitHub Profile Analyzer
    </h1>

    <div className="flex justify-center mb-10">
  <div className="flex bg-[#111827] border border-gray-700 rounded-lg overflow-hidden">

    <input
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          analyzeProfile();
        }
      }}
      placeholder="Enter username"
      className="px-4 py-2 w-80 bg-transparent outline-none"
    />

    <button
      onClick={analyzeProfile}
      className="px-5 bg-indigo-600 hover:bg-indigo-500 transition"
    >
      Analyze
    </button>

  </div>
</div>

    {/* Profile */}
    {profile && (
      <>
        <div className="bg-[#0f172a] p-4 rounded mb-8 border border-gray-800">
          <h2 className="text-lg font-semibold">
            {profile.name || profile.login}
          </h2>
          <p className="text-gray-400 text-sm">@{profile.login}</p>
          <p className="text-sm mt-2">{profile.bio}</p>
        </div>

        {/* Repo List */}
        <div className="grid md:grid-cols-2 gap-4">
          {repos.map((repo) => (
            <div
              key={repo.id}
              onClick={() => openRepo(repo)}
              className="bg-[#111827] border border-gray-800 p-4 rounded cursor-pointer hover:bg-[#1f2937]"
            >
              <p className="font-medium">{repo.name}</p>

              <div className="text-xs text-gray-400 mt-1 flex gap-3">
                <span>⭐ {repo.stargazers_count}</span>
                <span>🍴 {repo.forks_count}</span>
              </div>
            </div>
          ))}
        </div>
      </>
    )}

    {/* Modal */}
    {selectedRepo && (
      <RepoModal
        repo={selectedRepo}
        readme={readme}
        files={files}
        fileContent={fileContent}
        activeFile={activeFile}
        onFileClick={openFile}
        onClose={() => setSelectedRepo(null)}
      />
    )}
  </div>
);
}