const localButton = document.getElementById('localButton');
const remoteButton = document.getElementById('remoteButton');
const gameModeSelection = document.getElementById('gameModeSelection');
const renderCanvas = document.getElementById('renderCanvas');
const player1ScoreDisplay = document.getElementById('player1ScoreDisplay');
const player2ScoreDisplay = document.getElementById('player2ScoreDisplay');
const player1ScoreValue = document.getElementById('player1ScoreValue');
const player2ScoreValue = document.getElementById('player2ScoreValue');
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
// Mesure toutes les 2 secondes
setInterval(measureLatency, 2000);
function resizeCanvas() {
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
    resizeCanvas(); // affiche le rendu front (en attendant que mon back soit pret)
    gameModeSelection.style.display = 'none';
    renderCanvas.style.display = 'block';
    player1ScoreDisplay.classList.remove('hidden');
    player2ScoreDisplay.classList.remove('hidden');
    //startGameUI();
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
    //startGameUI();
    console.log('Mode remote sélectionné');
    const res = fetch('/api/handle-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: "remote" })
    });
});
window.addEventListener('resize', resizeCanvas);
