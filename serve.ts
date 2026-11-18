import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const args = process.argv.slice(2);
const at = args.indexOf('--port');
const candidate = at < 0 ? 8080 : Number(args[at + 1]);
const port = Number.isInteger(candidate) && candidate > 0 && candidate < 65536 ? candidate : 8080;
const mime: Record<string,string> = {
  '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8',
  '.json':'application/json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml',
};
createServer((request,response)=>{
  let path:string;
  try{path=decodeURIComponent(new URL(request.url??'/', 'http://localhost').pathname);}catch{response.writeHead(400).end('bad request');return;}
  if(path.endsWith('/'))path+='index.html';
  const file=resolve(join(root,normalize(path)));
  if(file!==root&&!file.startsWith(root+sep)){response.writeHead(403).end('forbidden');return;}
  try{const size=statSync(file).size;response.writeHead(200,{'content-type':mime[extname(file).toLowerCase()]??'application/octet-stream','content-length':size,'cache-control':'no-store'});createReadStream(file).pipe(response);}
  catch{response.writeHead(404).end('not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Saltline is running at http://127.0.0.1:${port}`));
