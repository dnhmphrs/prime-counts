// primeComputation.js - CPU-side prime calculations

export class PrimeComputationSystem {
    constructor() {
        this.maxTier = 150;
        this.primeCache = new Map();
        this.divisibilityCache = new Map();
        this.dotPositionCache = new Map();
        
        // Pre-compute all data once
        this.preComputeAll();
    }
    
    // Efficient prime checking using sieve
    generatePrimeSieve(limit) {
        const sieve = new Array(limit + 1).fill(true);
        sieve[0] = sieve[1] = false;
        
        for (let i = 2; i * i <= limit; i++) {
            if (sieve[i]) {
                for (let j = i * i; j <= limit; j += i) {
                    sieve[j] = false;
                }
            }
        }
        return sieve;
    }
    
    // Get the highest priority divisor for coloring
    getHighestPriorityDivisor(n) {
        const priorities = [17, 13, 11, 7, 5, 3, 2];
        for (const p of priorities) {
            if (n % p === 0) return p;
        }
        return 0; // No special divisor
    }
    
    // Pre-compute all prime and divisibility data
    preComputeAll() {
        const primeSieve = this.generatePrimeSieve(this.maxTier);
        
        for (let i = 2; i <= this.maxTier; i++) {
            // Store prime info
            this.primeCache.set(i, primeSieve[i]);
            
            // Store divisibility priority
            this.divisibilityCache.set(i, this.getHighestPriorityDivisor(i));
            
            // Pre-compute dot positions for this tier
            this.preComputeDotPositions(i);
        }
    }
    
    // Pre-compute dot positions for a tier
    preComputeDotPositions(tier) {
        const positions = [];
        const numDots = Math.min(tier, 50); // Limit for performance
        
        for (let j = 0; j < numDots; j++) {
            const angle = (j / tier) * 2 * Math.PI;
            const radius = tier;
            
            positions.push({
                x: radius * Math.cos(angle),
                y: radius * Math.sin(angle),
                tier: tier,
                index: j
            });
        }
        
        this.dotPositionCache.set(tier, positions);
    }
    
    // Generate uniforms for full shader
    generateFullShaderUniforms() {
        const primeData = new Float32Array(this.maxTier);
        const divisibilityData = new Float32Array(this.maxTier);
        const dotPositions = new Float32Array(300); // Flattened x,y pairs
        
        let dotIndex = 0;
        
        for (let i = 2; i < this.maxTier && i < 50; i++) { // Limit to 50 for performance
            primeData[i] = this.primeCache.get(i) ? 1.0 : 0.0;
            divisibilityData[i] = this.divisibilityCache.get(i) || 0;
            
            const dots = this.dotPositionCache.get(i) || [];
            
            // Pack dot positions into flat array
            for (let j = 0; j < Math.min(dots.length, 10) && dotIndex < 298; j++) {
                dotPositions[dotIndex++] = dots[j].x;
                dotPositions[dotIndex++] = dots[j].y;
            }
            
            // Add end marker
            if (dotIndex < 298) {
                dotPositions[dotIndex++] = 0.0;
                dotPositions[dotIndex++] = 0.0;
            }
        }
        
        return {
            primeData: primeData,
            divisibilityData: divisibilityData,
            dotPositions: dotPositions,
            maxTier: Math.min(this.maxTier, 50)
        };
    }
    
    // Generate uniforms for simple shader
    generateSimpleShaderUniforms() {
        const simplePrimes = new Float32Array(30);
        const simpleDots = new Float32Array(60); // 30 * 2 for x,y pairs
        
        for (let i = 2; i < 30; i++) {
            simplePrimes[i] = this.primeCache.get(i) ? 1.0 : 0.0;
            
            // Just one representative dot per tier for simplicity
            const dots = this.dotPositionCache.get(i) || [];
            if (dots.length > 0) {
                simpleDots[i * 2] = dots[0].x * 0.5; // Scale down
                simpleDots[i * 2 + 1] = dots[0].y * 0.5;
            }
        }
        
        return {
            simplePrimeData: simplePrimes,
            simpleDotPositions: simpleDots,
            simpleMaxTier: 30
        };
    }
    
    // Generate animated uniforms for interactive shader
    generateInteractiveUniforms(time, mouse) {
        const animatedPrimes = new Float32Array(50);
        const animatedDots = new Float32Array(100); // 50 * 2
        const tierOpacity = new Float32Array(50);
        
        for (let i = 2; i < 50; i++) {
            animatedPrimes[i] = this.primeCache.get(i) ? 1.0 : 0.0;
            
            // Animated opacity based on mouse and time
            const baseOpacity = this.primeCache.get(i) ? 0.8 : 0.4;
            const timeVariation = Math.sin(time * 0.5 + i * 0.1) * 0.3;
            tierOpacity[i] = Math.max(0.1, baseOpacity + timeVariation);
            
            // Animated dot positions
            const dots = this.dotPositionCache.get(i) || [];
            if (dots.length > 0) {
                const animOffset = time * 0.1 + mouse.x * 2;
                const dot = dots[0];
                
                animatedDots[i * 2] = dot.x + Math.sin(animOffset + i) * 2;
                animatedDots[i * 2 + 1] = dot.y + Math.cos(animOffset + i) * 2;
            }
        }
        
        return {
            animatedPrimes: animatedPrimes,
            animatedDots: animatedDots,
            tierOpacity: tierOpacity
        };
    }
    
    // Get statistics for debugging
    getStats() {
        const primeCount = Array.from(this.primeCache.values()).filter(Boolean).length;
        const totalDots = Array.from(this.dotPositionCache.values())
            .reduce((sum, dots) => sum + dots.length, 0);
            
        return {
            maxTier: this.maxTier,
            primeCount: primeCount,
            totalDots: totalDots,
            memoryUsage: {
                primes: this.primeCache.size,
                divisibility: this.divisibilityCache.size,
                dotPositions: this.dotPositionCache.size
            }
        };
    }
}

// Usage in your Three.js setup:
export function setupOptimizedPrimeShaders(THREE) {
    const primeSystem = new PrimeComputationSystem();
    const stats = primeSystem.getStats();
    
    console.log('Prime computation system initialized:', stats);
    
    return {
        primeSystem,
        
        // Create material for full shader
        createFullMaterial: (vertexShader, fragmentShader) => {
            const uniforms = primeSystem.generateFullShaderUniforms();
            
            return new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                uniforms: {
                    time: { value: 0 },
                    mouse: { value: new THREE.Vector2() },
                    color1: { value: new THREE.Color(0xA020F0) },
                    color2: { value: new THREE.Color(0xd0d0d0) },
                    color3: { value: new THREE.Color(0x0000ff) },
                    primeData: { value: uniforms.primeData },
                    divisibilityData: { value: uniforms.divisibilityData },
                    dotPositions: { value: uniforms.dotPositions },
                    maxTier: { value: uniforms.maxTier }
                }
            });
        },
        
        // Create material for simple shader
        createSimpleMaterial: (vertexShader, fragmentShader) => {
            const uniforms = primeSystem.generateSimpleShaderUniforms();
            
            return new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                uniforms: {
                    time: { value: 0 },
                    mouse: { value: new THREE.Vector2() },
                    color1: { value: new THREE.Color(0xA020F0) },
                    color2: { value: new THREE.Color(0xbb4500) },
                    color3: { value: new THREE.Color(0x5099b4) },
                    simplePrimeData: { value: uniforms.simplePrimeData },
                    simpleDotPositions: { value: uniforms.simpleDotPositions },
                    simpleMaxTier: { value: uniforms.simpleMaxTier }
                }
            });
        },
        
        // Create material for interactive shader
        createInteractiveMaterial: (vertexShader, fragmentShader) => {
            return new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                uniforms: {
                    time: { value: 0 },
                    mouse: { value: new THREE.Vector2() },
                    color1: { value: new THREE.Color(0xd0d0d0) },
                    color2: { value: new THREE.Color(0x006994) },
                    color3: { value: new THREE.Color(0x8fbd5a) },
                    animatedPrimes: { value: new Float32Array(50) },
                    animatedDots: { value: new Float32Array(100) },
                    tierOpacity: { value: new Float32Array(50) }
                }
            });
        },
        
        // Update function for interactive shader
        updateInteractiveUniforms: (material, time, mouse) => {
            const uniforms = primeSystem.generateInteractiveUniforms(time, mouse);
            material.uniforms.animatedPrimes.value = uniforms.animatedPrimes;
            material.uniforms.animatedDots.value = uniforms.animatedDots;
            material.uniforms.tierOpacity.value = uniforms.tierOpacity;
        }
    };
}