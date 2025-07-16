import * as THREE from "three";

export default function bestOrientation(geometry) {
  const orientations = [
    {
      rotation: new THREE.Euler(0, 0, 0),
      instructions: "No rotation needed",
    },
    {
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
      instructions: "Rotate Up 90°",
    },
    {
      rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
      instructions: "Rotate Down 90°",
    },
    {
      rotation: new THREE.Euler(0, 0, Math.PI / 2),
      instructions: "Rotate Left 90°",
    },
    {
      rotation: new THREE.Euler(0, 0, -Math.PI / 2),
      instructions: "Rotate Right 90°",
    },
    {
      rotation: new THREE.Euler(Math.PI, 0, 0),
      instructions: "Rotate Backward 180°",
    },
  ];

  let best = null;
  let bestScore = -Infinity;

  orientations.forEach(({ rotation, instructions }) => {
    const clone = geometry.clone();
    clone.rotateX(rotation.x);
    clone.rotateY(rotation.y);
    clone.rotateZ(rotation.z);
    clone.computeBoundingBox();

    const area = estimateContactArea(clone);
    const height = clone.boundingBox.max.z - clone.boundingBox.min.z;
    const score = area / height;

    if (score > bestScore) {
      bestScore = score;
      best = {
        instructions,
        x: THREE.MathUtils.radToDeg(rotation.x),
        y: THREE.MathUtils.radToDeg(rotation.y),
        z: THREE.MathUtils.radToDeg(rotation.z),
      };
    }
  });

  return best;
}

function estimateContactArea(geometry, threshold = 0.01) {
  geometry.computeBoundingBox();
  const minZ = geometry.boundingBox.min.z;

  const pos = geometry.attributes.position.array;
  let totalArea = 0;

  for (let i = 0; i < pos.length; i += 9) {
    const a = new THREE.Vector3(pos[i], pos[i + 1], pos[i + 2]);
    const b = new THREE.Vector3(pos[i + 3], pos[i + 4], pos[i + 5]);
    const c = new THREE.Vector3(pos[i + 6], pos[i + 7], pos[i + 8]);

    const avgZ = (a.z + b.z + c.z) / 3;

    if (Math.abs(avgZ - minZ) <= threshold) {
      // Triangle area using Heron's formula (simplified in Three.js)
      const triangle = new THREE.Triangle(a, b, c);
      totalArea += triangle.getArea();
    }
  }

  return totalArea;
}
