// src/getRocketBolt.js
import * as THREE from "three";

function getRocketBolt() {
  const hue = Math.random() * 0.25;
  const bolt = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.4, 0.04),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 1.0, 0.5),
    })
  );

  // Position the bolt at the tip of the rocket (assuming (0, -0.5, 0) is the tip)
  bolt.position.set(0, -0.5, 0);
  bolt.rotation.z = 0; // Initialize rotation
  bolt.visible = false;

  // Define boundingRadius based on geometry
  bolt.boundingRadius = Math.sqrt(0.04 ** 2 + 0.4 ** 2 + 0.04 ** 2) / 2;

  function update() {
    if (bolt.visible === true) {
      bolt.position.x += Math.cos(boltDirection) * boltSpeed;
      bolt.position.y += Math.sin(boltDirection) * boltSpeed;

      // Hide the bolt if it goes out of bounds
      if (
        bolt.position.x > 10 ||
        bolt.position.x < -10 ||
        bolt.position.y > 10 ||
        bolt.position.y < -10
      ) {
        bolt.visible = false;
      }
    }
  }

  const boltSpeed = 0.2;
  let boltDirection = 0;

  function fire(directionAngle) {
    bolt.visible = true;
    boltDirection = directionAngle;
    bolt.rotation.z = directionAngle; // Align bolt rotation with direction
    bolt.position.set(0, -0.5, 0); // Reset position to tip
    console.log(`Bolt fired in direction ${directionAngle}`);
  }

  bolt.userData = {
    fire,
    update,
  };

  return bolt;
}

export default getRocketBolt;
