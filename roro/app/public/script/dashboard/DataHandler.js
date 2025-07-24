export default class DataHandler {
    constructor() {
        this.allGames = [];
        this.stats = {
            totalGames: 0,
            winRate: 0, // %
            currentWinStreak: 0, // n games
            longestWinStreak: 0,
            totalGoalsScored: 0,
        };
        this.initStats();
    }
    getStats() {
        return (this.stats);
    }
    setStats() {
        let totalWins, currWinStreak, longestWinStreak, totalGoals;
        totalWins = currWinStreak = longestWinStreak = totalGoals = 0;
        this.stats.totalGames = this.allGames.length;
        for (const game of this.allGames) {
            console.log("TEST1"); // ! DEBUG
            if (game.current_is_winner) {
                console.log("TEST2"); // ! DEBUG
                totalWins++;
                currWinStreak++;
                totalGoals += (game.winner === game.id_player1) ? game.score_player_1 : game.score_player_2;
            }
            else {
                if (currWinStreak > longestWinStreak)
                    longestWinStreak = currWinStreak;
                currWinStreak = 0;
                totalGoals += !(game.winner === game.id_player1) ? game.score_player_1 : game.score_player_2;
            }
        }
        if (currWinStreak > longestWinStreak)
            longestWinStreak = currWinStreak;
        this.stats.currentWinStreak = currWinStreak;
        this.stats.longestWinStreak = longestWinStreak;
        this.stats.totalGoalsScored = totalGoals;
        this.stats.winRate = totalWins * 100 / this.stats.totalGames;
        console.log("STATS = ", this.stats); // ! DEBUG
    }
    async fetchGamehistory() {
        try {
            const res = await fetch(`/api/dashboard/gamehistory`);
            const data = await res.json();
            if (res.status === 404 || res.status === 500) {
                console.log(data.message);
                return null;
            }
            ;
            console.log("DATA FETCHED = ", data); // ! DEBUG
            return (data);
        }
        catch (err) {
            console.error("Failed to fetch or parse JSON:", err);
            return (null);
        }
    }
    async getAllGames() {
        const data = await this.fetchGamehistory();
        if (!data)
            return;
        this.allGames = data;
        console.log("All games = ", this.allGames); // ! DEBUG
    }
    async initStats() {
        await this.getAllGames();
        this.setStats();
    }
}
// 1. USER DASHBOARD
// - Total games played : array length
// - Win rate: loop over array & count Winnner OR ? map new array & count length
// - Current win streak: loop from last index until 
// - Longest win streak
// - Total goals scored
// 1. Organize data - OK
// 2. Render charts & graphs
// 3. Check treeshaking
