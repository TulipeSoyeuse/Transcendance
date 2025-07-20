export default class DataHandler {
    constructor() {
        this.allGames = [];
        this.getAllGames();
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
}
// ! Get target usernames - JOIN TABLES
// Organize data
// Render charts & graphs
// Check treeshaking
