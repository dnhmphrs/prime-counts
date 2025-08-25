/ ========== PRIME CIRCLES SIMPLE (OPTIMIZED) ==========
precision mediump float;
varying vec2 vUv;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec2 mouse;
uniform float time;

// Simplified uniforms for better performance
uniform float simplePrimeData[30];   // Only first 30 numbers
uniform vec2 simpleDotPositions[60]; // Pre-computed positions
uniform int simpleMaxTier;

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

void main() {
    vec2 pos = (vUv - 0.5) * 10.0;
    
    // Simple zoom and rotation
    float zoom = 1.0 + mouse.y;
    float rotation = mouse.x * 3.14159;
    
    float c = cos(rotation);
    float s = sin(rotation);
    pos = mat2(c, -s, s, c) * pos / zoom;
    
    vec3 finalColor = vec3(0.02, 0.0, 0.05);
    
    // Central dot
    if (sdCircle(pos, 0.3) < 0.0) {
        finalColor = vec3(0.8, 0.3, 1.0);
    }
    
    // Process simplified prime data
    for (int i = 2; i < 30; i++) {
        if (i >= simpleMaxTier) break;
        
        bool isPrime = simplePrimeData[i] > 0.5;
        float fi = float(i);
        
        // Prime rings
        if (isPrime) {
            float ringDist = abs(sdCircle(pos, fi));
            if (ringDist < 0.08) {
                finalColor = mix(finalColor, vec3(0.2, 0.6, 1.0), 0.4);
            }
        }
        
        // Simplified dots
        vec2 dotPos = simpleDotPositions[i];
        float dotDist = sdCircle(pos - dotPos, 0.2);
        
        if (dotDist < 0.0) {
            vec3 dotCol = isPrime ? vec3(1.0, 1.0, 0.8) : vec3(0.5, 0.3, 0.8);
            float fade = smoothstep(0.0, -0.1, dotDist);
            finalColor = mix(finalColor, dotCol, fade);
        }
    }
    
    gl_FragColor = vec4(finalColor, 1.0);
}
