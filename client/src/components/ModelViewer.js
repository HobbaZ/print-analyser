// components/ModelViewer.js
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { STLLoader } from "three-stdlib";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export default function ModelViewer({ file }) {
  const mountRef = useRef();

  useEffect(() => {
    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;
    const meshColour = 0x607d8b;
    const lightColour = 0xffffff;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(lightColour);
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    camera.position.z = 50;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // Light setup
    const light = new THREE.DirectionalLight(lightColour, 1);
    light.position.set(10, 10, 10).normalize();
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 100;
    scene.add(light);

    // ground setup
    const groundMat = new THREE.ShadowMaterial({
      opacity: 0.3,
    });
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    ground.rotation.x = -Math.PI / 2;

    const handleResize = () => {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Adding OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth motion
    controls.dampingFactor = 0.05;

    const loader = new STLLoader();
    let mesh;

    if (file) {
      loader.load(URL.createObjectURL(file), (geometry) => {
        geometry.computeBoundingBox();
        geometry.center();

        const material = new THREE.MeshPhongMaterial({ color: meshColour });
        mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.castShadow = true;
        scene.add(mesh);

        // Compute bounding box and center
        const box = new THREE.Box3().setFromObject(mesh);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Adjust ground position
        const minY = box.min.y;
        ground.position.y = minY - 0.1;
        scene.add(ground);

        // Position camera
        const fitOffset = 1.2;
        const direction = new THREE.Vector3(0, 0, 1);
        const distance = size.length() * fitOffset;
        camera.position.copy(
          center.clone().add(direction.clone().multiplyScalar(distance))
        );
        controls.target.copy(center);
        camera.lookAt(center);
        controls.update();

        const lightDistance = Math.max(size.x, size.y, size.z) * 2;
        light.position.set(
          center.x + lightDistance,
          center.y + lightDistance,
          center.z + lightDistance
        );
        light.target.position.set(center.x, center.y, center.z);
        scene.add(light.target);

        const shadowCam = light.shadow.camera;
        const maxExtent = Math.max(size.x, size.y, size.z) * 0.6;

        shadowCam.left = -maxExtent;
        shadowCam.right = maxExtent;
        shadowCam.top = maxExtent;
        shadowCam.bottom = -maxExtent;
        shadowCam.near = 0.5;
        shadowCam.far = lightDistance * 3;
        shadowCam.updateProjectionMatrix();
      });
    }

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mesh) scene.remove(mesh);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [file]);

  return <div id="canvas" ref={mountRef} />;
}
