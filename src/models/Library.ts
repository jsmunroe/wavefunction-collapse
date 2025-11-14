import manifest from "../assets/manifest.json";

export default class Library {
    private _assets: Asset[] = [];

    constructor() {
        this.loadAssets();
    }

    loadAssets() {
        this._assets = [];
        for (const imageInfo of manifest.images) {
            const img = new Image();
            img.src = imageInfo.path;
            
            const asset: Asset = {
                name: imageInfo.name,
                image: img,
                isLoaded: false,
                path: imageInfo.path,
            };

            img.onload = () => {
                asset.isLoaded = true;
            }

            img.onerror = () => {
                throw new Error(`Failed to load image from ${imageInfo.path}`);
            }

            this._assets.push(asset);
        }
    }

    getImage(name: string): CanvasImageSource | null {
        const asset = this._assets.find(a => a.name === name);

        return asset?.isLoaded ? asset.image : null;
    }

}

type Asset = {
    name: string;
    image: CanvasImageSource;
    isLoaded: boolean;
    path: string;
}