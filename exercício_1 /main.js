const canvas = document.getElementById('canvas'); // "pega" o canvas no arquivo html
const gl = canvas.getContext('webgl'); // pede contexto ao webgl 

// Armazena dimensões do canvas
const W = canvas.width;
const H = canvas.height; 

// Array para pixels [linha][coluna] 
const pixels = [] 

// Loop externo para criar linhas y 
for (let y = 0; y < H; y++) 
{
  // Loop interno: Cria todas as colunas da linha x 
  pixels[y] = [] // Cria uma arr pra essa linha
  for (let x = 0; x < W; x++)
  {
  pixels[y][x] = [0,0,0,255] 
  }
} 

// Modo de desenho atual  
let currentMode = 'line'; 

// Modo de entrada
let inputeMode = 'draw'; 

// Cor atual
let currentColor = [0, 0, 255, 255]

let currentThickness = 1; 

// array que guarda pontos que o usuário clicou, para linha 2 pontos e triângulo 3  

let clickPoints = []

// Array com 10 cores diferentes que o usuário pode escolher
// Cada cor é um array [R, G, B, A] onde valores vão de 0 a 255
const colorPalette = [
  [255, 0, 0, 255],     // 0 - vermelho puro
  [0, 255, 0, 255],     // 1 - verde puro
  [0, 0, 255, 255],     // 2 - azul puro
  [255, 255, 0, 255],   // 3 - amarelo (vermelho + verde)
  [255, 0, 255, 255],   // 4 - magenta (vermelho + azul)
  [0, 255, 255, 255],   // 5 - ciano (verde + azul)
  [255, 128, 0, 255],   // 6 - laranja (vermelho + meio verde)
  [128, 0, 255, 255],   // 7 - roxo (meio vermelho + azul)
  [255, 255, 255, 255], // 8 - branco (todos os canais máximos)
  [128, 128, 128, 255]  // 9 - cinza (todos os canais meio-valor)
];

// Função para limpar a tela

function clearBuffer() 
{ 
// percorre cada linha da tela 
  for (let y = 0; y < H; y++)
  {   
    // Percorre cada coluna da linha atual
    for (let x=0; x < W; x++) 
    { 
      pixels[y][x] = [0, 0, 0, 255] 
    }
  }
} 

// Função para desenhar um pixel específico 

function setPixel(x, y, color)
{
  // Verifica se o pixel está dentro do limite da tela 
  // Evita erro se tentar desenhar fora da área 
  if (x < 0 || x >= W || y < 0 || y >= H) return; 
  pixels[y][x] = color.slice()

}

// Função de conversão de pixel para webGL 
function pixelsToUint8Array() 
{
  // Cria buffer 
  const buffer = new Uint8Array(W * H * 4);
  let index = 0;
  // Percorre arrays
  for (let y = 0; y < H; y++) 
    {
    for (let x = 0; x < W; x++) 
      {
      // Loop para os 4 canais RGBA
      for (let i = 0; i < 4; i++) 
      {
        buffer[index++] = pixels[y][x][i];
      }
    }
  }
  return buffer;
}

// Implementação do algoritmo de Bresenham para desenhar linhas pixel a pixel
// Parâmetros: ponto inicial (x0,y0), ponto final (x1,y1), cor, espessura
function drawLineBresenham(x0, y0, x1, y1, color, thickness = 1) 
{
  
  // Calcula diferenças absolutas entre pontos
  const dx = Math.abs(x1 - x0); // distância horizontal
  const dy = Math.abs(y1 - y0); // distância vertical
  
  // Determina direção do movimento (1 = positiva, -1 = negativa)
  const sx = x0 < x1 ? 1 : -1;  // direção X
  const sy = y0 < y1 ? 1 : -1;  // direção Y
  
  // Erro inicial do algoritmo de Bresenham
  let err = dx - dy;
  
  // Loop principal - desenha pixel por pixel até chegar no fim
  while (true) 
    {
    // Desenha pixel principal na posição atual
    setPixel(x0, y0, color);
    
    // === IMPLEMENTAÇÃO DA ESPESSURA ===
    // Desenha pixels adicionais ao redor do pixel principal
    for (let t = 1; t < thickness; t++) {
      setPixel(x0 + t, y0, color);     // direita
      setPixel(x0 - t, y0, color);     // esquerda
      setPixel(x0, y0 + t, color);     // abaixo
      setPixel(x0, y0 - t, color);     // acima
      
      // Para espessura maior que 2, adiciona pixels nas diagonais
      if (t > 1) {
        setPixel(x0 + t, y0 + t, color); // diagonal inferior direita
        setPixel(x0 + t, y0 - t, color); // diagonal superior direita
        setPixel(x0 - t, y0 + t, color); // diagonal inferior esquerda
        setPixel(x0 - t, y0 - t, color); // diagonal superior esquerda
      }
    }
    
    // Verifica se chegou no ponto final
    if (x0 === x1 && y0 === y1) break;
    
    // === LÓGICA DO ALGORITMO DE BRESENHAM ===
    const e2 = 2 * err; // dobro do erro para comparações
    
    // Se erro indica que devemos mover horizontalmente
    if (e2 > -dy) {
      err -= dy;  // ajusta erro
      x0 += sx;   // move na direção X
    }
    
    // Se erro indica que devemos mover verticalmente
    if (e2 < dx) {
      err += dx;  // ajusta erro
      y0 += sy;   // move na direção Y
    }
  }
}

// Um triângulo é formado por 3 linhas conectando 3 pontos
function drawTriangle(p1, p2, p3, color, thickness) 
{
  // Desenha linha do ponto 1 para ponto 2
  drawLineBresenham(p1[0], p1[1], p2[0], p2[1], color, thickness);
  
  // Desenha linha do ponto 2 para ponto 3
  drawLineBresenham(p2[0], p2[1], p3[0], p3[1], color, thickness);
  
  // Desenha linha do ponto 3 de volta para ponto 1 (fecha o triângulo)
  drawLineBresenham(p3[0], p3[1], p1[0], p1[1], color, thickness);
}

function redraw() 
{
  // Primeiro, limpa toda a tela
  clearBuffer();
  
  // Verifica quantos pontos o usuário já clicou e desenha adequadamente
  if (clickPoints.length === 0) 
    {
    // CASO INICIAL: nenhum clique ainda
    const centerX = Math.floor(W/2); // centro horizontal (400)
    const centerY = Math.floor(H/2); // centro vertical (300)
    setPixel(centerX, centerY, currentColor);
    
  } else if (currentMode === 'line' && clickPoints.length >= 2) 
    {
    // MODO LINHA: desenha linha entre os dois últimos pontos clicados
    const p1 = clickPoints[clickPoints.length-2]; // penúltimo ponto
    const p2 = clickPoints[clickPoints.length-1]; // último ponto
    drawLineBresenham(p1[0], p1[1], p2[0], p2[1], currentColor, currentThickness);
    
  } else if (currentMode === 'triangle' && clickPoints.length >= 3) 
    {
    // MODO TRIÂNGULO: desenha triângulo com os três últimos pontos
    const p1 = clickPoints[clickPoints.length-3]; // antepenúltimo
    const p2 = clickPoints[clickPoints.length-2]; // penúltimo
    const p3 = clickPoints[clickPoints.length-1]; // último
    drawTriangle(p1, p2, p3, currentColor, currentThickness);
  }
  
  // Após desenhar no nosso buffer, atualiza a tela via WebGL
  updateCanvas();
}

// Shader de vértices - define posições dos vértices na tela
const vertexShaderSource = 
`
  attribute vec2 a_position;  // posição do vértice
  varying vec2 v_texCoord;    // coordenada de textura (passa para fragment shader)
  
  void main() {
    // Define posição final do vértice (WebGL usa coordenadas -1 a 1)
    gl_Position = vec4(a_position, 0.0, 1.0);
    
    // Converte coordenadas de -1..1 para 0..1 (para textura)
    v_texCoord = (a_position + 1.0) * 0.5;
  }
`;

// Shader de fragmentos - define cor de cada pixel
const fragmentShaderSource = 
`
  precision mediump float;      // precisão dos números decimais
  uniform sampler2D u_texture;  // nossa textura com os pixels
  varying vec2 v_texCoord;      // coordenada recebida do vertex shader
  
  void main() {
    // Busca cor do pixel na textura e inverte Y 
    gl_FragColor = texture2D(u_texture, vec2(v_texCoord.x, 1.0 - v_texCoord.y));
  }
`;

// Compilar shader
function compileShader(type, source) 
{
  // Cria shader do tipo especificado (vertex ou fragment)
  const shader = gl.createShader(type);
  
  // Carrega código fonte no shader
  gl.shaderSource(shader, source);
  
  // Compila o shader
  gl.compileShader(shader);
  
  return shader; // retorna shader compilado
}

// Compila ambos os shaders
const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

// Cria programa WebGL (combina vertex + fragment shader)
const program = gl.createProgram();
gl.attachShader(program, vertexShader);   // anexa vertex shader
gl.attachShader(program, fragmentShader); // anexa fragment shader
gl.linkProgram(program); // linka os shaders

// Ativa o programa para uso
gl.useProgram(program);

// Cria buffer para armazenar posições dos vértices
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Define geometria: 2 triângulos formando um retângulo que cobre toda a tela
// Coordenadas WebGL vão de -1 a +1 em ambos os eixos
const positions = new Float32Array([
  -1, -1,  // vértice 1: canto inferior esquerdo
   1, -1,  // vértice 2: canto inferior direito
  -1,  1,  // vértice 3: canto superior esquerdo
   1, -1,  // vértice 4: canto inferior direito (repetido)
   1,  1,  // vértice 5: canto superior direito
  -1,  1   // vértice 6: canto superior esquerdo (repetido)
]);
// Isso forma 2 triângulos que cobrem toda a tela

gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

// Liga atributo de posição ao buffer
const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);


const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);

// Configura parâmetros da textura
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // não repetir na horizontal
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // não repetir na vertical
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);   // filtro: pixel exato 
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);   // filtro: pixel exato 


function updateCanvas() {
  // Converte nosso Array 2D para formato WebGL
  const buffer = pixelsToUint8Array();
  
  // Carrega pixels na textura WebGL
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
  
  // Desenha os 6 vértices (2 triângulos) na tela
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase(); // converte para minúscula
  
  if (key === 'r') {
    // TECLA R: ativa modo linha
    currentMode = 'line';
    inputMode = 'draw';     // volta para modo desenho
    clickPoints = [];       // limpa pontos anteriores
    redraw();              // redesenha tela
    
  } else if (key === 't') {
    // TECLA T: ativa modo triângulo
    currentMode = 'triangle';
    inputMode = 'draw';     // volta para modo desenho
    clickPoints = [];       // limpa pontos anteriores
    redraw();              // redesenha tela
    
  } else if (key === 'k') {
    // TECLA K: liga/desliga modo alteração de cor
    inputMode = inputMode === 'color' ? 'draw' : 'color';
    
  } else if (key === 'e') {
    // TECLA E: liga/desliga modo alteração de espessura
    inputMode = inputMode === 'thickness' ? 'draw' : 'thickness';
    
  } else if (key >= '0' && key <= '9') {
    // TECLAS 0-9: altera cor ou espessura dependendo do modo ativo
    const num = parseInt(key);
    
    if (inputMode === 'color') {
      // Modo cor ativo: muda cor atual
      currentColor = [...colorPalette[num]]; // copia cor da paleta
      redraw(); // redesenha com nova cor
      
    } else if (inputMode === 'thickness' && num > 0) {
      // Modo espessura ativo: muda espessura (só números 1-9)
      currentThickness = num;
      redraw(); // redesenha com nova espessura
    }
  }
});


canvas.addEventListener('click', (e) => {
  // Só processa cliques se estiver no modo desenho
  if (inputMode !== 'draw') return;
  
  // Calcula posição do clique relativa ao canvas
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(e.clientX - rect.left); // coordenada X do clique
  const y = Math.floor(e.clientY - rect.top);  // coordenada Y do clique
  
  // Adiciona ponto clicado à lista
  clickPoints.push([x, y]);
  
  if (currentMode === 'line') {
    // MODO LINHA: precisa de 2 cliques
    if (clickPoints.length >= 2) {
      // Se já tem 2 ou mais, mantém só os 2 mais recentes
      clickPoints = clickPoints.slice(-2);
    }
    redraw(); // redesenha após cada clique
    
  } else if (currentMode === 'triangle') {
    // MODO TRIÂNGULO: precisa de 3 cliques
    if (clickPoints.length >= 3) {
      // Se já tem 3 ou mais, mantém só os 3 mais recentes
      clickPoints = clickPoints.slice(-3);
    }
    redraw(); // redesenha após cada clique
  }
});

// Limpa buffer inicial e desenha estado inicial
clearBuffer();
redraw();