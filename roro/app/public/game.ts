declare const confetti: (options: any) => void;
export const socket = io('localhost:8080');

export function init() {
  const localButton = document.getElementById('localButton') as HTMLButtonElement;
  const remoteButton = document.getElementById('remoteButton') as HTMLButtonElement;
  const tournamentButton = document.getElementById('tournamentButton') as HTMLButtonElement;

  const gameModeSelection = document.getElementById('gameModeSelection') as HTMLDivElement;
  const renderCanvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

  const scoresSection = document.getElementById('scoresSection') as HTMLDivElement;
  const player1ScoreValue = document.getElementById('player1ScoreValue') as HTMLSpanElement;
  const player2ScoreValue = document.getElementById('player2ScoreValue') as HTMLSpanElement;

  const waitingForMatch = document.getElementById('waitingForMatch') as HTMLDivElement;
  const cancelQueueButton = document.getElementById('cancelQueue') as HTMLButtonElement;

  socket.on('connect', () => {
    console.log('WebSocket connected');
  });

  function measureLatency() {
    const start = Date.now();
    socket.emit("ping_check", start);
  }

  socket.on("pong_check", (start: any) => {
    const rtt = Date.now() - start;
    console.log("RTT (aller-retour) :", rtt + " ms");
  });

  socket.on("match_ended", (data: { message: string, winner: string }) => {
    const container = renderCanvas.parentElement;
    if (!container) return;

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

  function resizeCanvas(): void {
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
  socket.on('match_found', (data: { opponent: string }) => {
    // Affiche le message dans la section d’attente
    const statusParagraph = document.getElementById('matchStatus') as HTMLParagraphElement;
    const opponentNameParagraph = document.getElementById('opponentName') as HTMLParagraphElement;
    const opponentNameValue = document.getElementById('opponentNameValue') as HTMLSpanElement;

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
}
