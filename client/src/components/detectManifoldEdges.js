// utils/analysis.js
import { STLLoader } from "three-stdlib";
import * as THREE from "three";
import bestOrientation from "./bestOrientation";

export function parseSTL(arrayBuffer) {
  return new Promise((resolve) => {
    const loader = new STLLoader();
    const geometry = loader.parse(arrayBuffer);
    geometry.computeVertexNormals();
    resolve(geometry);
  });
}

export function runAnalysis(geometry) {
  geometry.computeBoundingBox();

  const boundingBox = geometry.boundingBox;

  const height = (boundingBox.max.z - boundingBox.min.z).toFixed(2);
  const depth = (boundingBox.max.y - boundingBox.min.y).toFixed(2);
  const width = (boundingBox.max.x - boundingBox.min.x).toFixed(2);
  const minWallThickness = estimateMinimumWallThickness(geometry);
  const orientation = bestOrientation(geometry);

  const result = {
    width: width,
    height: height,
    depth: depth,
    wallTooThin: minWallThickness < 1.2, // Example threshold in mm
    wallThickness: minWallThickness,
    nonManifold: checkNonManifold(geometry),
    orientation: orientation,
  };

  return result;
}

function estimateMinimumWallThickness(geometry, sampleLimit = 500) {
  const posAttr = geometry.attributes.position;
  const vertices = [];

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);
    vertices.push(new THREE.Vector3(x, y, z));
  }

  // Randomly sample a subset of vertices to reduce processing
  const shuffled = vertices.sort(() => 0.5 - Math.random());
  const sampled = shuffled.slice(0, sampleLimit);

  let minDistance = Infinity;

  for (let i = 0; i < sampled.length; i++) {
    for (let j = i + 1; j < sampled.length; j++) {
      const dist = sampled[i].distanceTo(sampled[j]);
      if (dist > 0 && dist < minDistance) {
        minDistance = dist;
      }
    }
  }

  return minDistance.toFixed(2);
}
// Very basic non-manifold edge detection
function checkNonManifold(geometry) {
  const edgeCount = new Map();
  const pos = geometry.attributes.position.array;

  for (let i = 0; i < pos.length; i += 9) {
    const a = `${pos[i]},${pos[i + 1]},${pos[i + 2]}`;
    const b = `${pos[i + 3]},${pos[i + 4]},${pos[i + 5]}`;
    const c = `${pos[i + 6]},${pos[i + 7]},${pos[i + 8]}`;

    [
      [a, b],
      [b, c],
      [c, a],
    ].forEach(([v1, v2]) => {
      const edge = v1 < v2 ? `${v1}_${v2}` : `${v2}_${v1}`;
      edgeCount.set(edge, (edgeCount.get(edge) || 0) + 1);
    });
  }

  let nonManifoldEdges = 0;
  edgeCount.forEach((count) => {
    if (count > 2) nonManifoldEdges++;
  });

  return nonManifoldEdges > 0;
}
