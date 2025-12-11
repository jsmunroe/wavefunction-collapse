import fs from 'fs';
import fg from 'fast-glob';
import * as path from 'path';
import getPixels from 'get-pixels';

const currentWorkingDirectory = process.cwd();

const manifest = {}

export function range(max) {
    const result = [];
    for (let i = 0; i < max; i++) {
        result.push(i);
    }
    return result;
}


(async () => {

    const spritesDirectory = `${currentWorkingDirectory}\\public\\sprites`;


    try {
        const spriteFiles = await fg('**/*.png', { cwd: spritesDirectory });

        manifest['sprites'] = spriteFiles.map(filePath => {
            return {
                name: path.basename(filePath, path.extname(filePath)),
                path: `/wavefunction-collapse/sprites/${filePath}`
            };
        });

    } catch (error) {
        console.error('Error creating manifest:', error);
    }



    const tilesDirectory = `${currentWorkingDirectory}\\public\\tiles`;

    try {
        const tileFiles = await fg('**/*/*.png', { cwd: tilesDirectory });

        const rexTilePath = /^(?<group>\w+)\/(?<name>\w+?_\d*\w*)\.png$/i;
        const rexSecondaryDirections = /^\w+\/\w+?_(?<north>(1|0))(?<east>(1|0))(?<south>(1|0))(?<west>(1|0))*(?<a>a?)(?<b>b?)(?<c>c?)(?<d>d?)\.png$/i

        const tiles = await Promise.all(tileFiles.map(async filePath => {

            const match = filePath.match(rexTilePath);

            if (!match) {
                return;
            }

            const secondaryDirectionsMatch = rexSecondaryDirections.exec(filePath);

            if (!secondaryDirectionsMatch) {
                return;
            }

            const [north, east, south, west] = [
                secondaryDirectionsMatch.groups.north === '1',
                secondaryDirectionsMatch.groups.east === '1',
                secondaryDirectionsMatch.groups.south === '1',
                secondaryDirectionsMatch.groups.west === '1',
            ]

            const [northEast, southEast, southWest, northWest ] = [
                north || east || secondaryDirectionsMatch.groups.a === 'a',
                south || east || secondaryDirectionsMatch.groups.b === 'b',
                south || west || secondaryDirectionsMatch.groups.c === 'c',
                north || west || secondaryDirectionsMatch.groups.d === 'd',
            ]


            const { group, name } = match.groups;

            const values = await getImageBoundaries(path.join('public/tiles', filePath));

            return {
                group,
                name,
                north: values[0],
                west: values[1],
                south: values[2],
                east: values[3],
                northEast,
                southEast,
                northWest,
                southWest,
                path: `/wavefunction-collapse/tiles/${filePath}`
            };
        }));
            

        const tilesByGroup = Map.groupBy(tiles.filter(t => t !== undefined), t => t.group);

        manifest['tiles'] = {}

        for (const [group, tiles] of tilesByGroup.entries()) {
            manifest['tiles'][group] = tiles;
        }
    } catch (error) {
        console.error('Error creating manifest:', error);
    }

    try {
        const manifestJson = JSON.stringify(manifest, null, 4);
        fs.writeFile('src/manifest.json', manifestJson, (err) => {
            if (err) {
                console.error('Error writing manifest file:', err);
            }
        });

        console.log('Manifest created successfully.');

    }
    catch (error) {
        console.error('Error writing manifest file:', error);
    }

})();

async function getImageBoundaries(path) {
    return new Promise((resolve) => {
        getPixels(path, (err, pixels) => {
            if (err) {
                console.error('Error loading image:', err);
                return;
            }

            const width = pixels.shape[0];
            const height = pixels.shape[1];

            const mx = width - 1;
            const my = height - 1;

            // North
            const indices = [
                range(width).map(i => (0 * width + i) * 4),
                range(height).map(i => (i * width + 0) * 4),
                range(width).map(i => (my * width + i) * 4),
                range(height).map(i => (i * width + mx) * 4),
            ]

            let values = [];

            for (let j = 0; j < indices.length; j++) {
                let points = [];

                for (let i = 0; i < indices[j].length; i++) {
                    const index = indices[j][i];

                    const r = pixels.data[index + 0];
                    const g = pixels.data[index + 1];
                    const b = pixels.data[index + 2];
                    const a = pixels.data[index + 3];

                    if (a !== 0) {
                        points.push(i);
                    }
                }

                values.push(points);
            };

            resolve(values);
        })
    });
}