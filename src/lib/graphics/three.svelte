<script>
	import { onMount, onDestroy } from 'svelte';
	import { screenType, mousePosition } from '$lib/store/store';
	import { page } from '$app/stores';
	import { afterNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
  
	import * as THREE from 'three';
	import Stats from 'stats.js';
  
	import vertexShader from './shaders/vertexShader-three.glsl';
	import fragmentShader_prime_full from './shaders/primeCirclesFrag.glsl';
	import fragmentShader_prime_simple from './shaders/primeCirclesSimpleFrag.glsl';
	import fragmentShader_prime_interactive from './shaders/primeCirclesInteractiveFrag.glsl';
  
	// Optimized prime computation system (we'll inject THREE)
	import { setupOptimizedPrimeShaders } from './primeComputation.js';
  
	// Shader configuration with optimized approach
	const SHADER_CONFIGS = {
	  '/': {
		fragmentShader: fragmentShader_prime_full,
		colors: { color1: 'color8', color2: 'color1', color3: 'color6' },
		name: 'prime_full_optimized',
		type: 'full'
	  },
	  '/prime-simple': {
		fragmentShader: fragmentShader_prime_simple,
		colors: { color1: 'color8', color2: 'color2', color3: 'color5' },
		name: 'prime_simple_optimized',
		type: 'simple'
	  },
	  '/prime-interactive': {
		fragmentShader: fragmentShader_prime_interactive,
		colors: { color1: 'color1', color2: 'color4', color3: 'color9' },
		name: 'prime_interactive_optimized',
		type: 'interactive'
	  }
	};
  
	// Color palette
	const COLOR_PALETTE = {
	  color0: new THREE.Color(0x232323),
	  color1: new THREE.Color(0xd0d0d0),
	  color2: new THREE.Color(0xbb4500),
	  color3: new THREE.Color(0xdaaa55),
	  color4: new THREE.Color(0x006994),
	  color5: new THREE.Color(0x5099b4),
	  color6: new THREE.Color(0x0000ff),
	  color7: new THREE.Color(0x00ff00),
	  color8: new THREE.Color(0xA020F0),
	  color9: new THREE.Color(0x8fbd5a),
	};
  
	let shaderMaterials = {};
	let primeShaderSystem;
	let container;
	let stats;
	let camera, scene, renderer;
	// Avoid window usage during SSR; set real values in onMount.
	let width = 1;
	let height = 1;
	let mouse = new THREE.Vector2();
	const clock = new THREE.Clock();
  
	// Performance monitoring
	let frameCount = 0;
	let lastFPSCheck = 0;
	let currentFPS = 60;
  
	async function setupShaderMaterials() {
	  // Initialize the optimized prime computation system with THREE injected
	  primeShaderSystem = setupOptimizedPrimeShaders(THREE);
  
	  // (optional) guard if getStats isn’t present
	  try {
		console.log('Prime system stats:', primeShaderSystem?.primeSystem?.getStats?.());
	  } catch { /* ignore */ }
  
	  // Create optimized shader materials
	  Object.entries(SHADER_CONFIGS).forEach(([route, config]) => {
		switch (config.type) {
		  case 'full':
			shaderMaterials[config.name] = primeShaderSystem.createFullMaterial(
			  vertexShader,
			  config.fragmentShader
			);
			break;
		  case 'simple':
			shaderMaterials[config.name] = primeShaderSystem.createSimpleMaterial(
			  vertexShader,
			  config.fragmentShader
			);
			break;
		  case 'interactive':
			shaderMaterials[config.name] = primeShaderSystem.createInteractiveMaterial(
			  vertexShader,
			  config.fragmentShader
			);
			break;
		}
  
		// Set colors (guard each uniform)
		const material = shaderMaterials[config.name];
		if (!material?.uniforms) return;
		const u = material.uniforms;
		if (u.color1) u.color1.value = COLOR_PALETTE[config.colors.color1];
		if (u.color2) u.color2.value = COLOR_PALETTE[config.colors.color2];
		if (u.color3) u.color3.value = COLOR_PALETTE[config.colors.color3];
	  });
	}
  
	function updateShaderUniforms() {
	  const elapsedTime = clock.getElapsedTime();
  
	  // Update common uniforms for all materials
	  Object.values(shaderMaterials).forEach(material => {
		const u = material?.uniforms;
		if (!u) return;
		if (u.time) u.time.value = elapsedTime;
		if (u.mouse) u.mouse.value = mouse;
	  });
  
	  // Special handling for interactive shader
	  const currentRoute = $page.url.pathname;
	  if (currentRoute === '/prime-interactive') {
		const interactiveMaterial = shaderMaterials['prime_interactive_optimized'];
		if (interactiveMaterial && primeShaderSystem?.updateInteractiveUniforms) {
		  primeShaderSystem.updateInteractiveUniforms(
			interactiveMaterial,
			elapsedTime,
			{ x: mouse.x, y: mouse.y }
		  );
		}
	  }
  
	  // Performance monitoring
	  frameCount++;
	  if (elapsedTime - lastFPSCheck > 1.0) {
		currentFPS = frameCount;
		frameCount = 0;
		lastFPSCheck = elapsedTime;
  
		if (currentFPS < 30) {
		  console.warn(`Low FPS detected: ${currentFPS}fps. Consider using simple shader.`);
		}
	  }
	}
  
	async function init() {
	  camera = new THREE.PerspectiveCamera(20, width / height, 1, 800);
	  camera.position.z = 400;
  
	  scene = new THREE.Scene();
	  scene.background = COLOR_PALETTE.color0;
  
	  // Build materials (fix for THREE not defined)
	  await setupShaderMaterials();
  
	  setScene();
  
	  renderer = new THREE.WebGLRenderer({
		antialias: false,
		powerPreference: 'high-performance'
	  });
	  renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2));
	  renderer.setSize(width, height);
  
	  // Now that we're mounted, container exists
	  container.appendChild(renderer.domElement);
	}
  
	function createPrimePlanes(materialName) {
	  const material = shaderMaterials[materialName];
	  if (!material) {
		console.error(`Material ${materialName} not found`);
		return;
	  }
  
	  const backgroundPlane = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), material);
	  const foregroundPlane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), material);
  
	  scene.add(backgroundPlane);
  
	  if ($screenType != 1) {
		foregroundPlane.position.z = 200;
		scene.add(foregroundPlane);
	  } else {
		foregroundPlane.position.z = 100;
		foregroundPlane.rotation.z = Math.PI / 2;
		scene.add(foregroundPlane);
	  }
	}
  
	function setScene() {
	  const currentRoute = $page.url.pathname;
	  const config = SHADER_CONFIGS[currentRoute];
  
	  if (config) {
		createPrimePlanes(config.name);
	  } else {
		console.warn(`Route ${currentRoute} not found, using default`);
		createPrimePlanes(SHADER_CONFIGS['/'].name);
	  }
	}
  
	function onNavigate() {
	  if (!scene) return; // guard if navigation fires before init finished
	  // Clear existing scene objects (and dispose to be safe)
	  for (let i = scene.children.length - 1; i >= 0; i--) {
		const obj = scene.children[i];
		scene.remove(obj);
		if (obj.isMesh) {
		  obj.geometry?.dispose?.();
		  Array.isArray(obj.material)
			? obj.material.forEach(m => m?.dispose?.())
			: obj.material?.dispose?.();
		}
	  }
	  setScene();
	}
  
	function onWindowResize() {
	  if (!renderer || !camera) return;
	  width = window.innerWidth;
	  height = window.innerHeight;
  
	  camera.aspect = width / height;
	  camera.updateProjectionMatrix();
  
	  renderer.setSize(width, height);
	}
  
	function onDocumentMouseMove(event) {
	  const clientX = event.clientX;
	  const clientY = event.clientY;
  
	  mouse.x = (clientX / window.innerWidth) * 2 - 1;
	  mouse.y = -(clientY / window.innerHeight) * 2 + 1;
  
	  // Update store
	  mousePosition.set(mouse);
	}
  
	function animate() {
	  // one loop definition only
	  requestAnimationFrame(animate);
	  if (!renderer) return;
	  stats?.begin();
	  updateShaderUniforms();
	  renderer.render(scene, camera);
	  stats?.end();
	}
  
	// Lifecycle
	onMount(async () => {
	  if (!browser) return;
  
	  width = window.innerWidth;
	  height = window.innerHeight;
  
	  stats = new Stats();
	  stats.showPanel(0);
	  document.body.appendChild(stats.dom);
  
	  await init(); // if this throws, we won't start animate()
	  animate();
  
	  window.addEventListener('mousemove', onDocumentMouseMove);
	  window.addEventListener('resize', onWindowResize);
  
	  // Only start listening to route changes in the browser after init
	  afterNavigate(onNavigate);
	});
  
	onDestroy(() => {
	  window.removeEventListener('mousemove', onDocumentMouseMove);
	  window.removeEventListener('resize', onWindowResize);
  
	  // dispose scene contents
	  scene?.traverse(obj => {
		if (obj.isMesh) {
		  obj.geometry?.dispose?.();
		  Array.isArray(obj.material)
			? obj.material.forEach(m => m?.dispose?.())
			: obj.material?.dispose?.();
		}
	  });
  
	  // dispose shader materials
	  Object.values(shaderMaterials).forEach(m => m?.dispose?.());
	  renderer?.dispose?.();
  
	  // remove stats panel
	  try {
		stats?.dom?.parentNode?.removeChild(stats.dom);
	  } catch { /* ignore */ }
	  stats = null;
	});
  </script>
  
  <div bind:this={container} class:geometry={true} />
  
  <style>
	.geometry {
	  position: absolute;
	  overflow: hidden;
	  z-index: -1;
	}
  </style>
  