// src/main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { update } from '@tweenjs/tween.js'; // Correct Import
import getRocket from './getRocket.js';
import getSaucer from './getSaucer.js';
import getStarfield from './getStarfield.js';

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(w, h);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

const manager = new THREE.LoadingManager();
const loader = new GLTFLoader(manager);
const glbs = ["rocket2", "saucer"];
const path = "/assets/"; // Absolute path to public/assets/
const sceneData = {
  models: [],
  fontData: null,
};
manager.onLoad = () => initScene(sceneData);
glbs.forEach((name) => {
  loader.load(`${path}${name}.glb`, (glb) => {
    glb.name = name;
    sceneData.models.push(glb);
  });
});

function initScene(data) {
  let rocket = null;
  let saucer = null;
  const { models } = data;
  models.forEach((model) => {
    if (model.name === "rocket2") {
      rocket = getRocket(model.scene);
      scene.add(rocket);
    }
    if (model.name === "saucer") {
      saucer = getSaucer(model.scene);
      scene.add(saucer);
    }
  });

  const stars = getStarfield({ numStars: 500 });
  scene.add(stars);

  // Add Lights
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff);
  scene.add(hemiLight);
  const sunLight = new THREE.DirectionalLight(0xffffff, 3);
  sunLight.position.set(-1, 1, 1);
  scene.add(sunLight);

  function checkCollision(bolt, saucer) {
    // Get world positions
    const boltWorldPos = new THREE.Vector3();
    bolt.getWorldPosition(boltWorldPos);

    const saucerWorldPos = new THREE.Vector3();
    saucer.getWorldPosition(saucerWorldPos);

    // Calculate distance
    const distance = boltWorldPos.distanceTo(saucerWorldPos);
    console.log(`Bolt at (${boltWorldPos.x.toFixed(2)}, ${boltWorldPos.y.toFixed(2)}, ${boltWorldPos.z.toFixed(2)})`);
    console.log(`Saucer at (${saucerWorldPos.x.toFixed(2)}, ${saucerWorldPos.y.toFixed(2)}, ${saucerWorldPos.z.toFixed(2)})`);
    console.log(`Distance: ${distance.toFixed(2)}, Collision Threshold: ${(bolt.boundingRadius + saucer.boundingRadius).toFixed(2)}`);

    return distance < (bolt.boundingRadius + saucer.boundingRadius);
  }

  function showSuccessMessage() {
    const messageDiv = document.getElementById('message');
    messageDiv.style.display = 'block';
    
    // Optional: Add animation classes or styles
    
    // Hide after a certain duration
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000); // 5 seconds
  }
  
  function handleCollision() {
    // Play hit animation
    saucer.userData.playHitAnimation();
    // Display message
    showSuccessMessage();
  }

  function animate(t = 0) {
    requestAnimationFrame(animate);
    update(t); // Correctly imported 'update' function

    // Update game objects
    saucer.userData.update(t);
    rocket.userData.update();

    // Update and check bullets
    rocket.userData.bolts.forEach(bolt => {
      bolt.userData.update();
      if (checkCollision(bolt, saucer)) {
        console.log('Collision detected between bolt and saucer');
        handleCollision();
        bolt.visible = false;
      }
    });

    renderer.render(scene, camera);
    controls.update();
  }
  
  animate();

  // Event listeners for controls
  window.addEventListener("keydown", (evt) => {
    if (evt.key === 'Space') {
      rocket.userData.fire();
    }
    if (evt.key === "a") {
      rocket.userData.rotateLeft(true);
    }
    if (evt.key === "d") {
      rocket.userData.rotateRight(true);
    }
    if (evt.key === "j") {
      rocket.userData.thrust(true);
      saucer.userData.sense(rocket.position);
    }
  });
  
  window.addEventListener("keyup", (evt) => {
    if (evt.key === 'Space') {
      // Optional: Handle keyup for shooting if needed
    }
    if (evt.key === "a") {
      rocket.userData.rotateLeft(false);
    }
    if (evt.key === "d") {
      rocket.userData.rotateRight(false);
    }
    if (evt.key === "j") {
      rocket.userData.thrust(false);
    }
  });
}

function handleWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);
