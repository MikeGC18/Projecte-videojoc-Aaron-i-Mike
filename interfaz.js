/************************************************
 * VARIABLES GLOBALES
 ************************************************/
let pDiddy;
let diddyPosition = 50;
const speed = 0.15;
let keys = {};

let balas = [];
let gotas = [];

let tiempo = 0;
let temporizador;

let puntuacion = 0;

/************************************************
 * TIPOS DE ENEMIGOS
 ************************************************/
const tiposEnemigos = [
    { tipo: 'basico', src: 'Imagenes/Justin Bierber_preview_rev_1 (1).png', ancho: 40, vida: 1 },
    { tipo: 'medio', src: 'Imagenes/Beyonce1 (1).png', ancho: 50, vida: 2 },
    { tipo: 'dificil', src: 'Imagenes/Mogshoot2 (1).png', ancho: 60, vida: 5 }
];

/************************************************
 * CARGA INICIAL
 ************************************************/
window.onload = () => {
    pDiddy = document.getElementById('PDiddy');
    mostrarInstrucciones();
    configurarTeclado();
    requestAnimationFrame(gameLoop);
};

/************************************************
 * MENÚ DE INSTRUCCIONES
 ************************************************/
function mostrarInstrucciones() {
    const instrucciones = document.getElementById('Instruccions');
    instrucciones.style.display = 'block';
    instrucciones.style.opacity = '1';

    setTimeout(() => {
        instrucciones.style.opacity = '0';
        setTimeout(() => {
            instrucciones.style.display = 'none';
            iniciarJuego();
        }, 1000);
    }, 15000);
}

/************************************************
 * INICIO DEL JUEGO
 ************************************************/
function iniciarJuego() {
    mostrarPDiddy();
    iniciarContador();
    generarFila();  // Genera la primera fila
    actualizarPuntuacion();
}

/************************************************
 * P. DIDDY
 ************************************************/
function mostrarPDiddy() {
    pDiddy.style.display = 'block';
    pDiddy.style.left = '50%';
    pDiddy.style.bottom = '4%';
    pDiddy.style.transform = 'translateX(-50%)';
}

/************************************************
 * CONTADOR
 ************************************************/
function iniciarContador() {
    const tiempoHTML = document.getElementById('temps');
    if (!tiempoHTML) return;

    tiempoHTML.textContent = '00:00';

    temporizador = setInterval(() => {
        tiempo++;
        const min = String(Math.floor(tiempo / 60)).padStart(2, '0');
        const sec = String(tiempo % 60).padStart(2, '0');
        tiempoHTML.textContent = `${min}:${sec}`;
    }, 1000);
}

/************************************************
 * TECLADO
 ************************************************/
function configurarTeclado() {
    document.addEventListener('keydown', e => {
        keys[e.key.toLowerCase()] = true;
        if (e.key === ' ') dispararBabyOil();
    });

    document.addEventListener('keyup', e => {
        keys[e.key.toLowerCase()] = false;
    });
}

/************************************************
 * GAME LOOP
 ************************************************/
function gameLoop() {
    moverPDiddy();
    actualizarBalas();
    comprobarColisionesBalas();
    actualizarGotas();
    requestAnimationFrame(gameLoop);
}

/************************************************
 * MOVIMIENTO JUGADOR
 ************************************************/
function moverPDiddy() {
    if (keys['a'] && diddyPosition > 5) {
        diddyPosition -= speed;
        pDiddy.style.left = diddyPosition + '%';
    }
    if (keys['d'] && diddyPosition < 95) {
        diddyPosition += speed;
        pDiddy.style.left = diddyPosition + '%';
    }
}

/************************************************
 * DISPARO JUGADOR
 ************************************************/
function dispararBabyOil() {
    const bala = document.createElement('img');
    bala.src = 'Imagenes/babyoild_preview_rev_1 (1).png';
    bala.style.position = 'fixed';
    bala.style.width = '10px';

    const rect = pDiddy.getBoundingClientRect();
    bala.style.left = rect.left + rect.width / 2 + 'px';
    bala.style.top = rect.top + 'px';

    document.body.appendChild(bala);
    balas.push({ element: bala, y: rect.top });
}

function actualizarBalas() {
    for (let i = balas.length - 1; i >= 0; i--) {
        balas[i].y -= 4;
        balas[i].element.style.top = balas[i].y + 'px';

        if (balas[i].y < 0) {
            balas[i].element.remove();
            balas.splice(i, 1);
        }
    }
}

/************************************************
 * GENERAR FILA DE ENEMIGOS
 ************************************************/
function generarFila() {
    const fila = document.createElement('div');
    fila.className = 'fila-enemigos';
    fila.style.position = 'absolute';
    fila.style.top = '20px';
    fila.style.left = '0';
    fila.style.width = '100%';
    fila.style.display = 'flex';
    fila.style.justifyContent = 'space-evenly';
    fila.style.padding = '0 40px';

    const cantidad = Math.floor(Math.random() * 4) + 3;

    for (let i = 0; i < cantidad; i++) {
        const tipo = tiposEnemigos[Math.floor(Math.random() * tiposEnemigos.length)];
        const enemigo = document.createElement('img');

        enemigo.src = tipo.src;
        enemigo.style.width = tipo.ancho + 'px';
        enemigo.classList.add('enemigo');

        enemigo.dataset.vida = tipo.vida;
        enemigo.dataset.tipo = tipo.tipo;

        fila.appendChild(enemigo);

        // 🔥 Disparo continuo de cada enemigo
        enemigo.disparoInterval = setInterval(() => {
            if (document.body.contains(enemigo)) {
                dispararGota(enemigo);
            } else {
                clearInterval(enemigo.disparoInterval);
            }
        }, 1000); // dispara cada 1 segundo
    }

    document.body.appendChild(fila);
}

/************************************************
 * COLISIONES BALA ↔ ENEMIGO
 ************************************************/
function comprobarColisionesBalas() {
    const enemigos = document.querySelectorAll('.enemigo');

    for (let i = balas.length - 1; i >= 0; i--) {
        const balaRect = balas[i].element.getBoundingClientRect();

        enemigos.forEach(enemigo => {
            const enemigoRect = enemigo.getBoundingClientRect();

            if (
                balaRect.left < enemigoRect.right &&
                balaRect.right > enemigoRect.left &&
                balaRect.top < enemigoRect.bottom &&
                balaRect.bottom > enemigoRect.top
            ) {
                balas[i].element.remove();
                balas.splice(i, 1);

                enemigo.dataset.vida--;
                if (enemigo.dataset.vida <= 0) {
                    enemigo.remove();
                    puntuacion += 10;
                    actualizarPuntuacion();
                    comprobarFilaVacia();
                }
            }
        });
    }
}

/************************************************
 * COMPROBAR SI LA FILA ESTÁ VACÍA
 ************************************************/
function comprobarFilaVacia() {
    const enemigos = document.querySelectorAll('.enemigo');
    if (enemigos.length === 0) {
        const fila = document.querySelector('.fila-enemigos');
        if (fila) fila.remove();
        setTimeout(() => generarFila(), 1500);
    }
}

/************************************************
 * DISPARO DE ENEMIGOS
 ************************************************/
function dispararGota(enemigo) {
    const tipo = enemigo.dataset.tipo;

    function crearBala(dx) {
        const gota = document.createElement('img');
        gota.src = 'Imagenes/Proyectil.png';
        gota.style.position = 'fixed';
        gota.style.width = '15px';

        const rect = enemigo.getBoundingClientRect();
        gota.style.left = rect.left + rect.width / 2 + 'px';
        gota.style.top = rect.bottom + 'px';

        document.body.appendChild(gota);
        gotas.push({ element: gota, x: rect.left + rect.width / 2, y: rect.bottom, dx: dx });
    }

    if (tipo === 'basico') {
        crearBala(0);
    } else if (tipo === 'medio') {
        crearBala(0);
        crearBala(-1);
        crearBala(1);
    } else if (tipo === 'dificil') {
        crearBala(0);
        crearBala(-1.5);
        crearBala(1.5);
        crearBala(-3);
        crearBala(3);
        crearBala(-0.5);
    }
}

/************************************************
 * ACTUALIZAR GOTAS
 ************************************************/
function actualizarGotas() {
    for (let i = gotas.length - 1; i >= 0; i--) {
        gotas[i].y += 3;
        gotas[i].x += gotas[i].dx || 0;
        gotas[i].element.style.top = gotas[i].y + 'px';
        gotas[i].element.style.left = gotas[i].x + 'px';

        const rectPDiddy = pDiddy.getBoundingClientRect();
        const rectGota = gotas[i].element.getBoundingClientRect();

        if (
            rectGota.left < rectPDiddy.right &&
            rectGota.right > rectPDiddy.left &&
            rectGota.top < rectPDiddy.bottom &&
            rectGota.bottom > rectPDiddy.top
        ) {
            gotas[i].element.remove();
            gotas.splice(i, 1);

            puntuacion -= 5;
            if (puntuacion < 0) puntuacion = 0;
            actualizarPuntuacion();
        }

        if (gotas[i] && gotas[i].y > window.innerHeight) {
            gotas[i].element.remove();
            gotas.splice(i, 1);
        }
    }
}

/************************************************
 * PUNTUACIÓN
 ************************************************/
function actualizarPuntuacion() {
    const puntHTML = document.getElementById('puntuació');
    if (puntHTML) puntHTML.textContent = `Pts: ${puntuacion}`;
}



