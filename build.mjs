import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
await Promise.all(['index.html','favicon.svg'].map(file=>copyFile(file,'dist/'+file)));
