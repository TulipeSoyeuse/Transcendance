interface Game {
	id_player1: number;
	id_player2: number;
	score_player_1: number;
	score_player_2: number;
	current_is_player1: number;
	created_at: string;
	winner: number; // userid
	username_player1: string;
	username_player2: string;
}

export default class DataHandler {
	private allGames: Game[] = [];
	constructor() {
		this.getAllGames();
	}

	private async fetchGamehistory(): Promise<Game[] | null> {
		try {
		  	const res = await fetch(`/api/dashboard/gamehistory`);
		  	const data = await res.json();
		  	if (res.status === 404 || res.status === 500) {
			console.log(data.message)
			return null;
			};
			console.log("DATA FETCHED = ", data); // ! DEBUG
			return (data)
		} catch (err) {
			console.error("Failed to fetch or parse JSON:", err);
			return (null);
		}
	}

	private async getAllGames() {
		const data = await this.fetchGamehistory();
		if (!data) return;
		this.allGames = data as Game[];
		console.log("All games = ", this.allGames); // ! DEBUG
	}
}


// ! Get target usernames - JOIN TABLES
// Organize data
// Render charts & graphs
// Check treeshaking