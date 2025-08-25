export function createShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
	const vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexShaderSource);
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error(
			'An error occurred compiling the vertex shader:',
			gl.getShaderInfoLog(vertexShader)
		);
		gl.deleteShader(vertexShader);
		return null;
	}

	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentShaderSource);
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error(
			'An error occurred compiling the fragment shader:',
			gl.getShaderInfoLog(fragmentShader)
		);
		gl.deleteShader(fragmentShader);
		return null;
	}

	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('Unable to initialize the shader program:', gl.getProgramInfoLog(program));
		return null;
	}

	return program;
}

export function setupBuffer(gl, data) {
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	return buffer;
}
