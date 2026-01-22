// MODELO CANVAS
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.getElementById("game").appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// VARIABLES GLOBALES
let keys = {};
let balas = [];
let gotas = [];
let enemigos = [];
let miniBoss = null;
let nuevoMiniBoss = null;
let direccion = 1;
let velocidad = 2;
let puntuacion = 0;
let tiempo = 0;
let temporizador;
let juegoIniciado = false;
let estadoOleada = "fila";

// IMAGENES
const imgJugador = new Image();
imgJugador.src = "Imagenes/Soldier1 (1).png";

const imgBalasJugador = new Image();
imgBalasJugador.src = "Imagenes/babyoild_preview_rev_1 (1).png";

const imgGota = new Image();
imgGota.src = "Imagenes/Proyectil.png";

const imgExplosion = new Image();
imgExplosion.src = "Imagenes/Explosion.png";

// SONIDOS
const sonidoExplosion = new Audio("Efectos/Roblox_Death_Sound_(Oof)_-_Sound_Effect_(HD)_128k.ogg");
sonidoExplosion.volume = 0.5;

const sonidoGolpe = new Audio("Efectos/GOLPEHITSOUNDEFFECTSEFECTOSDESONIDO.mp3");
sonidoGolpe.volume = 0.5;

// JUGADOR
const pDiddy = {
    x: canvas.width / 2 - 125,
    y: canvas.height - 180,
    width: 250,
    height: 180,
    puedeDisparar: true,
    hit: 0
};

// MUSICA DE FONDO
const musicaFondo = new Audio("Musica/B2K,_P._Diddy_-_Bump,_Bump,_Bump_(Official_Music_Video)_128k.ogg");
musicaFondo.loop = true;
musicaFondo.volume = 0.3;
let musicaIniciada = false;

function iniciarMusica() {
    if (!musicaIniciada) {
        musicaFondo.play().catch(e => console.log("Interactúa con la página para iniciar la música"));
        musicaIniciada = true;
    }
}

// TIPOS DE ENEMIGOS
const tiposEnemigos = [
    { tipo: 'basico', src: 'Imagenes/Justin Bierber_preview_rev_1 (1).png', ancho: 80, vida: 2 },
    { tipo: 'medio', src: 'Imagenes/Beyonce1 (1).png', ancho: 100, vida: 4 },
    { tipo: 'dificil', src: 'Imagenes/Mogshoot2 (1).png', ancho: 120, vida: 6 }
];

// TECLADO
document.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
    iniciarMusica();
    if (e.key === " " && pDiddy.puedeDisparar && juegoIniciado) {
        disparar();
        pDiddy.puedeDisparar = false;
    }
});
document.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
    if (e.key === " ") pDiddy.puedeDisparar = true;
});
document.addEventListener("click", iniciarMusica);

// EXPLOSIONES
let explosiones = [];

function crearExplosion(x, y, width, height) {
    explosiones.push({
        x, y, width, height,
        frame: 0, totalFrames: 5,
        frameWidth: imgExplosion.width / 5,
        frameHeight: imgExplosion.height,
        tiempo: 0
    });
    sonidoExplosion.currentTime = 0;
    sonidoExplosion.play();
}

function dibujarExplosiones() {
    for (let i = explosiones.length - 1; i >= 0; i--) {
        let e = explosiones[i];
        ctx.drawImage(imgExplosion, e.frame * e.frameWidth, 0, e.frameWidth, e.frameHeight, e.x, e.y, e.width, e.height);
        e.tiempo++;
        if (e.tiempo % 5 === 0) e.frame++;
        if (e.frame >= e.totalFrames) explosiones.splice(i, 1);
    }
}

// INSTRUCCIONES
function mostrarInstrucciones() {
    const instrucciones = document.getElementById('Instruccions');
    instrucciones.style.display = 'block';
    setTimeout(() => {
        instrucciones.style.opacity = '0';
        setTimeout(() => {
            instrucciones.style.display = 'none';
            iniciarJuego();
        }, 1000);
    }, 12000);
}

// INICIO DE JUEGO
function iniciarJuego() {
    juegoIniciado = true;
    iniciarMusica();
    iniciarContador();
    generarFilaNormal();
    requestAnimationFrame(gameLoop);
}

// CONTADOR
function iniciarContador() {
    const tiempoHTML = document.getElementById('temps');
    if (!tiempoHTML) return;
    tiempoHTML.textContent = '00:00';
    temporizador = setInterval(() => {
        tiempo++;
        const min = String(Math.floor(tiempo / 60)).padStart(2, '0');
        const sec = String(tiempo % 60).padStart(2, '0');
        tiempoHTML.textContent = `${min}:${sec}`;
        if (tiempo >= 60) finalizarJuego();
    }, 1000);
}

// FINALIZAR JUEGO
function finalizarJuego() {
    juegoIniciado = false;
    musicaFondo.pause();
    clearInterval(temporizador);
    if (puntuacion >= 800) window.location.href = "victoria.html";
    else window.location.href = "hasPerdido.html";
}

// GENERADOR DE ENEMIGOS Y BOSSES
function generarFilaNormal() {
    estadoOleada = "fila";
    enemigos = [];
    miniBoss = null;
    nuevoMiniBoss = null;

    const cantidad = 6;
    const separacionX = 150;
    const offsetX = canvas.width / 2 - (cantidad / 2 * separacionX) + separacionX / 2;

    for (let i = 0; i < cantidad; i++) {
        const tipo = tiposEnemigos[Math.floor(Math.random() * tiposEnemigos.length)];
        const img = new Image();
        img.src = tipo.src;

        enemigos.push({
            x: offsetX + i * separacionX,
            y: 50,
            width: tipo.ancho,
            height: tipo.ancho,
            vida: tipo.vida,
            maxVida: tipo.vida,
            img,
            hit: 0
        });
    }
}

function generarMiniBoss() {
    estadoOleada = "miniBoss";
    enemigos = [];
    nuevoMiniBoss = null;
    miniBoss = { x: canvas.width / 2 - 100, y: 50, width: 200, height: 200, vida: 20, maxVida: 20, img: new Image(), hit: 0 };
    miniBoss.img.src = "Imagenes/miniboss.png";
}

function generarNuevoMiniBoss() {
    estadoOleada = "nuevoMiniBoss";
    enemigos = [];
    miniBoss = null;
    nuevoMiniBoss = { x: canvas.width / 2 - 100, y: 50, width: 200, height: 200, vida: 25, maxVida: 25, img: new Image(), hit: 0, disparando: false, tiempoDisparo: 0 };
    nuevoMiniBoss.img.src = "Imagenes/gyatt-kai-cenat.png";
}

function generarMiniBossLeche() {
    estadoOleada = "miniBossLeche";
    enemigos = [];
    miniBoss = null;
    nuevoMiniBoss = { x: canvas.width / 2 - 100, y: 50, width: 200, height: 200, vida: 30, maxVida: 30, img: new Image(), hit: 0, tiempoDisparo: 0 };
    nuevoMiniBoss.img.src = "Imagenes/bossleche.jpg";
}

// DISPAROS
function disparar() {
    balas.push({ x: pDiddy.x + pDiddy.width / 2 - 7, y: pDiddy.y, width: 15, height: 25, dy: -6, img: imgBalasJugador });
}

function disparoEnemigos() {
    if (miniBoss) {
        if (Math.random() < 0.02) {
            for (let dx = -3; dx <= 3; dx += 1.5)
                gotas.push({ x: miniBoss.x + miniBoss.width / 2 - 7, y: miniBoss.y + miniBoss.height, width: 15, height: 25, dx, dy: 4, img: imgGota });
        }
    } else {
        enemigos.forEach(e => {
            if (Math.random() < 0.01)
                gotas.push({ x: e.x + e.width / 2 - 7, y: e.y + e.height, width: 15, height: 25, dx: 0, dy: 4, img: imgGota });
        });
    }
}

function disparoNuevoMiniBoss() {
    if (!nuevoMiniBoss) return;
    if (estadoOleada === "miniBossLeche" && nuevoMiniBoss.tiempoDisparo % 180 === 0) {
        gotas.push({ x: nuevoMiniBoss.x + nuevoMiniBoss.width / 2 - 20, y: nuevoMiniBoss.y + nuevoMiniBoss.height, width: 300, height: 300, dx: 0, dy: 4, img: imgGota });
    } else if (nuevoMiniBoss.disparando) {
        gotas.push({ x: nuevoMiniBoss.x + nuevoMiniBoss.width / 2 - 7, y: nuevoMiniBoss.y + nuevoMiniBoss.height, width: 15, height: 25, dx: 0, dy: 6, img: imgGota });
    }
}

// GAME LOOP
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!juegoIniciado) return;

    // MOVIMIENTO JUGADOR
    if (keys['a'] && pDiddy.x > 0) pDiddy.x -= 5;
    if (keys['d'] && pDiddy.x + pDiddy.width < canvas.width) pDiddy.x += 5;

    // DIBUJAR JUGADOR
    if (pDiddy.hit > 0) {
        ctx.save();
        ctx.filter = "brightness(6) contrast(0)";
        ctx.drawImage(imgJugador, pDiddy.x, pDiddy.y, pDiddy.width, pDiddy.height);
        ctx.restore();
        pDiddy.hit--;
    } else {
        ctx.drawImage(imgJugador, pDiddy.x, pDiddy.y, pDiddy.width, pDiddy.height);
    }

    // FUNCIONES AUXILIARES
    const dibujarEntidad = e => {
        ctx.save();
        if (e.hit > 0) { ctx.filter = "sepia(1) saturate(5) hue-rotate(-50deg)"; e.hit--; }
        ctx.drawImage(e.img, e.x, e.y, e.width, e.height);
        ctx.restore();
    };

    // ENEMIGOS / MINI BOSSES
    if (miniBoss) {
        miniBoss.x += direccion * velocidad;
        if (miniBoss.x <= 0 || miniBoss.x + miniBoss.width >= canvas.width) direccion *= -1;
        dibujarEntidad(miniBoss);
    } else if (nuevoMiniBoss) {
        nuevoMiniBoss.x += direccion * velocidad;
        if (nuevoMiniBoss.x <= 0 || nuevoMiniBoss.x + nuevoMiniBoss.width >= canvas.width) direccion *= -1;

        nuevoMiniBoss.tiempoDisparo++;
        if (estadoOleada === "nuevoMiniBoss") {
            nuevoMiniBoss.disparando = nuevoMiniBoss.tiempoDisparo % 240 < 120;
        }
        disparoNuevoMiniBoss();
        dibujarEntidad(nuevoMiniBoss);
    } else if (enemigos.length > 0) {
        let maxX = Math.max(...enemigos.map(e => e.x + e.width));
        let minX = Math.min(...enemigos.map(e => e.x));
        if (maxX >= canvas.width || minX <= 0) direccion *= -1;
        enemigos.forEach(e => { e.x += direccion * velocidad; dibujarEntidad(e); });
    }

    // DISPAROS
    disparoEnemigos();

    // BALAS JUGADOR
    for (let i = balas.length - 1; i >= 0; i--) {
        let b = balas[i];
        b.y += b.dy;
        ctx.drawImage(b.img, b.x, b.y, b.width, b.height);

        let golpeado = false;

        // Colisiones con miniBoss
        if (miniBoss && b.x < miniBoss.x + miniBoss.width && b.x + b.width > miniBoss.x && b.y < miniBoss.y + miniBoss.height && b.y + b.height > miniBoss.y) {
            miniBoss.vida--; miniBoss.hit = 10; sonidoGolpe.currentTime = 0; sonidoGolpe.play();
            balas.splice(i, 1); puntuacion += 10; actualizarPuntuacion(); golpeado = true;
            if (miniBoss.vida <= 0) { sonidoExplosion.currentTime = 0; sonidoExplosion.play(); crearExplosion(miniBoss.x, miniBoss.y, miniBoss.width, miniBoss.height); miniBoss = null; setTimeout(generarFilaNormal, 1000); }
        }

        // Colisiones con nuevoMiniBoss
        else if (nuevoMiniBoss && b.x < nuevoMiniBoss.x + nuevoMiniBoss.width && b.x + b.width > nuevoMiniBoss.x && b.y < nuevoMiniBoss.y + nuevoMiniBoss.height && b.y + b.height > nuevoMiniBoss.y) {
            nuevoMiniBoss.vida--; nuevoMiniBoss.hit = 10; sonidoGolpe.currentTime = 0; sonidoGolpe.play();
            balas.splice(i, 1); puntuacion += 10; actualizarPuntuacion(); golpeado = true;
            if (nuevoMiniBoss.vida <= 0) { sonidoExplosion.currentTime = 0; sonidoExplosion.play(); crearExplosion(nuevoMiniBoss.x, nuevoMiniBoss.y, nuevoMiniBoss.width, nuevoMiniBoss.height); nuevoMiniBoss = null; setTimeout(generarFilaNormal, 1000); }
        }

        // Colisiones con enemigos
        else {
            for (let j = enemigos.length - 1; j >= 0; j--) {
                let e = enemigos[j];
                if (b.x < e.x + e.width && b.x + b.width > e.x && b.y < e.y + e.height && b.y + b.height > e.y) {
                    e.vida--; e.hit = 10; sonidoGolpe.currentTime = 0; sonidoGolpe.play();
                    balas.splice(i, 1); puntuacion += 10; actualizarPuntuacion();
                    if (e.vida <= 0) { crearExplosion(e.x, e.y, e.width, e.height); enemigos.splice(j, 1); }
                    golpeado = true; break;
                }
            }
        }

        if (!golpeado && b.y < 0) balas.splice(i, 1);
    }

    // GOTAS ENEMIGOS
    for (let i = gotas.length - 1; i >= 0; i--) {
        let g = gotas[i];
        g.y += g.dy; g.x += g.dx || 0;
        ctx.drawImage(g.img, g.x, g.y, g.width, g.height);

        // Colisión con jugador
        const centroX = g.x + g.width / 2;
        const centroY = g.y + g.height / 2;
        const hb = { x: pDiddy.x + pDiddy.width * 0.15, y: pDiddy.y + pDiddy.height * 0.1, width: pDiddy.width * 0.7, height: pDiddy.height * 0.8 };
        if (centroX > hb.x && centroX < hb.x + hb.width && centroY > hb.y && centroY < hb.y + hb.height) {
            gotas.splice(i, 1);
            pDiddy.hit = 15;
            puntuacion = Math.max(0, puntuacion - 5);
            actualizarPuntuacion();
            sacudirPuntuacion();
        }

        if (g.y > canvas.height) gotas.splice(i, 1);
    }

    // CAMBIO DE OLEADA
    if (estadoOleada === "fila" && enemigos.length === 0) {
        estadoOleada = "transicion";
        setTimeout(() => {
            const rnd = Math.random();
            if (rnd < 0.33) generarMiniBoss();
            else if (rnd < 0.66) generarNuevoMiniBoss();
            else generarMiniBossLeche();
        }, 1000);
    }

    dibujarExplosiones();
    requestAnimationFrame(gameLoop);
}

// PUNTUACION
function actualizarPuntuacion() {
    const p = document.getElementById('puntuació');
    if (p) p.textContent = `Pts: ${puntuacion}`;
}

function sacudirPuntuacion() {
    const p = document.getElementById('puntuació');
    if (!p) return;
    p.classList.remove('shake');
    void p.offsetWidth;
    p.classList.add('shake');
}

// INICIO
window.onload = mostrarInstrucciones;



