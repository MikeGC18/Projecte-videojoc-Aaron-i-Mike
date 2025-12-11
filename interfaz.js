let pDiddy;
let diddyPosition = 50; 
const speed = 0.15; 
let keys = {}; 
let balas = []; // Array para almacenar las balas activas

window.onload = function() {
    pDiddy = document.getElementById('PDiddy');

    // Ocultar las instrucciones 
    setTimeout(function() {
        const instruccions = document.getElementById('Instruccions');
        if (instruccions) {
            instruccions.style.opacity = '0';
            instruccions.style.transition = 'opacity 1s ease';
            setTimeout(function() {
                instruccions.style.display = 'none';
            }, 1000);
        }
    }, 2000);


    document.addEventListener('keydown', function(event) {
        const key = event.key.toLowerCase();
        
        // Si se presiona espacio, disparar
        if (key === ' ' && !keys[' ']) {
            dispararBabyOil();
        }
        
        keys[key] = true;
    });
    
    document.addEventListener('keyup', function(event) {
        keys[event.key.toLowerCase()] = false;
    });

    
    updatePosition();
};


function updatePosition() {
    if (keys['a'] && diddyPosition > 5) {
        // Mover a la izquierda
        diddyPosition -= speed;
        pDiddy.style.left = diddyPosition + '%';
    }
    if (keys['d'] && diddyPosition < 95) {
        // Mover a la derecha
        diddyPosition += speed;
        pDiddy.style.left = diddyPosition + '%';
    }
    
    // Actualizar posición de las balas
    for (let i = balas.length - 1; i >= 0; i--) {
        balas[i].y -= 2; // Velocidad disparo
        balas[i].element.style.top = balas[i].y + 'px';
        
        // Eliminar bala si sale de la pantalla
        if (balas[i].y < -50) {
            balas[i].element.remove();
            balas.splice(i, 1);
        }
    }
    
    requestAnimationFrame(updatePosition);
}

function dispararBabyOil() {
    const bala = document.createElement('img');
    bala.src = 'Imagenes/babyoild_preview_rev_1 (1).png';
    bala.style.position = 'fixed';
    bala.style.width = '30px';
    bala.style.height = 'auto';
    bala.style.zIndex = '10';
    
    // posición de P.Diddy
    const diddyRect = pDiddy.getBoundingClientRect();
    const startX = diddyRect.left + diddyRect.width / 2 - 15; 
    const startY = diddyRect.top;
    
    bala.style.left = startX + 'px';
    bala.style.top = startY + 'px';

    document.body.appendChild(bala);
    
    // Agregar al array de balas
    balas.push({
        element: bala,
        x: startX,
        y: startY
    });
}
