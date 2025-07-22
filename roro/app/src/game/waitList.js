import { EventEmitter } from 'events';
function getTwoRandomPlayers(players) {
    const shuffled = [...players];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return [shuffled[0], shuffled[1]];
}
export class WaitList extends EventEmitter {
    constructor() {
        super();
        this.mapPlayer = new Map();
        console.log("WaitList class created");
        this.createMatch();
    }
    addRemote(player) {
        this.mapPlayer.set(player.session.userId, player);
        // joueur dans la liste d'attente
    }
    createMatch() {
        setInterval(() => {
            if (this.mapPlayer.size >= 2) {
                const playersArray = Array.from(this.mapPlayer.values());
                const [player1, player2] = getTwoRandomPlayers(playersArray);
                this.mapPlayer.delete(player1.session.userId);
                this.mapPlayer.delete(player2.session.userId);
                console.log(`Match créé entre ${player1.username} et ${player2.username}`);
                this.emit('RemoteMatchCreated', [player1, player2]);
                if (player1.socket && player2.socket) {
                    player1.socket.emit('match_found', { opponent: player2.username });
                    player2.socket.emit('match_found', { opponent: player1.username });
                }
            }
        }, 1000);
    }
}
