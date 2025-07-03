// components/DragAndDropZone.js
import { useRef, useState } from "react";

export default function DragAndDropZone({ onFileDrop }) {
  const dropRef = useRef();
  const [fileName, setFileName] = useState("No file chosen");

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".stl")) {
      onFileDrop(file);
      setFileName(file.name);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".stl")) {
      onFileDrop(file);
      setFileName(file.name);
    }
  };

  return (
    <div className="container">
      <div
        id="uploadCont"
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        Drag & drop an STL file here
      </div>

      <input
        type="file"
        id="actual-btn"
        accept=".stl"
        onChange={handleFileChange}
        hidden
      />
      <label htmlFor="actual-btn" className="custom-file-upload">
        Choose File
      </label>
      <span id="file-chosen">{fileName}</span>
    </div>
  );
}
