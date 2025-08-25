// ========== PRIME CIRCLES FULL (OPTIMIZED) ==========
precision highp float;
varying vec2 vUv;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec2 mouse;
uniform float time;

// Pre-computed data uniforms (much more efficient!)
uniform float primeData[150];        // 0.0 = composite, 1.0 = prime
uniform float divisibilityData[150]; // encoded divisibility info
uniform float dotPositions[300];     // pre-computed dot positions (x,y pairs)
uniform int maxTier;

const float PI = 3.14159265359;
const float DOT_RADIUS = 0.3;

// Distance to a circle
float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

void main() {
    // Map coordinates with mouse interaction
    vec2 pos = (vUv - 0.5) * 15.0;
    
    // Mouse controls: X for rotation, Y for zoom
    float zoom = 0.5 + mouse.y * 1.5;
    float rotation = mouse.x * PI * 2.0;
    
    // Apply rotation
    float c = cos(rotation);
    float s = sin(rotation);
    pos = mat2(c, -s, s, c) * pos;
    pos /= zoom;
    
    vec3 finalColor = vec3(0.05, 0.0, 0.1); // Dark purple background
    
    // Central circle
    float centralDist = sdCircle(pos, 0.5);
    if (centralDist < 0.0) {
        finalColor = mix(finalColor, vec3(0.6, 0.2, 0.8), 0.8);
    }
    
    float minDotDist = 1000.0;
    vec3 dotColor = vec3(0.0);
    
    // Iterate through pre-computed data (much faster!)
    for (int i = 2; i < 50; i++) {
        if (i >= maxTier) break;
        
        float ftier = float(i);
        bool isPrime = primeData[i] > 0.5;
        float divisibility = divisibilityData[i];
        
        // Background rings for prime tiers
        if (isPrime) {
            float ringDist = abs(sdCircle(pos, ftier) + 0.05);
            if (ringDist < 0.1) {
                finalColor = mix(finalColor, vec3(0.2, 0.8, 1.0), 0.3);
            }
        }
        
        // Process pre-computed dots
        int dotStartIndex = i * 2; // Each tier stores x,y pairs
        for (int j = 0; j < 50; j++) {
            int dotIndex = dotStartIndex + j * 2;
            if (dotIndex >= 300 || dotIndex + 1 >= 300) break;
            
            vec2 dotPos = vec2(dotPositions[dotIndex], dotPositions[dotIndex + 1]);
            if (dotPos.x == 0.0 && dotPos.y == 0.0) break; // End marker
            
            float dotDist = sdCircle(pos - dotPos, DOT_RADIUS);
            
            if (dotDist < minDotDist) {
                minDotDist = dotDist;
                
                // Use pre-computed divisibility data for coloring
                if (divisibility > 16.5) {
                    dotColor = vec3(1.0, 0.2, 1.0); // 17 - magenta
                } else if (divisibility > 12.5) {
                    dotColor = vec3(1.0, 1.0, 0.2); // 13 - yellow
                } else if (divisibility > 10.5) {
                    dotColor = vec3(0.2, 1.0, 0.2); // 11 - green
                } else if (divisibility > 6.5) {
                    dotColor = vec3(0.2, 1.0, 1.0); // 7 - cyan
                } else if (divisibility > 4.5) {
                    dotColor = vec3(0.2, 0.2, 1.0); // 5 - blue
                } else if (divisibility > 2.5) {
                    dotColor = vec3(0.8, 0.8, 0.8); // 3 - light grey
                } else if (divisibility > 1.5) {
                    dotColor = vec3(0.6, 0.6, 0.6); // 2 - grey
                } else if (isPrime) {
                    dotColor = vec3(1.0, 1.0, 1.0); // prime - white
                } else {
                    dotColor = vec3(0.4, 0.4, 0.4); // composite - dark grey
                }
            }
        }
    }
    
    // Apply dot colors
    if (minDotDist < 0.0) {
        float alpha = smoothstep(0.1, -0.1, minDotDist);
        finalColor = mix(finalColor, dotColor, alpha);
    }
    
    // Add atmospheric glow
    float centerDist = length(pos);
    float glow = exp(-centerDist * 0.1) * 0.3;
    finalColor += vec3(0.1, 0.05, 0.15) * glow;
    
    gl_FragColor = vec4(finalColor, 1.0);
}