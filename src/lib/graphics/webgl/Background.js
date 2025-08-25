import { createShaderProgram, setupBuffer } from './UtilFunctions';

export function setupBackground(gl, bgVertShaderSource, bgFragShaderSource) {
	const program = createShaderProgram(gl, bgVertShaderSource, bgFragShaderSource);
	const positionBuffer = setupBuffer(gl, [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
	const positionAttributeLocation = gl.getAttribLocation(program, 'position');
	const mouseUniformLocation = gl.getUniformLocation(program, 'mouse');
	const aspectRatioUniformLocation = gl.getUniformLocation(program, 'aspectRatio');
	const color1UniformLocation = gl.getUniformLocation(program, 'color1');
	const color2UniformLocation = gl.getUniformLocation(program, 'color2');
	const color3UniformLocation = gl.getUniformLocation(program, 'color3');

	return {
		program,
		positionBuffer,
		positionAttributeLocation,
		mouseUniformLocation,
		aspectRatioUniformLocation,
		color1UniformLocation,
		color2UniformLocation,
		color3UniformLocation
	};
}

export function setupCentralShader(gl, bgVertShaderSource, bgFragShaderSource) {
	const program = createShaderProgram(gl, bgVertShaderSource, bgFragShaderSource);
	const positionBuffer = setupBuffer(gl, [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
	const positionAttributeLocation = gl.getAttribLocation(program, 'position');
	const mouseUniformLocation = gl.getUniformLocation(program, 'mouse');
	const aspectRatioUniformLocation = gl.getUniformLocation(program, 'aspectRatio');
	const color1UniformLocation = gl.getUniformLocation(program, 'color1');
	const color2UniformLocation = gl.getUniformLocation(program, 'color2');
	const color3UniformLocation = gl.getUniformLocation(program, 'color3');

	return {
		program,
		positionBuffer,
		positionAttributeLocation,
		mouseUniformLocation,
		aspectRatioUniformLocation,
		color1UniformLocation,
		color2UniformLocation,
		color3UniformLocation
	};
}

export function drawBackground(gl, bg, aspectRatio, mouse) {
	gl.useProgram(bg.program);
	gl.bindBuffer(gl.ARRAY_BUFFER, bg.positionBuffer);
	gl.vertexAttribPointer(bg.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(bg.positionAttributeLocation);

	gl.uniform2f(bg.mouseUniformLocation, mouse.x, mouse.y);
	gl.uniform1f(bg.aspectRatioUniformLocation, aspectRatio);
	gl.uniform3f(bg.color1UniformLocation, 0.9, 0.4882, 0.3098);
	gl.uniform3f(bg.color2UniformLocation, 1.0, 0.7137, 0.7569);
	gl.uniform3f(bg.color3UniformLocation, 0.5961, 1.0, 0.5961);

	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export function drawCentralShader(gl, central, aspectRatio, mouse) {
	gl.useProgram(central.program);
	gl.bindBuffer(gl.ARRAY_BUFFER, central.positionBuffer);
	gl.vertexAttribPointer(central.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(central.positionAttributeLocation);

	gl.uniform2f(central.mouseUniformLocation, mouse.x, mouse.y);
	gl.uniform1f(central.aspectRatioUniformLocation, aspectRatio);
	gl.uniform3f(central.color1UniformLocation, 0.9, 0.4882, 0.3098);
	gl.uniform3f(central.color2UniformLocation, 1.0, 0.7137, 0.7569);
	gl.uniform3f(central.color3UniformLocation, 0.5961, 1.0, 0.5961);

	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export function cleanupBackground(gl, bg) {
	gl.deleteProgram(bg.program);
	gl.deleteBuffer(bg.positionBuffer);
}
