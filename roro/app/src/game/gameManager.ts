
import { Room } from './room.js'


//Singleton GameManager
export class GameManager {
    // tableau de room 
    private rooms: Room[] = [];

    static #instance: GameManager
    private constructor() {
        console.log("Game Manager crée");
    }

    public static getInstance() : GameManager {
    if(!this.#instance) {
        this.#instance = new GameManager();
    }
        return this.#instance;
    };

    //Implementation de GameManager
    public addRoom(mode: string) {
        if(mode === "local") {
            //appeler une room en mode local
        }

        else {
            //appeler un room en mode remote
        }
    }
}
