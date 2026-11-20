import { mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { resolve, dirname, sep, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { products, productPath, legacySlugs } from '../src/data.mjs';
import { home, productPage, pantry, infoPage, privacy, notFound, document } from '../src/render.mjs';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root,'dist');
const mirror = resolve(root,'.output/public');
// Recreate generated folders so an obsolete page or asset cannot survive a rebuild.
for(const target of [output,mirror]){
 if(!target.startsWith(root+sep))throw new Error('Build output must stay inside app/');
 await rm(target,{recursive:true,force:true});
}
await mkdir(output,{recursive:true});
// Historical brand assets remain source material, outside the published site.
await cp(resolve(root,'public'),output,{recursive:true,filter:source=>!/agrumea/i.test(basename(source))});
const description='Русский лес — натуральные ягодные джемы, варенье из сосновых шишек и подарки из Пермского края.';
const routes=new Map([['/',[home(),'Русский лес | Натуральные джемы и варенье',description]],['/en/',[home(),'Русский лес | Натуральные джемы и варенье',description]],['/catalog/banki/',[pantry(),'Вкусы леса | Русский лес',description]],['/en/dispensa/',[pantry(),'Вкусы леса | Русский лес',description]],['/dispensa/',[pantry(),'Вкусы леса | Русский лес',description]],['/en/privacy/',[privacy(),'Конфиденциальность | Русский лес',description]],['/privacy/',[privacy(),'Конфиденциальность | Русский лес',description]]]);
for(const p of products)routes.set(productPath(p),[productPage(p),p.name+' | Русский лес',p.description]);
// Historical URLs are aliases of Russian Forest pages, never another brand.
for(const [oldSlug,slug] of Object.entries(legacySlugs)){const p=products.find(p=>p.slug===slug);for(const prefix of ['/en/dispensa/','/dispensa/'])routes.set(prefix+oldSlug+'/',[productPage(p),p.name+' | Русский лес',p.description]);}
for(const [slug,name,legacy] of [['production','Производство','produzione'],['about','О нас','chi-siamo'],['wholesale','Оптовым покупателям','experience'],['contacts','Контакты','contatti']]){const page=[infoPage(name),name+' | Русский лес',description];routes.set('/'+slug+'/',page);routes.set('/en/'+legacy+'/',page);}
for(const [route,[body,title,desc]] of routes){const dest=resolve(output,'.'+route,'index.html');await mkdir(dirname(dest),{recursive:true});await writeFile(dest,document(body,title,desc));}
await writeFile(resolve(output,'404.html'),document(notFound(),'Страница не найдена | Русский лес',description));
await writeFile(resolve(output,'robots.txt'),'User-agent: *\nAllow: /\n');
await mkdir(mirror,{recursive:true});await cp(output,mirror,{recursive:true});
console.log('Built '+routes.size+' Russian Forest routes and 404 in dist/ and .output/public/.');
