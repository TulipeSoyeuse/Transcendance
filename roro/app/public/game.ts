

const localButton = document.getElementById('localButton') as HTMLButtonElement;
const remoteButton = document.getElementById('remoteButton') as HTMLButtonElement;
const gameModeSelection = document.getElementById('gameModeSelection') as HTMLDivElement;
const renderCanvas = document.getElementById('renderCanvas') as HTMLCanvasElement;


export const socket = io('localhost:8080');

console.log("coucou je rentre ici");

socket.on('connect', () => {
  console.log('WebSocket connected');
});


function resizeCanvas(): void {
  renderCanvas.width = window.innerWidth;
  renderCanvas.height = window.innerHeight;
}

localButton.addEventListener('click', () => {
  gameModeSelection.style.display = 'none'; 
  renderCanvas.style.display = 'block'; 
  resizeCanvas();  // affiche le rendu front (en attendant que mon back soit pret)
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
  console.log('Mode remote sélectionné');
  const res = fetch('/api/handle-game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: "remote" })
  });
});

window.addEventListener('resize', resizeCanvas);
