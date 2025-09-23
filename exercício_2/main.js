// Configuração inicial e pegar medidas do canvas
const canvas = document.getElementById('meuCanvas');
const gl = canvas.getContext('webgl'); 
const W = canvas.width, H = canvas.height; 

// Matriz 2-D de pixels
const tela = Array.from({ length: H }, () =>
  Array.from({ length: W }, () => [0, 0, 0, 255]) );

//  Limpar a tela                                                   
function limparTela() 
{
  for (let y = 0; y < H; y++) 
    {
    for (let x = 0; x < W; x++) 
        {
      tela[y][x] = [0, 0, 0, 255]; // pinta tudo de preto
    }
  }
}

// Pintar UM pixel                                                 
function pintarPixel(x, y, cor) 
{
  if (x < 0 || x >= W || y < 0 || y >= H) return; // ignora fora da tela
  tela[y][x] = cor.slice();                       // copia a cor
}

// Desenhar 8 pontos simétricos do círculo                         
function desenharOct(cx,cy,x,y,c)
{
  pintarPixel(cx+x,cy+y,c); pintarPixel(cx-x,cy+y,c);
  pintarPixel(cx+x,cy-y,c); pintarPixel(cx-x,cy-y,c);
  pintarPixel(cx+y,cy+x,c); pintarPixel(cx-y,cy+x,c);
  pintarPixel(cx+y,cy-x,c); pintarPixel(cx-y,cy-x,c);
}
function circulo(cx,cy,r,c=[255,255,0,255])
{
  let x=0, y=r, d=3-2*r;
  while(y>=x){
    desenharOct(cx,cy,x,y,c); x++;
    if(d>0){ y--; d+=4*(x-y)+10; } else d+=4*x+6;
  }
}

// Converter matriz p webgl
function bufferPixels(){
  const buf=new Uint8Array(W*H*4); let k=0;
  for(const row of tela)for(const [r,g,b,a] of row)
    {buf[k++]=r;buf[k++]=g;buf[k++]=b;buf[k++]=a;}
  return buf;
}


// Funções p webgl
const quad=new Float32Array([-1,-1,1,-1,-1,1,1,-1,1,1,-1,1]),
      vs=`attribute vec2 p;varying vec2 uv;void main(){gl_Position=vec4(p,0,1);uv=(p+1.)*.5;}`,
      fs=`precision mediump float;
          uniform sampler2D uTex;          // ★ nome padronizado
          varying vec2 uv;
          void main(){gl_FragColor=texture2D(uTex,vec2(uv.x,1.-uv.y));}`;

function sh(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o;}
const prog=gl.createProgram();
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));
gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));
gl.linkProgram(prog); gl.useProgram(prog);

const buf=gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,buf);
gl.bufferData(gl.ARRAY_BUFFER,quad,gl.STATIC_DRAW);
const loc=gl.getAttribLocation(prog,'p');
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);

const tex=gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D,tex);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);

gl.uniform1i(gl.getUniformLocation(prog,'uTex'),0);

gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,W,H,0,gl.RGBA,gl.UNSIGNED_BYTE,bufferPixels());

function atualizar()
{
  gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,W,H,gl.RGBA,gl.UNSIGNED_BYTE,bufferPixels());
  gl.drawArrays(gl.TRIANGLES,0,6);
}

// Clique 
canvas.addEventListener('click',e=>{
  const r=canvas.getBoundingClientRect(),
        x=Math.floor(e.clientX-r.left),
        y=Math.floor(e.clientY-r.top);
  limparTela();
  circulo(x,y,50);           // raio 50
  atualizar();
});


// Rendereização
limparTela();
atualizar();
