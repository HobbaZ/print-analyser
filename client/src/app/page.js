"use client";

// pages/index.js
import { useState } from "react";
import DragAndDropZone from "@/components/DragAndDropZone";
import ModelViewer from "@/components/ModelViewer";

export default function Home() {
  const [stlFile, setStlFile] = useState(null);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>3D Print Checker</h1>
      <DragAndDropZone onFileDrop={setStlFile} />
      {stlFile && <ModelViewer file={stlFile} />}
    </div>
  );
}
