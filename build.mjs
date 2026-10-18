import {mkdir,copyFile,readFile,writeFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
await Promise.all(['index.html','favicon.svg'].map(file=>copyFile(file,'dist/'+file)));
await mkdir('cloud-functions/api',{recursive:true});
const backend=(await readFile('game.js','utf8')).replace(/\bonRequest\b/g,'gameBackend');
const entry=backend.replace(/export\s*\{\s*gameBackend\s*\};\s*$/, 'export function onRequest(context) { return gameBackend(context); }');
if(entry===backend)throw new Error('Backend export not found');
await writeFile('cloud-functions/api/game.js',entry);
