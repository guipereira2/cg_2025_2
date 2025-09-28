const canvas = document.getElementById('meuCanvas');
const ctx = canvas.getContext('2d');
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

function limpar()
{
	ctx.setTransform(1,0,0,1,0,0);   
	ctx.fillStyle = '#000';
	ctx.fillRect(0,0,WIDTH,HEIGHT);
}

let current = null;        // 'robot' | 'flower' | 'car' | 'windmill'
let t = 0;           // tempo acumulado (segundos)

const robot = 
{
	x : WIDTH / 2,   // posição X
	v : 90,          // velocidade px/s
	dir: 1,           // direção (1→, −1←)
	arm: 0,           // ângulo braços (rad)
	leg: 0            // ângulo pernas (rad)
};

function updateRobot(dt)
{
	robot.x += robot.v * robot.dir * dt;
	if (robot.x > WIDTH - 80 || robot.x < 80)
	{
		robot.dir *= -1;
	}

	const t = performance.now() / 300;       
	robot.arm =  30 * Math.PI/180 * Math.sin(t);  // 30°
	robot.leg =  25 * Math.PI/180 * Math.sin(t);  // 25°
}

function drawRobot(_, y, s = 1)
{
	const x = robot.x;
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(s * robot.dir, s); // espelha quando vira

	// cabeça 
	ctx.fillStyle = '#666';
	ctx.fillRect(-40, -120, 80, 80);

	// olhos 
	ctx.fillStyle = '#fff';
	ctx.fillRect(-25, -100, 15, 15);
	ctx.fillRect( 10, -100, 15, 15);

	// tronco 
	ctx.fillStyle = '#888';
	ctx.fillRect(-50, -40, 100, 120);

	// braços 
	ctx.save();
		ctx.translate(-65, 10);                   // ombro E
		ctx.rotate( robot.arm);
		ctx.fillRect(-15, 0, 30, 80);
	ctx.restore();

	ctx.save();
		ctx.translate( 65, 10);                   // ombro D
		ctx.rotate(-robot.arm);
		ctx.fillRect(-15, 0, 30, 80);
	ctx.restore();

	// pernas
	ctx.save();
		ctx.translate(-22, 80);                   // quadril E
		ctx.rotate(-robot.leg);
		ctx.fillRect(-12, 0, 24, 70);
	ctx.restore();

	ctx.save();
		ctx.translate( 22, 80);                   // quadril D
		ctx.rotate( robot.leg);
		ctx.fillRect(-12, 0, 24, 70);
	ctx.restore();

	ctx.restore();
}

// flor
function updateFlower(dt)
{ 
	flower.angle += 0.3*dt; 
}

function drawFlower(x, y, s=1)
{
	ctx.save();
	ctx.translate(x,y);
	ctx.scale(s,s);
	ctx.rotate(flower.angle);
	ctx.fillStyle='pink';
	for(let i=0;i<8;i++)
	{
		ctx.rotate(Math.PI/4);
		ctx.beginPath();
		ctx.ellipse(0,40,18,30,0,0,Math.PI*2);
		ctx.fill();
	}
	ctx.setTransform(1, 0, 0, 1, x, y);
	ctx.fillStyle='yellow';
	ctx.beginPath();
	ctx.arc(0,0,20,0,Math.PI*2);
	ctx.fill();
	ctx.fillStyle='green';
	ctx.fillRect(-5,20,10,100);
	ctx.restore();
}
const flower = { angle:0 };

function updateCar(dt)
{
	car.x += car.v*dt;
	if(car.x > WIDTH-100 || car.x < 100) car.v *= -1;   
	car.wheel += 10*dt;
}

function drawCar(x, y, s=1)
{
	ctx.save();
	ctx.translate(car.x, y);   // usa x dinâmico
	ctx.scale(s,s);

	ctx.fillStyle='#3498db';
	ctx.fillRect(-90,-20,180,40);
	ctx.fillRect(-50,-50,100,30);

	ctx.fillStyle='#222';
	for(const dx of [-45,45])
	{
		ctx.save();
		ctx.translate(dx,25);
		ctx.rotate(car.wheel);
		ctx.beginPath();
		ctx.arc(0,0,22,0,Math.PI*2);
		ctx.fill();
		ctx.restore();
	}
	ctx.restore();
}
const car = 
{ 
	x: WIDTH / 2,
	v:120, 
	wheel: 0 
};

function updateWind(dt)
{ 
	wind.angle += 2*dt; 
}

function drawWindmill(x,y,s=1)
{
	ctx.save();
	ctx.translate(x,y);
	ctx.scale(s,s);

	ctx.fillStyle='#aaa';
	ctx.fillRect(-10,0,20,120);
	ctx.fillStyle='#555';
	ctx.beginPath(); 
	ctx.arc(0,0,8,0,Math.PI*2);
	ctx.fill();
	ctx.fillStyle='#ddd';
	ctx.rotate(wind.angle);
	for(let i=0;i<4;i++)
	{
		ctx.rotate(Math.PI/2);
		ctx.fillRect(8,-4,70,8);
	}
	ctx.restore();
}

const wind = 
{ 
	angle:0 
};

function update(dt)
{
	if(current==='robot')
	{
		updateRobot(dt)
	}
	if(current==='flower')
	{
		updateFlower(dt)
	}
	if(current==='car')
	{
		updateCar(dt)
	} 
	if(current==='windmill')
	{
		updateWind(dt)
	}
}

function draw()
{
	const cx = WIDTH/2, 
	cy = HEIGHT/2;
	if(current==='robot')
		{
		drawRobot(cx,cy,1.2)
		}
	if(current==='flower')
		{
		drawFlower(cx,cy-40,1.4)
		} 
	if(current==='car')
		{
      	drawCar(cx,cy+10,1.3)
		}
	if(current==='windmill')
		{
		drawWindmill(cx,cy-20,1.4)
		}
}

let last = 0;
function loop(now)
{
	const dt = (now-last)/1000;  
	last = now;
	update(dt);
	limpar();
	draw();
	requestAnimationFrame(loop); 
}
requestAnimationFrame(loop);

document.getElementById('menu').addEventListener('click',e=>{
	const obj = e.target.dataset.obj;
	if(obj) current = obj;
});

limpar();
