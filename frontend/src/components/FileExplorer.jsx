import { useState } from "react";
import axios from "axios";

export default function FileExplorer({ files, onFileClick, activeFile }) {
  return (
    <div>
      {files.map((file) => (
        <Node
          key={file.path}
          file={file}
          onFileClick={onFileClick}
          activeFile={activeFile}
        />
      ))}
    </div>
  );
}

function Node({ file, onFileClick, activeFile }) {
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState([]);

  const handleClick = async () => {
    if (file.type === "file") {
      onFileClick(file);
      return;
    }

    setOpen(!open);

    if (!open && children.length === 0) {
      const res = await axios.get(file.url);
      setChildren(res.data);
    }
  };

  return (
    <div className="ml-2">
      <div
        onClick={handleClick}
        className={`cursor-pointer px-2 py-1 rounded ${
          activeFile === file.name ? "bg-gray-700" : "hover:bg-gray-800"
        }`}
      >
        {file.type === "dir" ? (open ? "📂" : "📁") : "📄"} {file.name}
      </div>

      {open && children.length > 0 && (
        <div className="ml-4 border-l pl-2">
          {children.map((child) => (
            <Node
              key={child.path}
              file={child}
              onFileClick={onFileClick}
              activeFile={activeFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}