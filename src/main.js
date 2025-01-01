// rocket-game/src/main.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { update as tweenUpdate } from '@tweenjs/tween.js'; // Renamed to avoid conflict
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
const path = "assets/"; // Relative path
const sceneData = {
  models: [],
  fontData: null,
};

// Enhanced Error Handling for Loading Manager
manager.onLoad = () => initScene(sceneData);
manager.onError = (url) => {
  console.error(`There was an error loading ${url}`);
};

// Load Models with Error Logging
glbs.forEach((name) => {
  loader.load(
    `${path}${name}.glb`,
    (glb) => {
      glb.name = name;
      sceneData.models.push(glb);
    },
    undefined,
    (error) => {
      console.error(`Error loading ${name}.glb:`, error);
    }
  );
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

  // Check if both models are loaded
  if (!rocket || !saucer) {
    console.error("Rocket or Saucer model failed to load. Game initialization aborted.");
    return;
  }

  const stars = getStarfield({ numStars: 2500 });
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
    tweenUpdate(t); // Correctly imported 'update' function

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

  // Touch Controls with Pointer Events
  const rotateLeftBtn = document.getElementById('rotate-left');
  const rotateRightBtn = document.getElementById('rotate-right');
  const thrustBtn = document.getElementById('thrust');
  const fireBtn = document.getElementById('fire');

  // Rotate Left
  rotateLeftBtn.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    console.log("Rotate Left Pressed");
    rocket.userData.rotateLeft(true);
  });
  rotateLeftBtn.addEventListener('pointerup', (event) => {
    event.preventDefault();
    console.log("Rotate Left Released");
    rocket.userData.rotateLeft(false);
  });
  rotateLeftBtn.addEventListener('pointerleave', (event) => {
    event.preventDefault();
    console.log("Rotate Left Pointer Left");
    rocket.userData.rotateLeft(false);
  });

  // Rotate Right
  rotateRightBtn.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    console.log("Rotate Right Pressed");
    rocket.userData.rotateRight(true);
  });
  rotateRightBtn.addEventListener('pointerup', (event) => {
    event.preventDefault();
    console.log("Rotate Right Released");
    rocket.userData.rotateRight(false);
  });
  rotateRightBtn.addEventListener('pointerleave', (event) => {
    event.preventDefault();
    console.log("Rotate Right Pointer Left");
    rocket.userData.rotateRight(false);
  });

  // Thrust
  thrustBtn.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    console.log("Thrust Pressed");
    rocket.userData.thrust(true);
  });
  thrustBtn.addEventListener('pointerup', (event) => {
    event.preventDefault();
    console.log("Thrust Released");
    rocket.userData.thrust(false);
  });
  thrustBtn.addEventListener('pointerleave', (event) => {
    event.preventDefault();
    console.log("Thrust Pointer Left");
    rocket.userData.thrust(false);
  });

  // Fire
  fireBtn.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    console.log("Fire Pressed");
    rocket.userData.fire();
  });
}
