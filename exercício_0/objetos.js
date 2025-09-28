const canvas  = document.getElementById('meuCanvas');
const ctx     = canvas.getContext('2d');
const WIDTH   = canvas.width;
const HEIGHT  = canvas.height;

function limpar()
{
	ctx.setTransform(1, 0, 0, 1, 0, 0);	
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, WIDTH, HEIGHT);		
}

function drawRobot(x, y, s = 1)
{
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(s, s);

	ctx.fillStyle = '#666';
	ctx.fillRect(-40, -120, 80, 80);			// cabeça

	ctx.fillStyle = '#fff';
	ctx.fillRect(-25, -100, 15, 15);			// olho E
	ctx.fillRect(10,  -100, 15, 15);			// olho D

	ctx.fillStyle = '#888';
	ctx.fillRect(-50, -40, 100, 120);			// corpo

	ctx.fillRect(-80, -30, 30, 80);				// braço E
	ctx.fillRect(50,  -30, 30, 80);				// braço D

	ctx.fillRect(-35, 80, 25, 70);				// perna E
	ctx.fillRect(10,  80, 25, 70);				// perna D

	ctx.restore();
}

function drawFlower(x, y, s = 1)
{
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(s, s);

	ctx.fillStyle = 'pink';
	for (let i = 0; i < 8; i++)
	{
		ctx.rotate(Math.PI / 4);
		ctx.beginPath();
		ctx.ellipse(0, 40, 18, 30, 0, 0, Math.PI * 2);
		ctx.fill();
	}

	ctx.setTransform(1, 0, 0, 1, x, y);		// volta origem local
	ctx.fillStyle = 'yellow';
	ctx.beginPath();
	ctx.arc(0, 0, 20, 0, Math.PI * 2);		// miolo
	ctx.fill();

	ctx.fillStyle = 'green';
	ctx.fillRect(-5, 20, 10, 180);			// caule
	ctx.restore();
}

function drawCar(x, y, s = 1)
{
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(s, s);

	ctx.fillStyle = '#3498db';
	ctx.fillRect(-90, -20, 180, 40);			// base
	ctx.fillRect(-50, -50, 100, 30);			// cabine

	ctx.fillStyle = '#222';
	ctx.beginPath(); ctx.arc(-45, 25, 22, 0, Math.PI * 2); ctx.fill();
	ctx.beginPath(); ctx.arc( 45, 25, 22, 0, Math.PI * 2); ctx.fill();

	ctx.restore();
}

function drawWindmill(x, y, s = 1)
{
	ctx.save();
	ctx.translate(x, y);
	ctx.scale(s, s);

	ctx.fillStyle = '#aaa';
	ctx.fillRect(-10, 0, 20, 120);				// torre

	ctx.fillStyle = '#555';
	ctx.beginPath();
	ctx.arc(0, 0, 8, 0, Math.PI * 2);			// eixo
	ctx.fill();

	ctx.fillStyle = '#ddd';
	for (let i = 0; i < 4; i++)
	{
		ctx.rotate(Math.PI / 2);
		ctx.fillRect(8, -4, 70, 8);				// pá
	}

	ctx.restore();
}

function desenhar(tipo)
{
	limpar();
	const x = WIDTH / 2;
	const y = HEIGHT / 2;

	switch (tipo)
	{
		case 'robot':    drawRobot   (x, y, 1.2);  break;
		case 'flower':   drawFlower  (x, y - 40, 1.4); break;
		case 'car':      drawCar     (x, y + 10, 1.3); break;
		case 'windmill': drawWindmill(x, y - 20, 1.4); break;
	}
}

document.getElementById('menu').addEventListener('click', (e) =>
{
	const obj = e.target.dataset.obj;
	if (obj) desenhar(obj);
});

limpar();
s