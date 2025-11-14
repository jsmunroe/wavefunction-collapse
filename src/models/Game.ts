import Library from "./Library";
import Player from "./Player";
import World from "./World";

export class Game {
    private _world = new World();
    private _player = new Player(this);

    private _library = new Library();

    get world() {
        return this._world;
    }

    get player() {
        return this._player;
    }

    get library() {
        return this._library;
    }
}