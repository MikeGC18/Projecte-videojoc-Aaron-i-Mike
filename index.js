const video = document.getElementById('introvideo');
const start = document.getElementById('Start');
const skipBtn = document.getElementById('skipButton');

start.style.visibility = 'hidden';

const bgMusic = new Audio('Musica/Musicainicial.mp3');
bgMusic.loop = true;

function endIntro(playMusic) {
     video.pause();
video.style.display = 'none';
start.style.visibility = 'visible';
skipBtn.style.display = 'none';
if (playMusic) {
    bgMusic.play();
     }
        }
video.addEventListener('ended', () => endIntro(false));

skipBtn.addEventListener('click', () => endIntro(true));
