import fs from 'node:fs/promises';
import * as catalog from './catalog.js';

const UPLOADS_FOLDER = './uploads';
const DATA_FOLDER = './data';

let dataFile = 'data.json';

const dataString = await fs.readFile(DATA_FOLDER + '/' + dataFile, 'utf8');

const series = JSON.parse(dataString);

await catalog.deleteSeries();
for (let serie of series) {
    await catalog.addSerie(serie);
}
await fs.rm(UPLOADS_FOLDER, { recursive: true, force: true });
await fs.mkdir(UPLOADS_FOLDER);
await fs.cp(DATA_FOLDER + '/images/.', UPLOADS_FOLDER, { recursive: true });
await fs.cp(DATA_FOLDER + '/video/.', UPLOADS_FOLDER, { recursive: true });

console.log('Demo data loaded');

