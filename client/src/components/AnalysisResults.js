export default function AnalysisResults({ data }) {
  return (
    <div className="results">
      <h2 className="text-center">Analysis Results</h2>
      <hr></hr>
      <p>
        <strong>Width:</strong> {data.width} mm
      </p>
      <p>
        <strong>Height:</strong> {data.height} mm
      </p>
      <p>
        <strong>Depth:</strong> {data.depth} mm
      </p>
      <p>
        <strong>Wall Thickness:</strong> {data.wallThickness} mm
      </p>
      <p>
        <strong>Wall Too Thin:</strong>{" "}
        <span
          style={{
            color: data.wallTooThin ? "var(--error)" : "var(--success)",
          }}
        >
          {data.wallTooThin ? "Yes" : "No"}
        </span>
      </p>
      <p>
        <strong>Non-Manifold Edges Detected:</strong>{" "}
        <span
          style={{
            color: data.nonManifold ? "var(--error)" : "var(--success)",
          }}
        >
          {data.nonManifold ? "Yes" : "No"}
        </span>
      </p>
      <p>
        <strong>Best Orientation:</strong> {data.orientation.instructions}
      </p>
    </div>
  );
}
