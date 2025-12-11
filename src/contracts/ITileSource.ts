import type Tile from "../models/tiles/Tile";

export default interface ITileSource {
    getTiles(): Tile[]
}