declare const confetti: (options: any) => void;


const localButton = document.getElementById('localButton') as HTMLButtonElement;
const remoteButton = document.getElementById('remoteButton') as HTMLButtonElement;
const gameModeSelection = document.getElementById('gameModeSelection') as HTMLDivElement;
const renderCanvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const player1ScoreDisplay = document.getElementById('player1ScoreDisplay') as HTMLDivElement;
const player2ScoreDisplay = document.getElementById('player2ScoreDisplay') as HTMLDivElement;
const player1ScoreValue = document.getElementById('player1ScoreValue') as HTMLSpanElement;
const player2ScoreValue = document.getElementById('player2ScoreValue') as HTMLSpanElement;


export const socket = io('localhost:8080');

socket.on('connect', () => {
  console.log('WebSocket connected');
});

// 
function measureLatency() {
  const start = Date.now();
  socket.emit("ping_check", start);
}

socket.on("pong_check", (start) => {
  const rtt = Date.now() - start;
  console.log("RTT (aller-retour) :", rtt + " ms");
});


socket.on("match_ended", (data: { message: string, winner: string }) => {
  // Affiche un message avec le gagnant en gros
  const container = document.getElementById("renderCanvas")?.parentElement;
  if (!container) return;

  const winnerText = document.createElement("h1");
  winnerText.textContent = `Le gagnant est : ${data.winner}`;
  winnerText.style.fontSize = "3rem";
  winnerText.style.color = "blue";
  winnerText.style.textAlign = "center";
  winnerText.style.marginTop = "1rem";

  // Affiche le bouton pour revenir à l'accueil
  const button = document.createElement("button");
  button.textContent = "Retour à l'accueil";
  button.className = "mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition";
  button.onclick = () => {
    window.location.href = "/";
  };

  container.appendChild(winnerText);
  container.appendChild(button);
  
  const duration = 4000;
  const animationEnd = Date.now() + duration;

const interval = setInterval(() => {
  confetti({
    particleCount: 50,
    spread: 100,
    origin: { y: 0.6 }
  });

  if (Date.now() > animationEnd) {
    clearInterval(interval);
  }
}, 100);
});



// Mesure toutes les 2 secondes
setInterval(measureLatency, 2000);


function resizeCanvas(): void {
  const width = 1000;
  const height = 600;

  // Taille du rendu (résolution réelle)
  renderCanvas.width = width;
  renderCanvas.height = height;

  // Taille visible à l'écran (style CSS)
  renderCanvas.style.width = width + "px";
  renderCanvas.style.height = height + "px";
}




// TODO : refaire le systeme de connection websocket, choix du mode et affichage du canvas/score
function startGameUI() {
  gameModeSelection.style.display = 'none';
  renderCanvas.style.display = 'block';
  scoreDisplay.classList.remove('hidden');
  resizeCanvas();
}


localButton.addEventListener('click', () => {
  gameModeSelection.style.display = 'none'; 
  renderCanvas.style.display = 'block'; 
  resizeCanvas();  // affiche le rendu front (en attendant que mon back soit pret)
  gameModeSelection.style.display = 'none';
  renderCanvas.style.display = 'block';
  player1ScoreDisplay.classList.remove('hidden');
  player2ScoreDisplay.classList.remove('hidden');
  console.log('Mode local sélectionné');
  const res = fetch('/api/handle-game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: "local" })
  });
});

remoteButton.addEventListener('click', () => {
  gameModeSelection.style.display = 'none'; 
  renderCanvas.style.display = 'block'; // Afficher le canvas
  resizeCanvas(); // affiche le rendu front (en attendant que mon back soit pret)
  gameModeSelection.style.display = 'none';
  renderCanvas.style.display = 'block';
  player1ScoreDisplay.classList.remove('hidden');
  player2ScoreDisplay.classList.remove('hidden');
  console.log('Mode remote sélectionné');
  const res = fetch('/api/handle-game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: "remote" })
  });
});

window.addEventListener('resize', resizeCanvas);
