const localButton = document.getElementById('localButton');
const remoteButton = document.getElementById('remoteButton');
const gameModeSelection = document.getElementById('gameModeSelection');
const renderCanvas = document.getElementById('renderCanvas');
export const socket = io('localhost:8080');
socket.on('connect', () => {
    console.log('WebSocket connected');
});
function measureLatency() {
    const start = Date.now();
    socket.emit("ping_check", start); // envoie le timestamp au serveur
}
socket.on("pong_check", (start) => {
    const rtt = Date.now() - start;
    console.log("RTT (aller-retour) :", rtt + " ms");
});
// Mesure toutes les 2 secondes
setInterval(measureLatency, 2000);
function resizeCanvas() {
    renderCanvas.width = window.innerWidth;
    renderCanvas.height = window.innerHeight;
}
localButton.addEventListener('click', () => {
    gameModeSelection.style.display = 'none';
    renderCanvas.style.display = 'block';
    resizeCanvas(); // affiche le rendu front (en attendant que mon back soit pret)
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
