precision highp float; // Use medium precision for balance between quality and performance
varying vec2 vUv;
uniform vec3 color1;
uniform vec3 color2;
uniform vec3 color3;
uniform vec2 mouse;
uniform float aspectRatio;

// Function to create a symmetric and positive definite matrix
mat3 createDynamicOmega(vec2 mouse) {
    mouse.x *= 0.2;
    mouse.y *= 0.2;
    float sinX = sin(3.14159 * mouse.x);
    float cosY = cos(3.14159 *mouse.y);

    // Define the matrix B
    return mat3(
        1.0 + 0.5 * sin(mouse.x * 3.14159), 0.5 * cos(mouse.y * 3.14159), 0.2 * sin(mouse.x),
        0.5 * cos(mouse.x), 1.0 + 0.5 * cos(mouse.y * 3.14159), 0.1 * sin(mouse.x * 3.14159),
        0.2 * sin(mouse.x), 0.1 * cos(mouse.x), 1.0 + 0.5 * sin(mouse.y * 3.14159)
    );
}

const int N = 1; // Reduced number of terms in the series for better performance

// Function to compute the real part of the Riemann theta function
float riemannThetaReal(vec3 z, mat3 Omega) {
    float sum = 0.0;

    // Iterate over the range of n values for 3 dimensions
    for (int n1 = -N; n1 <= N; ++n1) {
        for (int n2 = -N; n2 <= N; ++n2) {
            for (int n3 = -N; n3 <= N; ++n3) {
                vec3 n = vec3(float(n1), float(n2), float(n3));

                // Compute n^T * Omega * n
                float nt_Omega_n = dot(n, Omega * n);

                // Compute 2 * n^T * z
                float nt_z = 2.0 * dot(n, z);

                // Compute the real part of the exponential term
                float exponent = 3.14159 * (nt_Omega_n + nt_z);
                float realPart = tan(exponent); // Use cosine for the real part

                sum += realPart;
            }
        }
    }

    return sum;
}

void main() {
    // Map the fragment coordinates to the complex plane
    float x = vUv.x * 0.5 - 0.25;
    float y = vUv.y * 0.5 - 0.25;

    // Create a dynamic Riemann matrix based on mouse input
    mat3 OmegaDynamic = createDynamicOmega(mouse); // createDynamicOmega(mouse);

    // Construct a 3D vector for the z variable
    vec3 z = vec3(x, y, 2.0); // Static third component

    // Calculate the real part of the Riemann theta function at z
    float thetaValueReal = riemannThetaReal(z, OmegaDynamic);

    // Normalize thetaValue to map to color range
    float normalizedTheta = 0.5 + 0.5 * thetaValueReal;

    // Create gradients for visualization
    vec3 gradient1 = mix(color1, color2, normalizedTheta);
    vec3 gradient2 = mix(color3, gradient1, 0.5 + 0.5 * sin(normalizedTheta));

    gl_FragColor = vec4(gradient2, 1.0);
}
