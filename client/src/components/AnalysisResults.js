// components/ModelViewer.js
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three-stdlib";

export default function ModelViewer({ file }) {
  const mountRef = useRef();

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10).normalize();
    scene.add(light);

    camera.position.z = 50;

    if (file) {
      const loader = new STLLoader();
      loader.load(URL.createObjectURL(file), (geometry) => {
        const material = new THREE.MeshPhongMaterial({ color: 0x607d8b });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
      });
    }

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => mountRef.current.removeChild(renderer.domElement);
  }, [file]);

  return <div ref={mountRef} style={{ width: "100%", height: "400px" }} />;
}
