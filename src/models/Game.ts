import Library from "../services/Library";
import Player from "./entities/Player";
import World from "./World";
import { RandomSource, type Rng } from "../utils/random"

export class Game {
    private _world: World;
    private _player: Player;

    private _library: Library

    private _isStarted: boolean = false;
    private _randomSource: RandomSource;

    constructor(random: Rng) {
        this._library = new Library();
        this._randomSource = new RandomSource(random);
        this._world = new World(this);

        this._player = new Player(this);
    }

    get world() {
        return this._world;
    }

    get player() {
        return this._player;
    }

    get library() {
        return this._library;
    }

    get isStarted(): boolean {
        return this._isStarted;
    }

    get random(): RandomSource {
        return this._randomSource;
    }

    newGame(): Promise<void> {
        return this.library.loadAssets()
            .then(() => {
                this._world = new World(this);
                this._player = new Player(this);
        
                this._world.getRoom({ x: 0, y: 0 }).addSprite(this._player);
        
                this._isStarted = true;
            });
    }
}