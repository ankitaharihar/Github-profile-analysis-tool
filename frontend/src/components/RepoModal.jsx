import ReactMarkdown from "react-markdown";
import FileExplorer from "./FileExplorer";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function RepoModal({
  repo,
  readme,
  files,
  fileContent,
  activeFile,
  onFileClick,
  onClose
}) {
  const getLang = (file) => {
    if (!file) return "text";
    if (file.endsWith(".js")) return "javascript";
    if (file.endsWith(".html")) return "html";
    if (file.endsWith(".css")) return "css";
    if (file.endsWith(".json")) return "json";
    return "text";
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center">

      <div className="w-[90%] max-w-6xl bg-[#0d1117] rounded relative">

        <div className="flex justify-between p-3 bg-[#161b22]">
          <span>{repo.name}</span>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="flex h-[500px]">

          {/* Explorer */}
          <div className="w-1/3 border-r p-2 overflow-y-auto">
            <FileExplorer
              files={files}
              onFileClick={onFileClick}
              activeFile={activeFile}
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-4 overflow-y-auto">

            {activeFile ? (
              <>
                <p className="text-xs mb-2">{activeFile}</p>
                <SyntaxHighlighter
                  language={getLang(activeFile)}
                  style={oneDark}
                >
                  {typeof fileContent === "string" ? fileContent : ""}
                </SyntaxHighlighter>
              </>
            ) : (
              <ReactMarkdown>{readme}</ReactMarkdown>
            )}
          </div>
        </div>

        <div className="absolute bottom-4 right-6">
          <a
            href={repo.html_url}
            target="_blank"
            className="bg-indigo-600 px-4 py-2 rounded"
          >
            Open on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}