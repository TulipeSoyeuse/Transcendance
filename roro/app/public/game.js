const localButton = document.getElementById('localButton');
const remoteButton = document.getElementById('remoteButton');
const tournamentButton = document.getElementById('tournamentButton');
const gameModeSelection = document.getElementById('gameModeSelection');
const renderCanvas = document.getElementById('renderCanvas');
const scoresSection = document.getElementById('scoresSection');
const player1ScoreValue = document.getElementById('player1ScoreValue');
const player2ScoreValue = document.getElementById('player2ScoreValue');
const waitingForMatch = document.getElementById('waitingForMatch');
const cancelQueueButton = document.getElementById('cancelQueue');
export const socket = io('localhost:8080');
socket.on('connect', () => {
    console.log('WebSocket connected');
});
function measureLatency() {
    const start = Date.now();
    socket.emit("ping_check", start);
}
socket.on("pong_check", (start) => {
    const rtt = Date.now() - start;
    console.log("RTT (aller-retour) :", rtt + " ms");
});
socket.on("match_ended", (data) => {
    const container = renderCanvas.parentElement;
    if (!container)
        return;
    // Nettoie la zone pour éviter répétition
    container.innerHTML = "";
    const winnerText = document.createElement("h1");
    winnerText.textContent = `Le gagnant est : ${data.winner}`;
    winnerText.style.fontSize = "3rem";
    winnerText.style.color = "blue";
    winnerText.style.textAlign = "center";
    winnerText.style.marginTop = "1rem";
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
function resizeCanvas() {
    const width = 1000;
    const height = 600;
    renderCanvas.width = width;
    renderCanvas.height = height;
    renderCanvas.style.width = width + "px";
    renderCanvas.style.height = height + "px";
}
// Gestion du démarrage du jeu (affichage canvas et scores)
function startGameUI() {
    gameModeSelection.style.display = 'none';
    waitingForMatch.classList.add('hidden');
    renderCanvas.style.display = 'block';
    scoresSection.classList.remove('hidden');
    resizeCanvas();
}
localButton.addEventListener('click', () => {
    startGameUI();
    console.log('Mode local sélectionné');
    fetch('/api/handle-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: "local" })
    });
});
remoteButton.addEventListener('click', () => {
    // Cacher les autres sections
    gameModeSelection.style.display = 'none';
    renderCanvas.style.display = 'none';
    scoresSection.classList.add('hidden');
    waitingForMatch.classList.remove('hidden');
    console.log('Mode remote sélectionné');
    fetch('/api/handle-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: "remote" })
    });
});
//TODO : implementer cancel_queue
cancelQueueButton.addEventListener('click', () => {
    waitingForMatch.classList.add('hidden');
    gameModeSelection.style.display = 'flex'; // remettre la sélection visible
    console.log('Annulation de la recherche de match');
    socket.emit('cancel_queue');
});
// Quand un match est trouvé
socket.on('match_found', (data) => {
    // Affiche le message dans la section d’attente
    const statusParagraph = document.getElementById('matchStatus');
    const opponentNameParagraph = document.getElementById('opponentName');
    const opponentNameValue = document.getElementById('opponentNameValue');
    statusParagraph.textContent = "Adversaire trouvé ! Prépare-toi...";
    opponentNameParagraph.classList.remove('hidden');
    opponentNameValue.textContent = data.opponent;
    // Après 3 secondes, cacher l'attente et afficher le jeu
    setTimeout(() => {
        waitingForMatch.classList.add('hidden');
        renderCanvas.style.display = 'block';
        scoresSection.classList.remove('hidden');
        resizeCanvas();
        console.log(`Match démarré contre ${data.opponent}`);
    }, 3000);
});
window.addEventListener('resize', resizeCanvas);
