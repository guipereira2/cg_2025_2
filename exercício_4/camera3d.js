const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');
if (!gl) {
	alert('WebGL não disponível');
	throw new Error('WebGL não suportado');
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);


const vertexShaderSource = `
	attribute vec3 aPosition;
	attribute vec3 aColor;
	
	uniform mat4 uProjection;
	uniform mat4 uView;
	uniform mat4 uModel;
	
	varying vec3 vColor;
	
	void main() {
		gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
		vColor = aColor;
	}
`;

const fragmentShaderSource = `
	precision mediump float;
	varying vec3 vColor;
	
	void main() {
		gl_FragColor = vec4(vColor, 1.0);
	}
`;


function compileShader(type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error('Erro ao compilar shader:', gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);


const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
	console.error('Erro ao linkar programa:', gl.getProgramInfoLog(program));
}

gl.useProgram(program);


const aPosition = gl.getAttribLocation(program, 'aPosition');
const aColor = gl.getAttribLocation(program, 'aColor');
const uProjection = gl.getUniformLocation(program, 'uProjection');
const uView = gl.getUniformLocation(program, 'uView');
const uModel = gl.getUniformLocation(program, 'uModel');


const cubeVertices = new Float32Array([
	// Face frontal (azul)
	-1, -1,  1,   0.2, 0.6, 1.0,
	 1, -1,  1,   0.2, 0.6, 1.0,
	 1,  1,  1,   0.2, 0.6, 1.0,
	-1,  1,  1,   0.2, 0.6, 1.0,
	// Face traseira
	-1, -1, -1,   0.1, 0.4, 0.7,
	 1, -1, -1,   0.1, 0.4, 0.7,
	 1,  1, -1,   0.1, 0.4, 0.7,
	-1,  1, -1,   0.1, 0.4, 0.7,
	// Face direita (cyan)
	 1, -1, -1,   0.0, 0.8, 0.8,
	 1,  1, -1,   0.0, 0.8, 0.8,
	 1,  1,  1,   0.0, 0.8, 0.8,
	 1, -1,  1,   0.0, 0.8, 0.8,
	// Face esquerda (verde)
	-1, -1, -1,   0.0, 0.8, 0.3,
	-1,  1, -1,   0.0, 0.8, 0.3,
	-1,  1,  1,   0.0, 0.8, 0.3,
	-1, -1,  1,   0.0, 0.8, 0.3,
	// Face superior (amarelo)
	-1,  1, -1,   1.0, 1.0, 0.2,
	 1,  1, -1,   1.0, 1.0, 0.2,
	 1,  1,  1,   1.0, 1.0, 0.2,
	-1,  1,  1,   1.0, 1.0, 0.2,
	// Face inferior (cinza)
	-1, -1, -1,   0.5, 0.5, 0.5,
	 1, -1, -1,   0.5, 0.5, 0.5,
	 1, -1,  1,   0.5, 0.5, 0.5,
	-1, -1,  1,   0.5, 0.5, 0.5
]);

const cubeIndices = new Uint16Array([
	0,1,2, 0,2,3,    // frontal
	4,6,5, 4,7,6,    // traseira
	8,9,10, 8,10,11, // direita
	12,14,13, 12,15,14, // esquerda
	16,17,18, 16,18,19, // superior
	20,22,21, 20,23,22  // inferior
]);

const cubeBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

const cubeIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);

const planeVertices = new Float32Array([
	-10, 0, -10,  0.3, 0.3, 0.3,
	 10, 0, -10,  0.3, 0.3, 0.3,
	 10, 0,  10,  0.4, 0.4, 0.4,
	-10, 0,  10,  0.4, 0.4, 0.4
]);

const planeIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);

const planeBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, planeBuffer);
gl.bufferData(gl.ARRAY_BUFFER, planeVertices, gl.STATIC_DRAW);

const planeIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planeIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, planeIndices, gl.STATIC_DRAW);

const axesVertices = new Float32Array([
	0,0,0, 1,0,0,  5,0,0, 1,0,0,  // X vermelho
	0,0,0, 0,1,0,  0,5,0, 0,1,0,  // Y verde
	0,0,0, 0,0,1,  0,0,5, 0,0,1   // Z azul
]);

const axesBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, axesBuffer);
gl.bufferData(gl.ARRAY_BUFFER, axesVertices, gl.STATIC_DRAW);

function mat4Identity() {
	return new Float32Array([
		1,0,0,0,
		0,1,0,0,
		0,0,1,0,
		0,0,0,1
	]);
}

function mat4Perspective(fov, aspect, near, far) {
	const f = 1.0 / Math.tan(fov / 2);
	const nf = 1 / (near - far);
	return new Float32Array([
		f/aspect, 0, 0, 0,
		0, f, 0, 0,
		0, 0, (far+near)*nf, -1,
		0, 0, 2*far*near*nf, 0
	]);
}

function mat4Translate(x, y, z) {
	return new Float32Array([
		1,0,0,0,
		0,1,0,0,
		0,0,1,0,
		x,y,z,1
	]);
}

function mat4RotateY(angle) {
	const c = Math.cos(angle);
	const s = Math.sin(angle);
	return new Float32Array([
		c,0,s,0,
		0,1,0,0,
		-s,0,c,0,
		0,0,0,1
	]);
}

function mat4Multiply(a, b) {
	const out = new Float32Array(16);
	for (let i = 0; i < 4; i++) {
		for (let j = 0; j < 4; j++) {
			out[i*4+j] = 
				a[i*4+0]*b[0*4+j] +
				a[i*4+1]*b[1*4+j] +
				a[i*4+2]*b[2*4+j] +
				a[i*4+3]*b[3*4+j];
		}
	}
	return out;
}

function mat4LookAt(eye, target, up) {
	const zx = eye[0] - target[0];
	const zy = eye[1] - target[1];
	const zz = eye[2] - target[2];
	let zLen = Math.sqrt(zx*zx + zy*zy + zz*zz);
	if (zLen === 0) zLen = 1;
	const zAxisX = zx / zLen;
	const zAxisY = zy / zLen;
	const zAxisZ = zz / zLen;

	let xx = up[1]*zAxisZ - up[2]*zAxisY;
	let xy = up[2]*zAxisX - up[0]*zAxisZ;
	let xz = up[0]*zAxisY - up[1]*zAxisX;
	let xLen = Math.sqrt(xx*xx + xy*xy + xz*xz);
	if (xLen === 0) xLen = 1;
	xx /= xLen; xy /= xLen; xz /= xLen;

	const yx = zAxisY*xz - zAxisZ*xy;
	const yy = zAxisZ*xx - zAxisX*xz;
	const yz = zAxisX*xy - zAxisY*xx;

	return new Float32Array([
		xx, yx, zAxisX, 0,
		xy, yy, zAxisY, 0,
		xz, yz, zAxisZ, 0,
		-(xx*eye[0] + xy*eye[1] + xz*eye[2]),
		-(yx*eye[0] + yy*eye[1] + yz*eye[2]),
		-(zAxisX*eye[0] + zAxisY*eye[1] + zAxisZ*eye[2]),
		1
	]);
}

const camera = {
	x: 0,
	y: 5,
	z: 10,
	rotX: 0,
	rotY: 0,
	fov: 75 * Math.PI / 180,
	near: 0.1,
	far: 100,
	aspect: canvas.width / canvas.height
};

const keys = {
	w: false, s: false,
	a: false, d: false,
	q: false, e: false
};

window.addEventListener('keydown', (e) => {
	const k = e.key.toLowerCase();
	if (k in keys) keys[k] = true;
});

window.addEventListener('keyup', (e) => {
	const k = e.key.toLowerCase();
	if (k in keys) keys[k] = false;
});

let mouseDown = false;

canvas.addEventListener('mousedown', () => { mouseDown = true; });
canvas.addEventListener('mouseup', () => { mouseDown = false; });

canvas.addEventListener('mousemove', (e) => {
	if (!mouseDown) return;
	camera.rotY -= e.movementX * 0.005;
	camera.rotX -= e.movementY * 0.005;
	camera.rotX = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotX));
});

function updateCamera(dt) {
	const speed = 5 * dt;
	
	// Direções baseadas na rotação Y
	const forward = { x: Math.sin(camera.rotY), z: -Math.cos(camera.rotY) };
	const right = { x: Math.cos(camera.rotY), z: Math.sin(camera.rotY) };
	
	// W/S: frente/trás 
	if (keys.w) { camera.x += forward.x * speed; camera.z += forward.z * speed; }
	if (keys.s) { camera.x -= forward.x * speed; camera.z -= forward.z * speed; }
	
	// A/D: esquerda/direita 
	if (keys.a) { camera.x -= right.x * speed; camera.z -= right.z * speed; }
	if (keys.d) { camera.x += right.x * speed; camera.z += right.z * speed; }
	
	// Q/E: cima/baixo
	if (keys.q) camera.y += speed;
	if (keys.e) camera.y -= speed;
}

function drawObject(buffer, indexBuffer, numIndices, modelMatrix) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 24, 0);
	gl.enableVertexAttribArray(aPosition);
	gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 24, 12);
	gl.enableVertexAttribArray(aColor);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.uniformMatrix4fv(uModel, false, modelMatrix);
	gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_SHORT, 0);
}

function drawLines(buffer, numVertices, modelMatrix) {
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 24, 0);
	gl.enableVertexAttribArray(aPosition);
	gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 24, 12);
	gl.enableVertexAttribArray(aColor);
	
	gl.uniformMatrix4fv(uModel, false, modelMatrix);
	gl.drawArrays(gl.LINES, 0, numVertices);
}

let cubeRotation = 0;
let lastTime = 0;

function render(now) {
	const dt = (now - lastTime) / 1000;
	lastTime = now;
	
	updateCamera(dt);
	
	// Limpa tela
	gl.clearColor(0.12, 0.12, 0.12, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	
	// Matrizes
	const projection = mat4Perspective(camera.fov, camera.aspect, camera.near, camera.far);
	
	const target = [
		camera.x + Math.sin(camera.rotY),
		camera.y + Math.sin(camera.rotX),
		camera.z - Math.cos(camera.rotY)
	];
	const view = mat4LookAt([camera.x, camera.y, camera.z], target, [0,1,0]);
	
	gl.uniformMatrix4fv(uProjection, false, projection);
	gl.uniformMatrix4fv(uView, false, view);
	
	// Desenha plano (chão)
	drawObject(planeBuffer, planeIndexBuffer, 6, mat4Identity());
	
	// Desenha cubo (gira)
	cubeRotation += 0.5 * dt;
	const cubeModel = mat4Multiply(
		mat4Translate(0, 1, 0),
		mat4RotateY(cubeRotation)
	);
	drawObject(cubeBuffer, cubeIndexBuffer, 36, cubeModel);
	
	// Desenha eixos
	drawLines(axesBuffer, 6, mat4Identity());
	
	requestAnimationFrame(render);
}

requestAnimationFrame(render);

document.getElementById('fov').addEventListener('input', (e) => {
	camera.fov = parseFloat(e.target.value) * Math.PI / 180;
	document.getElementById('fovVal').textContent = e.target.value + '°';
});

document.getElementById('near').addEventListener('input', (e) => {
	camera.near = parseFloat(e.target.value);
	document.getElementById('nearVal').textContent = e.target.value;
});

document.getElementById('far').addEventListener('input', (e) => {
	camera.far = parseFloat(e.target.value);
	document.getElementById('farVal').textContent = e.target.value;
});

window.addEventListener('resize', () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	camera.aspect = canvas.width / canvas.height;
	gl.viewport(0, 0, canvas.width, canvas.height);
});
