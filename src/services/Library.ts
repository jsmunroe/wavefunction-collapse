import type ITileSource from "../contracts/ITileSource";
import manifest from "../manifest.json";
import { Direction } from "../models/Openings";
import ImageTile from "../models/tiles/ImageTile";
import { reverseNibble } from "../utils/binary";

export default class Library implements ITileSource {
    private _spritesCache: Map<string, ImageAsset> = new Map();
    private _tilesCache: TileAssetCategory[] = [];

    private loadImage(path: string): Promise<CanvasImageSource> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = path;
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image from ${path}`));
        });
    }

    async loadAssets(): Promise<void> {
        for (const imageInfo of manifest.sprites) {
            const img = await this.loadImage(imageInfo.path);

            const asset: ImageAsset = {
                name: imageInfo.name,
                image: img,
                path: imageInfo.path,
            };

            this._spritesCache.set(imageInfo.name, asset);
        }

        for (const [name, tiles] of Object.entries(manifest.tiles)) {
            const tileAssetCategory: TileAssetCategory = {
                name: name,
                tiles: [],
            };

            for (const tileInfo of tiles) {
                const asset: TileAsset = {
                    name: tileInfo.name,
                    image: await this.loadImage(tileInfo.path),
                    path: tileInfo.path,
                    opennings: this.parseOpeningsFromTilePath(tileInfo.path),
                    north: tileInfo.north,
                    east: tileInfo.east,
                    south: tileInfo.south,
                    west: tileInfo.west,
                    northEast: tileInfo.northEast,
                    southEast: tileInfo.southEast,
                    northWest: tileInfo.northWest,
                    southWest: tileInfo.southWest,
                }

                tileAssetCategory.tiles.push(asset);
            }

            this._tilesCache.push(tileAssetCategory);
        }
    }

    getSprite(name: string): CanvasImageSource | null {
        const asset = this._spritesCache.get(name);

        return asset?.image ?? null;
    }

    getTiles(): ImageTile[];
    getTiles(category: string): ImageTile[];
    getTiles(category?: string): ImageTile[] {
        let tileCategories = [...this._tilesCache];

        if (category) {
            tileCategories = tileCategories.filter(t => t.name === category);
        }

        const tiles: ImageTile[] = [];

        for (const tile of tileCategories.flatMap(tc => tc.tiles)) {
            const rexTilePath = /(?<name>\w+)_(?<walls>\d+\w*)\.png$/;
            const match = rexTilePath.exec(tile.path);

            const name = match?.groups?.name ?? "Unknown";
            const walls = match?.groups?.walls ?? "0000";

            tiles.push(new ImageTile(
                name,
                walls,
                tile.image, 
                tile.north,
                tile.east,
                tile.south,
                tile.west,
                tile.northEast,
                tile.southEast,
                tile.northWest,
                tile.southWest,
                tile.opennings
            ));
        }

        return tiles;
    }

    private parseOpeningsFromTilePath(tilePath: string): number {
        const rexTilePath = /\w+_(?<walls>\d+)[abcd]*?\.png$/;
        const match = tilePath.match(rexTilePath);

        if (!match?.groups) {
            return 0;
        }

        const walls = Number.parseInt(match.groups.walls, 2);
        const openings = (~reverseNibble(walls)) & 0x0F;

        return openings;
    }

}

type ImageAsset = {
    name: string;
    image: CanvasImageSource;
    path: string;
}

type TileAssetCategory = {
    name: string;
    tiles: TileAsset[];
}

type TileAsset = ImageAsset & {
    opennings: number;
    north: number[];
    east: number[];
    south: number[];
    west: number[];
    northEast: boolean;
    southEast: boolean;
    northWest: boolean;
    southWest: boolean;
}