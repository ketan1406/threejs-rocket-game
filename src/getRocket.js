// src/getRocket.js
import * as THREE from "three";
import { Tween, Easing } from '@tweenjs/tween.js';
import getRocketBolt from "./getRocketBolt.js";

let goalThrustMag = 0;
let isThrusting = false;

function getBolts(rocketGroup) {
  const numBolts = 10;
  const bolts = [];
  for (let i = 0; i < numBolts; i += 1) {
    let bolt = getRocketBolt(); // Removed rocket parameter
    bolts.push(bolt);
    rocketGroup.add(bolt); // Add bolt to rocketGroup
  }
  rocketGroup.userData.bolts = bolts;
  return bolts;
}

function getRocket(glb) {
  let rocketGroup = new THREE.Group();
  const size = 1.35;
  glb.scale.set(size, size, size);
  glb.position.set(-0.05, -0.5, 0);
  rocketGroup.add(glb);
  rocketGroup.position.set(-3, 0, 0);

  // Collision Sphere
  let directionAngle = 0;
  const radius = 0.18;
  const geometry = new THREE.IcosahedronGeometry(radius, 4);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0.2,
  });
  const collisionSphere = new THREE.Mesh(geometry, material);
  rocketGroup.add(collisionSphere);

  // Define boundingRadius based on geometry
  rocketGroup.boundingRadius = radius;

  // Thrust Fire Mesh
  const thrustFireGeo = new THREE.OctahedronGeometry(0.1, 0);
  const thrustFireMat = new THREE.MeshBasicMaterial({
    color: 0xFFFF00,
  });
  const thrustFireMesh = new THREE.Mesh(thrustFireGeo, thrustFireMat);
  thrustFireMesh.scale.y = 2;
  thrustFireMesh.position.set(0.04, -0.35, 0);
  thrustFireMesh.visible = false;
  rocketGroup.add(thrustFireMesh);

  let thrustMag = 0;
  let thrustDirection = 0;
  const decay = 0.01;

  let isRotatingLeft = false;
  let isRotatingRight = false;
  
  function rotateLeft(isTrue) {
    console.log("rotateLeft", isTrue);
    isRotatingLeft = isTrue;
  }
  
  function rotateRight(isTrue) {
    isRotatingRight = isTrue;
  }
  
  function thrust(isOn) {
    isThrusting = isOn;
    thrustFireMesh.visible = isOn;
    if (isOn === true) {
      goalThrustMag += 0.05;
    } else {
      goalThrustMag = 0;
    }
  }

  const screenBounds = { x: 5.5, y: 4 };
  const bolts = getBolts(rocketGroup); // Pass rocketGroup
  let boltIndex = 0;
  
  function fire() {
    boltIndex += 1;
    if (boltIndex >= bolts.length) {
      boltIndex = 0;
    }
    let curBolt = bolts[boltIndex];
    curBolt?.userData.fire(directionAngle);
    console.log(`Firing bolt #${boltIndex} at direction ${directionAngle}`);
    return curBolt;
  }
  
  const rotationRate = 0.05;
  
  function update() {
    if (isRotatingLeft === true) {
      directionAngle += rotationRate;
    }
    if (isRotatingRight === true) {
      directionAngle -= rotationRate;
    }
    let direction = directionAngle;
    rocketGroup.rotation.z = direction - Math.PI * 0.5;
    thrustMag -= (thrustMag - goalThrustMag) * decay;
    if (isThrusting === true) {
      thrustDirection = direction;
    }
    if (!isTweening) {
      rocketGroup.position.x += Math.cos(thrustDirection) * thrustMag;
      rocketGroup.position.y += Math.sin(thrustDirection) * thrustMag;
    }
    if (
      rocketGroup.position.x < -screenBounds.x ||
      rocketGroup.position.x > screenBounds.x
    ) {
      rocketGroup.position.x *= -1;
    }
    if (
      rocketGroup.position.y < -screenBounds.y ||
      rocketGroup.position.y > screenBounds.y
    ) {
      rocketGroup.position.y *= -1;
    }
    bolts.forEach(b => b.userData.update());
  }

  let isTweening = false;
  
  function playHitAnimation() {
    if (!isTweening) {
      thrustMag = 0;
      isTweening = true;
      let goalRote = new THREE.Vector3(0, 0, Math.PI * 12);
      let roteTween = new Tween(rocketGroup.rotation)
        .to({ x: goalRote.x, y: goalRote.y, z: goalRote.z }, 2000)
        .easing(Easing.Linear.None)
        .onComplete(() => {
          rocketGroup.rotation.set(0, 0, 0);
          rocketGroup.position.set(-3, 0, 0);
          isTweening = false;
        })
        .start();
    }
  }

  rocketGroup.userData = {
    bolts,
    fire,
    getBolts: () => bolts,
    playHitAnimation,
    radius,
    rotateLeft,
    rotateRight,
    thrust,
    update,
  };
  
  return rocketGroup;
}

export default getRocket;
