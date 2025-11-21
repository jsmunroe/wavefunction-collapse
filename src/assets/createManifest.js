import fs from 'fs';
import fg from 'fast-glob';
import * as path from 'path';

const assetsDirectory = process.cwd();

const manifest = {}

const spritesDirectory = `${assetsDirectory}/sprites`;

(async () => {

    try {
        const spriteFiles = await fg('**/*.png', { cwd: spritesDirectory });

        manifest['sprites'] = spriteFiles.map(filePath => {
            return {
                name: path.basename(filePath, path.extname(filePath)),
                path: `/wavefunction-collapse/src/assets/sprites/${filePath}`
            };
        });

        const manifestJson = JSON.stringify(manifest, null, 4);
        fs.writeFile('manifest.json', manifestJson, (err) => {
            
        });

        console.log('Manifest created successfully.');

    } catch (error) {
        console.error('Error creating manifest:', error);
    }

})();