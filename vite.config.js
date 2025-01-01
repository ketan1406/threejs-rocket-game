import { defineConfig } from "vite";
export default defineConfig({
  base: '/',  // Replace with the correct repo name
  optimizeDeps: {
    include: [
      '@tweenjs/tween.js',
      'three/examples/jsm/controls/OrbitControls.js',
      'three/examples/jsm/loaders/GLTFLoader.js'
    ]
  },
});