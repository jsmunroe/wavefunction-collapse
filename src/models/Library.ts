import manifest from "../assets/manifest.json";

export default class Library {

    private _assetCache: Map<string, Asset> = new Map();

    constructor() {
        this.loadAssets();
    }

    loadAssets() {
        for (const imageInfo of manifest.sprites) {
            const img = new Image();
            img.src = imageInfo.path;
            
            const asset: Asset = {
                name: imageInfo.name,
                image: img,
                isLoaded: false,
                path: imageInfo.path,
            };

            this._assetCache.set(imageInfo.name, asset);

            img.onload = () => {
                asset.isLoaded = true;
            }

            img.onerror = () => {
                throw new Error(`Failed to load image from ${imageInfo.path}`);
            }
        }
    }

    getImage(name: string): CanvasImageSource | null {
        const asset = this._assetCache.get(name);

        return asset?.isLoaded ? asset.image : null;
    }

}

type Asset = {
    name: string;
    image: CanvasImageSource;
    isLoaded: boolean;
    path: string;
}