"use client";

import { useState } from "react";
import DragAndDropZone from "@/components/DragAndDropZone";
import ModelViewer from "@/components/ModelViewer";
import AnalysisResults from "@/components/AnalysisResults";
import { parseSTL, runAnalysis } from "@/components/detectManifoldEdges";

export default function Home() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);

  const handleFileDrop = (uploadedFile) => {
    setFile(uploadedFile);
    setResults(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const geometry = await parseSTL(arrayBuffer); // parse STL as geometry
    const analysis = runAnalysis(geometry);
    setResults(analysis);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>3D Print Checker</h1>
      <DragAndDropZone onFileDrop={handleFileDrop} />
      <ModelViewer file={file} />
      <div className="resultsCont">
        <button onClick={handleAnalyze} id="checkBtn" disabled={!file}>
          Check Analysis
        </button>
        {results && <AnalysisResults data={results} />}
      </div>
    </div>
  );
}
