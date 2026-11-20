import assert from 'node:assert/strict';
import {readFile,access,readdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {products,productPath,legacySlugs} from '../src/data.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
async function readRoute(route){
 const html=await readFile(resolve(root,'dist','.'+route,'index.html'),'utf8');
 assert(html.includes('<html lang="ru">'),route+' language');
 assert(html.includes('Русский лес'),route+' brand');
 assert(!/agrumea|Sicily|Sicilian|Pistachio|use.typekit.net/i.test(html),'Only Russian Forest content and assets on '+route);
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,route+' one heading');
 assert.match(html,/id="site-main"/);assert.match(html,/id="site-menu"/);
 assert.match(html,/aria-controls="site-menu" aria-expanded="false"/);
 for(const match of html.matchAll(/href="(\/[^"#?]*)/g)){
  const target=match[1];await access(resolve(root,'dist','.'+target,target.endsWith('/')?'index.html':''));
 }
 for(const match of html.matchAll(/src="(\/[^"#?]*)/g))await access(resolve(root,'dist','.'+match[1]));
 assert(!html.includes('href="#"'));
 for(const output of ['dist','.output/public'])assert.equal(await readFile(resolve(root,output,'.'+route,'index.html'),'utf8'),html);
 return html;
}
const aliases=[['/en/','/'],['/en/dispensa/','/catalog/banki/'],['/dispensa/','/catalog/banki/'],['/en/privacy/','/privacy/'],...Object.entries(legacySlugs).flatMap(([oldSlug,slug])=>['/en/dispensa/','/dispensa/'].map(prefix=>[prefix+oldSlug+'/',productPath({slug})])),...['produzione:production','chi-siamo:about','experience:wholesale','contatti:contacts'].map(pair=>{const [oldSlug,slug]=pair.split(':');return ['/en/'+oldSlug+'/','/'+slug+'/'];})];
const routes=['/','/catalog/banki/','/privacy/','/production/','/about/','/wholesale/','/contacts/',...products.map(productPath),...aliases.map(([route])=>route)];
for(const route of routes)await readRoute(route);
for(const [alias,canonical] of aliases)assert.equal(await readRoute(alias),await readRoute(canonical),alias+' keeps the Russian Forest design');
for(const route of ['/','/en/']){
 const html=await readRoute(route);
 assert(html.includes('Русский лес — натуральные джемы, варенье и лесные десерты'));
 assert.equal((html.match(/class="home-jar"/g)||[]).length,products.length);
}
// Every emitted page, including 404, must stay Russian-only after a rebuild.
let pages=0;
async function checkOutput(folder){
 for(const entry of await readdir(folder,{withFileTypes:true})){
  const file=resolve(folder,entry.name);
  assert(!/agrumea/i.test(entry.name),file+' does not ship obsolete brand assets');
  if(entry.isDirectory())await checkOutput(file);
  else if(entry.name.endsWith('.html')){
   const html=await readFile(file,'utf8');pages++;
   assert(html.includes('<html lang="ru">')&&html.includes('Русский лес'),file+' has Russian Forest branding');
   assert(!/agrumea|Sicily|Sicilian|Pistachio|use.typekit.net/i.test(html),file+' has no obsolete interface');
  }
 }
}
for(const output of ['dist','.output/public'])await checkOutput(resolve(root,output));
assert.equal(pages,(routes.length+1)*2,'No obsolete pages survive in either output');
for(const p of products){
 const html=await readRoute(productPath(p));
 assert.equal((html.match(/class="product-slide"/g)||[]).length,products.length-1);
 assert.match(html,/class="site-footer__mark"/);
 assert.match(html,/photo-track/);assert.match(html,/КАК ПОПРОБОВАТЬ/);assert.match(html,/ФАСОВКА/);assert.match(html,/СРОК ГОДНОСТИ/);
}
for(const asset of ['site.js','styles.css','home-shape.svg']){
 const source=await readFile(resolve(root,'public',asset),'utf8');
 for(const output of ['dist','.output/public'])assert.equal(await readFile(resolve(root,output,asset),'utf8'),source);
}
// Restored photographs must stay high-resolution RGBA PNGs and ship in both outputs.
for(const p of products.filter(p=>p.enhanced)){
 const asset=await readFile(resolve(root,'public','.'+p.image));
 assert.equal(asset.toString('hex',0,8),'89504e470d0a1a0a',p.name+' PNG');
 assert(asset.readUInt32BE(16)>=1000&&asset.readUInt32BE(20)>=1000,p.name+' resolution');
 assert.equal(asset[25],6,p.name+' alpha channel');
 for(const output of ['dist','.output/public'])assert.deepEqual(await readFile(resolve(root,output,'.'+p.image)),asset,p.name+' shipped image');
}
console.log('Checked '+routes.length+' Russian Forest routes and 404, historical aliases, both outputs, local links, headings, galleries and assets.');
await import('./client-check.mjs');
