import fs from 'fs';
import fg from 'fast-glob';
import * as path from 'path';

const currentWorkingDirectory = process.cwd();

const manifest = {}

const spritesDirectory = `${currentWorkingDirectory}/../public/sprites`;

(async () => {

    try {
        const spriteFiles = await fg('**/*.png', { cwd: spritesDirectory });

        manifest['sprites'] = spriteFiles.map(filePath => {
            return {
                name: path.basename(filePath, path.extname(filePath)),
                path: `/wavefunction-collapse/sprites/${filePath}`
            };
        });

        const manifestJson = JSON.stringify(manifest, null, 4);
        fs.writeFile('manifest.json', manifestJson, (err) => {
            if (err) {
                console.error('Error writing manifest file:', err);
            }
        });

        console.log('Manifest created successfully.');

    } catch (error) {
        console.error('Error creating manifest:', error);
    }

})();