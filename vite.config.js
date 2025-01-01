import { defineConfig } from "vite";
export default defineConfig({
  base: '/threejs-rocket-game/',
  optimizeDeps: {
    include: [
      '@tweenjs/tween.js',
      'three/examples/jsm/controls/OrbitControls.js',
      'three/examples/jsm/loaders/GLTFLoader.js'
    ]
  },
});