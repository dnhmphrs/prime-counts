<script>
  import { onMount } from 'svelte';
  // import { hexToWebGLColor } from './webgl/UtilFunctions.js';
  import { setupBackground, drawBackground, cleanupBackground, setupCentralShader, drawCentralShader } from './webgl/Background.js';
  import bgVertShaderSource from './shaders/bgVertex.glsl';
  import riemannRealFragShaderSource from './shaders/riemannRealFrag.glsl';
  import riemannImaginaryFragShaderSource from './shaders/riemannImaginaryFrag.glsl';
  import riemannLatticeFragShaderSource from './shaders/riemannLatticeFrag.glsl';
  import kpEquationFragShaderSource from './shaders/kpEquationFrag.glsl';
  import Header from '$lib/components/header.svelte';

  let canvas;
  let canvasCentral;
  let aspectRatio;
  let mouse = { x: 0, y: 0 };

  let fps = 0;
  let currentShader = 'kpEquation';
  let bg, central;

  onMount(async () => {
    // -------------------------------------------------------------------------
    // SETUP CONTEXT
    // -------------------------------------------------------------------------

    const gl = canvas.getContext('webgl');
    const glCentral = canvasCentral.getContext('webgl');
    if (!gl || !glCentral) {
      console.error('Unable to initialize WebGL.');
      return;
    }

    // -------------------------------------------------------------------------
    // INITIALIZATION
    // -------------------------------------------------------------------------

    function resizeCanvasToDisplaySize(canvas, multiplier = 1) {
        const width  = canvas.clientWidth * multiplier | 0;
        const height = canvas.clientHeight * multiplier | 0;

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            return true; // Indicates the canvas was resized
        }

        return false; // Indicates the canvas size was not changed
    }

    function resizeCanvas() {
      if (resizeCanvasToDisplaySize(canvas, window.devicePixelRatio)) {
        aspectRatio = canvas.width / canvas.height;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      if (resizeCanvasToDisplaySize(canvasCentral, window.devicePixelRatio)) {
        glCentral.viewport(0, 0, canvasCentral.width, canvasCentral.height);
      }
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', (event) => {
      mouse.x = event.clientX / window.innerWidth;
      mouse.y = event.clientY / window.innerHeight;
    });
    resizeCanvas(); // Initial size

    loadShaders(gl, glCentral);
    
		// const white = hexToWebGLColor(0xf0f0f0);
		// const black = hexToWebGLColor(0x232323);

    // -------------------------------------------------------------------------
    // RENDER LOOP
    // -------------------------------------------------------------------------

    function render() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      glCentral.clear(glCentral.COLOR_BUFFER_BIT);

      drawBackground(gl, bg, aspectRatio, mouse);
      drawCentralShader(glCentral, central, aspectRatio, mouse);

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    // FPS Counter
    let lastTime = performance.now();
    function updateFps() {
      const now = performance.now();
      fps = Math.round(1000 / (now - lastTime));
      lastTime = now;
      requestAnimationFrame(updateFps);
    }
    updateFps();

    canvas.style.opacity = 1;
    canvasCentral.style.opacity = 1;

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cleanupBackground(gl, bg);
      cleanupBackground(glCentral, central);
    };
  });

  function loadShaders(gl, glCentral) {
    switch (currentShader) {
      case 'riemannReal':
        bg = setupBackground(gl, bgVertShaderSource, riemannRealFragShaderSource);
        central = setupCentralShader(glCentral, bgVertShaderSource, riemannRealFragShaderSource);
        break;
      case 'riemannImaginary':
        bg = setupBackground(gl, bgVertShaderSource, riemannImaginaryFragShaderSource);
        central = setupCentralShader(glCentral, bgVertShaderSource, riemannImaginaryFragShaderSource);
        break;
      case 'riemannLattice':
        bg = setupBackground(gl, bgVertShaderSource, riemannLatticeFragShaderSource);
        central = setupCentralShader(glCentral, bgVertShaderSource, riemannLatticeFragShaderSource);
        break;
      case 'kpEquation':
        bg = setupBackground(gl, bgVertShaderSource, kpEquationFragShaderSource);
        central = setupCentralShader(glCentral, bgVertShaderSource, kpEquationFragShaderSource);
        break;
    }
  }

  function setShader(shader) {
    currentShader = shader;
    const gl = canvas.getContext('webgl');
    const glCentral = canvasCentral.getContext('webgl');
    if (!gl || !glCentral) {
      console.error('Unable to initialize WebGL.');
      return;
    }
    loadShaders(gl, glCentral);
  }
</script>

<canvas bind:this={canvas} class:fullscreen={true}></canvas>
<canvas bind:this={canvasCentral} class:central={true}></canvas>
<Header {setShader} />
<div class="fps">FPS: {fps}</div>

<style>
.fullscreen  {
  position: absolute;
  top: 0;
  left:0;
  width: 100%;
  height: 100%;
  display: block; /* Removes potential extra space below the canvas */
  padding: 0;
  margin: 0;
  border: none;
  z-index: -1;
  opacity: 1;
}

.central {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 600px; /* Fixed size for better performance */
    height: 600px; /* Fixed size for better performance */
    transform: translate(-50%, -50%);
    z-index: 1;
    opacity: 1;
    /* opacity: 0;
    transition: opacity 0.5s ease-in-out; */
  }

  .fps {
    position: absolute;
    top: 60px;
    left: 10px;
    color: white;
    z-index: 2;
  }
</style>
