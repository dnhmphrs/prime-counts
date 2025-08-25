// ========== PRIME CIRCLES INTERACTIVE (OPTIMIZED) ==========
precision highp float;
varying vec2 vUv;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec2 mouse;
uniform float time;

// Animation-friendly uniforms
uniform float animatedPrimes[50];
uniform vec2 animatedDots[100];
uniform float tierOpacity[50];

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

void main() {
    vec2 pos = (vUv - 0.5) * 20.0;
    
    // Dynamic animation based on time and mouse
    float timeOffset = time * 0.5 + mouse.x * 10.0;
    float layerFilter = mouse.y;
    
    vec3 finalColor = vec3(0.01, 0.0, 0.03);
    
    // Animated central point
    float pulse = 0.3 + 0.2 * sin(time * 2.0);
    if (sdCircle(pos, pulse) < 0.0) {
        finalColor = vec3(1.0, 0.5, 1.0);
    }
    
    // Animated tiers
    for (int i = 2; i < 50; i++) {
        float fi = float(i);
        bool isPrime = animatedPrimes[i] > 0.5;
        float opacity = tierOpacity[i] * layerFilter;
        
        if (opacity < 0.1) continue;
        
        // Rotating tier effects
        float tierRotation = timeOffset + fi * 0.1;
        vec2 rotatedPos = pos;
        
        // Animated dots with spiral
        vec2 dotPos = animatedDots[i];
        float spiralRadius = fi + sin(tierRotation + fi) * 2.0;
        
        vec2 finalDotPos = vec2(
            cos(tierRotation) * spiralRadius + dotPos.x,
            sin(tierRotation) * spiralRadius + dotPos.y
        );
        
        float dotDist = sdCircle(pos - finalDotPos, 0.15);
        
        if (dotDist < 0.0) {
            vec3 dotCol = isPrime ? 
                vec3(1.0, 0.8, 0.2) * (1.0 + sin(time * 3.0) * 0.3) :
                vec3(0.3, 0.6, 1.0) * (1.0 + cos(time * 2.0) * 0.2);
                
            float fade = smoothstep(0.0, -0.1, dotDist) * opacity;
            finalColor = mix(finalColor, dotCol, fade);
        }
        
        // Animated connecting lines
        if (isPrime && i > 2) {
            // Simple line effect between prime tiers
            float lineGlow = exp(-abs(length(pos) - fi) * 0.5) * 0.1 * opacity;
            finalColor += vec3(0.1, 0.3, 0.6) * lineGlow;
        }
    }
    
    // Dynamic background effects
    float bgWave = sin(pos.x * 0.1 + time) * cos(pos.y * 0.1 + time) * 0.05;
    finalColor += vec3(0.02, 0.01, 0.05) * bgWave;
    
    gl_FragColor = vec4(finalColor, 1.0);
}