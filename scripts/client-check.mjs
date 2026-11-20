import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {products,productPath} from '../src/data.mjs';

function listen(handlers,type,fn){const previous=handlers.get(type);handlers.set(type,previous?e=>{previous(e);fn(e);}:fn);}
function element(extra={}) {
  const handlers=new Map(), attrs=new Map(), classes=new Set();
  return {handlers, attrs, style:{}, dataset:{}, classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle(x,on){on?classes.add(x):classes.delete(x);}},
    addEventListener:(type,fn)=>listen(handlers,type,fn),
    setAttribute:(name,value)=>attrs.set(name,value),
    getAttribute:name=>attrs.get(name),removeAttribute:name=>attrs.delete(name),getClientRects:()=>[{}],closest:()=>null,
    focus(){document.activeElement=this;}, ...extra};
}
const toggle=element(), menuLink=element(), firstLink=element(), header=element();
const homeItem=element(), pantryItem=element();
firstLink.attrs.set('href','/');firstLink.closest=()=>homeItem;
menuLink.attrs.set('href','/catalog/banki');menuLink.closest=()=>pantryItem;
const hiddenLegalLink=element({getClientRects:()=>[]});hiddenLegalLink.attrs.set('href','/en/privacy');
const menu=element({hidden:true,querySelector:()=>firstLink,querySelectorAll:()=>[firstLink,menuLink,hiddenLegalLink]});
let shownMain,shownFooter;
const main=element({inert:false,replaceWith(next){shownMain=next;}}),footer=element({inert:false,replaceWith(next){shownFooter=next;}});
shownMain=main;shownFooter=footer;
header.querySelectorAll=()=>[firstLink,toggle];
const jars=Array.from({length:10},(_,i)=>element({left:i*430+'px',offsetLeft:i*430,offsetWidth:200,dataset:{name:'Product '+i}}));
jars.forEach(jar=>{jar.closest=()=>jar;jar.matches=()=>true;});
const hero={scrollLeft:2000};
const stage=element({querySelectorAll:()=>jars,closest:selector=>selector==='main'?main:hero,clientWidth:1440,clientHeight:900,setPointerCapture(id){this.captured=id;},hasPointerCapture(id){return this.captured===id;},releasePointerCapture(){this.captured=null;}});
const panel=element({clientWidth:400,getBoundingClientRect:()=>({width:400})});
const gallery=element({scrollLeft:0,querySelector:()=>panel,querySelectorAll:()=>[],scrollBy(value){this.lastScroll=value;}});
const handlers=new Map();
const description=element({content:'Home description'}),navigation={paths:[],assigned:[],transitions:0,fail:false};
const productTitle=element(),nextFooter=element({replaceWith(next){shownFooter=next;}});
const nextMain=element({querySelector:()=>productTitle,querySelectorAll:()=>[],replaceWith(next){shownMain=next;}});
const parsedPage={title:'Product title',querySelector:selector=>({'.product-page':nextMain,'.site-footer':nextFooter,'meta[name="description"]':{content:'Product description'}})[selector]};
const document={body:element(),documentElement:element(),title:'Home title',activeElement:toggle,
  startViewTransition(update){navigation.transitions++;update();return{finished:Promise.resolve()};},
  querySelector:selector=>({'.menu-toggle':toggle,'#site-menu':menu,'main':shownMain,'footer':shownFooter,'.product-page':shownMain===nextMain?nextMain:null,'meta[name="description"]':description,'.site-header':header,'.jar-stage':stage})[selector],
  querySelectorAll:selector=>selector==='.photo-slider'?[gallery]:selector==='main, footer'?[shownMain,shownFooter]:[],
  addEventListener:(type,fn)=>listen(handlers,type,fn)};
const globalHandlers=new Map(),frames=[],timers=new Map();let clock=0,timerId=0;
function flushTimers(){const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn());}
const reduced={matches:false};
function flushFrames(){let count=0;while(frames.length){assert(count++<200,'Motion must settle');clock+=16.67;frames.shift()(clock);}}
const context={document,location:{pathname:'/catalog/banki/brusnika/',assign:path=>navigation.assigned.push(path)},window:{scrollTo:()=>{}},innerWidth:1440,requestAnimationFrame:fn=>{frames.push(fn);return frames.length;},
  addEventListener:(type,fn)=>listen(globalHandlers,type,fn),matchMedia:()=>reduced,
  history:{pushState(state,unused,path){navigation.paths.push(path);context.location.pathname=path;}},
  fetch:async()=>{if(navigation.fail)throw new Error('Network unavailable');return{ok:true,text:async()=>'<main></main>'};},
  DOMParser:class{parseFromString(){return parsedPage;}},
  setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id),cancelAnimationFrame:()=>{frames.length=0;},
  getComputedStyle:el=>({left:el.left,getPropertyValue:()=> '24px'})};
const clientSource=await readFile(new URL('../public/site.js',import.meta.url),'utf8');
const client=vm.runInNewContext(clientSource+'\n;({openProduct,updateMenu,placeCarousel(value){offset=targetOffset=value;carouselLayout();}});',context);
flushFrames();
assert.equal(firstLink.attrs.has('aria-current'),false);
assert.equal(homeItem.classList.contains('is-active'),false);
assert.equal(menuLink.attrs.get('aria-current'),'location');
assert.equal(pantryItem.classList.contains('is-active'),true);
for(const [pathname,activeLink,current] of [['/dispensa/',menuLink,'page'],['/en/',firstLink,'page'],['/en/dispensa/',menuLink,'page'],['/en/dispensa/smeraldo/',menuLink,'location'],['/dispensa/marmellata_arancia/',menuLink,'location']]){
 context.location.pathname=pathname;client.updateMenu();
 assert.equal(activeLink.attrs.get('aria-current'),current,'Historical URL highlights its menu section: '+pathname);
 assert.equal((activeLink===firstLink?menuLink:firstLink).attrs.has('aria-current'),false);
}
context.location.pathname='/catalog/banki/brusnika/';client.updateMenu();
toggle.handlers.get('click')();
assert.equal(document.activeElement,firstLink);
assert.equal(footer.inert,true);
assert.equal(menu.hidden,false);
assert.equal(toggle.attrs.get('aria-expanded'),'true');
assert.equal(toggle.attrs.get('aria-label'),'Закрыть меню');
assert.equal(main.inert,true);
document.activeElement=menuLink;
let prevented=false;
handlers.get('keydown')({key:'Tab',shiftKey:false,preventDefault(){prevented=true;}});
assert(prevented);
assert.equal(document.activeElement,firstLink);
handlers.get('keydown')({key:'Tab',shiftKey:true,preventDefault(){}});
assert.equal(document.activeElement,menuLink);
handlers.get('keydown')({key:'Escape'});
assert.equal(menu.hidden,true);
assert.equal(main.inert,false);
assert.equal(footer.inert,false);
assert.equal(toggle.attrs.get('aria-expanded'),'false');
assert.equal(toggle.attrs.get('aria-label'),'Меню');
assert.equal(document.activeElement,toggle);
assert.equal(gallery.scrollLeft,424);
gallery.handlers.get('keydown')({key:'ArrowRight',preventDefault(){}});
assert.equal(gallery.lastScroll.left,424);
gallery.handlers.get('keydown')({key:'ArrowLeft',preventDefault(){}});
assert.equal(gallery.lastScroll.left,-424);
function position(jar){return jar.style.transform.match(/translate3d\(([-.\d]+)px,([-.\d]+)px/).slice(1).map(Number);}
assert.equal(jars.filter(jar=>Number(jar.style.opacity)>0).length,3,'Desktop shows one selected jar and two neighbours');
assert.equal(jars.filter(jar=>jar.style.pointerEvents==='auto').length,3,'Only those three jars accept clicks');
assert(jars.filter(jar=>jar.style.pointerEvents==='none').every(jar=>Number(jar.style.opacity)===0),'Extra jars stay transparent');
const desktopGeometry=jars.map(jar=>[jar.style.width,jar.style.transform,jar.style.opacity]);
// Crossing the old edge threshold must keep the entering jar on the same path.
client.placeCarousel(1.499);
const edgeBefore=[...position(jars[2]),parseFloat(jars[2].style.width)];
client.placeCarousel(1.501);
[...position(jars[2]),parseFloat(jars[2].style.width)].forEach((value,i)=>assert(Math.abs(value-edgeBefore[i])<2,'Entering jars move and resize continuously'));
assert(Number(jars[2].style.opacity)>0&&Number(jars[2].style.opacity)<1,'Entering jars fade gradually');
client.placeCarousel(0);
assert.equal(jars[2].attrs.get('aria-current'),'true');
assert.equal(jars.filter(jar=>jar.tabIndex===0).length,1,'One selected jar is in the tab order');
assert(parseFloat(jars[2].style.width)>300,'The centre jar is enlarged');
assert(Math.abs(position(jars[2])[0]+parseFloat(jars[2].style.width)/2-stage.clientWidth/2)<.01,'Selected jar is centered on the stage');
// A tiny move through the centre must not jump between the side and centre angles.
function angle(jar){return Number(jar.style.transform.match(/rotate\(([-.\d]+)deg\)/)[1]);}
for(const width of [1440,768,390]){
 const selectionBeforeResize=jars.find(jar=>jar.attrs.has('aria-current'));
 stage.clientWidth=width;globalHandlers.get('resize')();
 assert.equal(jars.find(jar=>jar.attrs.has('aria-current')),selectionBeforeResize,'Resizing keeps the selected flavour');
 for(const deltaY of [.18,-.18]){
  stage.handlers.get('focusin')({target:jars[2]});
  const restingAngle=angle(jars[2]);
  globalHandlers.get('wheel')({deltaY,deltaX:0,preventDefault(){}});
  flushFrames();
  assert(Math.abs(angle(jars[2])-restingAngle)<.1,'Rotation stays continuous on either side of the centre at every breakpoint');
  flushTimers();flushFrames();
 }
}
stage.clientWidth=1440;globalHandlers.get('resize')();
stage.handlers.get('focusin')({target:jars[2]});
const before=jars[2].style.transform,beforeWidth=parseFloat(jars[2].style.width);
globalHandlers.get('wheel')({deltaY:100,deltaX:0,preventDefault(){}});
assert.equal(jars[2].style.transform,before,'Wheel movement must ease into its destination');
flushFrames();
assert.notEqual(jars[2].style.transform,before);
assert.notEqual(parseFloat(jars[2].style.width),beforeWidth,'Depth must change with position');
const afterWheel=position(jars[2]);
stage.handlers.get('pointerdown')({clientX:100,clientY:100,button:0,isPrimary:true,pointerId:1});
stage.handlers.get('pointermove')({clientX:120,clientY:100,pointerId:1});
assert.equal(stage.captured,1);
assert.equal(stage.classList.contains('is-dragging'),true);
assert(position(jars[2])[0]>afterWheel[0]);
let draggedClick=false;
stage.handlers.get('click')({detail:1,preventDefault(){draggedClick=true;}});
assert(draggedClick);
flushTimers();
handlers.get('pointercancel')({pointerId:1});
assert.equal(stage.classList.contains('is-dragging'),false);
assert.equal(stage.captured,null);
const cancelled=jars[2].style.transform;
stage.handlers.get('pointermove')({clientX:500,clientY:100,pointerId:1});
assert.equal(jars[2].style.transform,cancelled);
stage.handlers.get('pointerdown')({clientX:0,clientY:0,button:2,isPrimary:true,pointerId:2});
stage.handlers.get('pointermove')({clientX:500,clientY:0,pointerId:2});
assert.equal(jars[2].style.transform,cancelled);
globalHandlers.get('wheel')({ctrlKey:true,preventDefault(){assert.fail('Browser zoom must not be blocked');}});
stage.handlers.get('dragstart')({preventDefault(){draggedClick=true;}});
// Vertical swipes drive the same carousel instead of being cancelled by native panning.
stage.handlers.get('pointerdown')({clientX:100,clientY:100,button:0,isPrimary:true,pointerId:3});
stage.handlers.get('pointermove')({clientX:101,clientY:50,pointerId:3});
assert.notEqual(jars[2].style.transform,cancelled);
handlers.get('pointerup')({pointerId:3});
stage.handlers.get('click')({detail:1,preventDefault(){}});
assert.equal(stage.captured,null);
stage.handlers.get('focusin')({target:jars[0]});
stage.handlers.get('keydown')({key:'ArrowLeft',target:jars[0],preventDefault(){}});
flushFrames();
assert.equal(document.activeElement,jars.at(-1));
stage.handlers.get('keydown')({key:'ArrowRight',target:jars.at(-1),preventDefault(){}});
flushFrames();
assert.equal(document.activeElement,jars[0]);
stage.handlers.get('focusin')({target:jars.at(-1)});
assert.equal(hero.scrollLeft,0);
let focusedLeft=position(jars.at(-1))[0];
assert(focusedLeft>=16&&focusedLeft+parseFloat(jars.at(-1).style.width)<=stage.clientWidth-16);
// Short desktop, landscape, tablet and phone screens retain the foreground jar in view.
for(const [width,height] of [[1535,739],[1440,600],[768,900],[844,390],[390,600]]){
 stage.clientWidth=width;stage.clientHeight=height;globalHandlers.get('resize')();
 stage.handlers.get('focusin')({target:jars[2]});
 const [x,y]=position(jars[2]),size=parseFloat(jars[2].style.width);
 assert(x>=0&&x+size<=width,'Focused jar fits screen width');
 assert(Math.abs(x+size/2-width/2)<.01,'The selected jar is exactly centered at every viewport width');
 assert(y>=0&&y+size*1.61<height,'Focused jar fits screen height');
}
reduced.matches=true;
const staticPosition=jars[2].style.transform;
globalHandlers.get('wheel')({deltaY:100,deltaX:0,deltaMode:1,preventDefault(){}});
assert.notEqual(jars[2].style.transform,staticPosition,'Reduced motion keeps scrolling usable without easing');
flushTimers();
flushFrames();
assert.equal(frames.length,0);
const beforeKey=jars[2].style.transform;
handlers.get('keydown')({key:'PageDown',preventDefault(){}});
assert.notEqual(jars[2].style.transform,beforeKey);
flushTimers();flushFrames();
assert.equal(jars.filter(jar=>jar.style.pointerEvents==='auto').length,3,'Wheel and swipe gestures snap back to three visible jars');
const selectedJar=jars.find(jar=>jar.attrs.has('aria-current'));
assert(Math.abs(position(selectedJar)[0]+parseFloat(selectedJar.style.width)/2-stage.clientWidth/2)<.01,'The snapped selection is centred');
const cycle=jars.map(jar=>[...position(jar),parseFloat(jar.style.width)]);
for(let i=0;i<jars.length;i++)handlers.get('keydown')({key:'PageDown',preventDefault(){}});
jars.forEach((jar,i)=>[...position(jar),parseFloat(jar.style.width)].forEach((value,j)=>assert(Math.abs(value-cycle[i][j])<.001,'A full carousel loop returns to the same position')));
menu.hidden=false;
globalHandlers.get('wheel')({preventDefault(){assert.fail('Menu scrolling must remain native');}});
// Clicking a neighbour selects it without navigating. A modified click keeps native link behaviour.
menu.hidden=true;
const neighbour=jars[(jars.indexOf(selectedJar)+1)%jars.length];
let selectedClick=false;
stage.handlers.get('click')({target:neighbour,detail:1,button:0,preventDefault(){selectedClick=true;}});
assert(selectedClick);flushFrames();
assert.equal(neighbour.attrs.get('aria-current'),'true');
let modifiedPrevented=false;
stage.handlers.get('click')({target:neighbour,detail:1,button:0,ctrlKey:true,preventDefault(){modifiedPrevented=true;}});
assert.equal(modifiedPrevented,false);
// Product navigation replaces the content, updates history and keeps Back/Forward functional.
reduced.matches=false;
await client.openProduct('/catalog/banki/chernika/');
assert.equal(shownMain,nextMain);assert.equal(shownFooter,nextFooter);
assert.equal(navigation.assigned.length,0,'Animated product opening must not reload the document');
assert.equal(navigation.transitions,1);
assert.equal(document.body.classList.contains('home-page'),false);
assert.equal(header.classList.contains('compact'),true);
assert.equal(document.title,'Product title');
assert.equal(document.activeElement,productTitle);
assert.equal(navigation.paths.at(-1),'/catalog/banki/chernika/');
toggle.handlers.get('click')();assert.equal(nextMain.inert,true,'Menu protects the newly inserted page');
handlers.get('keydown')({key:'Escape'});assert.equal(nextMain.inert,false);
toggle.handlers.get('click')();assert.equal(nextMain.inert,true);
context.location.pathname='/catalog/banki/brusnika/';
await globalHandlers.get('popstate')();
assert.equal(menu.hidden,true,'Back closes the menu before restoring the homepage');
assert.equal(main.inert,false,'The restored homepage remains interactive');
assert.equal(toggle.attrs.get('aria-expanded'),'false');
assert.equal(document.body.style.overflow,'');
assert.equal(shownMain,main);assert.equal(shownFooter,footer);
assert.equal(document.body.classList.contains('home-page'),true);
assert.equal(header.classList.contains('compact'),false);
assert.equal(document.title,'Home title');
const historyEntries=navigation.paths.length;
toggle.handlers.get('click')();assert.equal(main.inert,true);
context.location.pathname='/catalog/banki/chernika/';
await globalHandlers.get('popstate')();
assert.equal(shownMain,nextMain);assert.equal(navigation.paths.length,historyEntries,'Forward navigation must not add history entries');
assert.equal(menu.hidden,true,'Forward closes the menu before inserting the product');
assert.equal(nextMain.inert,false,'The restored product remains interactive');
context.location.pathname='/catalog/banki/brusnika/';
await globalHandlers.get('popstate')();
// Reduced-motion and browsers without View Transitions still open the same full content.
reduced.matches=true;const transitions=navigation.transitions;
await client.openProduct('/catalog/banki/chernika/');
assert.equal(navigation.transitions,transitions);
context.location.pathname='/catalog/banki/brusnika/';await globalHandlers.get('popstate')();
reduced.matches=false;document.startViewTransition=undefined;
const fallbackAnimations=[];
main.animate=nextMain.animate=(keyframes,options)=>{
 const effect={finished:Promise.resolve(),cancelled:false,cancel(){this.cancelled=true;}};
 fallbackAnimations.push({effect,options});return effect;
};
await client.openProduct('/catalog/banki/chernika/');
assert.equal(shownMain,nextMain);assert.equal(navigation.assigned.length,0);
context.location.pathname='/catalog/banki/brusnika/';await globalHandlers.get('popstate')();
assert(fallbackAnimations.filter(a=>a.options.fill==='forwards').every(a=>a.effect.cancelled),'Back must not restore a home page still hidden by its exit animation');
navigation.fail=true;
await client.openProduct('/catalog/banki/chernika/');
assert.equal(navigation.assigned.at(-1),'/catalog/banki/chernika/','Failed prefetch falls back to a working ordinary link');
console.log('Checked animated product opening, history, Back/Forward, reduced-motion and navigation fallbacks; three jars at every width, continuous edge entry, foreground selection, larger centre jar, click selection, snapping, menu focus, gallery keys, eased carousel depth, both swipe axes, pointer cancellation, keyboard scrolling, five viewport sizes and reduced motion.');

// Catalogue filters retain only the chosen range and reset without losing product links.
const filterButtons=['','Джем премиум','Классическое варенье'].map(category=>element({dataset:{category}}));
const filterCards=products.map(p=>element({dataset:{category:p.category},hidden:false}));
const filterCount={textContent:'Показано: 10 из 10'};
const filterGroup={hidden:true,querySelectorAll:()=>filterButtons};
const filterDocument={
 querySelector:selector=>selector==='.pantry-filters'?filterGroup:filterCount,
 querySelectorAll:()=>filterCards
};
vm.runInNewContext(clientSource.slice(clientSource.indexOf('const pantryFilters='),clientSource.indexOf('const stage=')),{document:filterDocument});
assert.equal(filterGroup.hidden,false,'Filters appear only after their handlers are ready');
for(const [index,expected] of [[1,9],[2,1],[2,1],[0,10]]){
 filterButtons[index].handlers.get('click')();
 assert.equal(filterCards.filter(card=>!card.hidden).length,expected);
 assert.equal(filterCount.textContent,'Показано: '+expected+' из 10');
 assert.equal(filterButtons.filter(button=>button.attrs.get('aria-pressed')==='true').length,1);
 assert.equal(filterButtons[index].attrs.get('aria-pressed'),'true');
 if(index===2)assert.equal(filterCards[products.findIndex(p=>p.slug==='sosnovaya-shishka')].hidden,false,'The classic range shows the pine-cone preserve');
 if(index===1)assert.equal(filterCards[products.findIndex(p=>p.slug==='sosnovaya-shishka')].hidden,true,'The berry range excludes the pine-cone preserve');
}
console.log('Checked catalogue filters: nine berry jams, one pine-cone preserve, repeated selection, exclusive pressed state, result counts and all-ten reset.');

// Exercise the real cylindrical-label renderer with bounded frames and image/canvas doubles.
const labelFrames=[],draws=[],labelJars=Array.from({length:10},()=>({})),canvases=labelJars.map((jar,index)=>({
 dataset:{label:'label-'+index},closest:()=>jar,getContext:()=>({
  clearRect(){},fillRect(){},createLinearGradient:()=>({addColorStop(){}}),
  drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh){
   assert(sx>=0&&sx+sw<=image.naturalWidth+.001,'Wrapped texture samples stay inside the source');
   assert(dx>=58&&dx<938&&dy>=430&&dy<=450,'Only the cylindrical label is repainted');
   draws.push({index,sx});
  }
 })
}));
let labelHome=true,labelChange;
const labelReduced={matches:false,addEventListener(type,fn){labelChange=fn;}};
const labelDocument={hidden:false,querySelectorAll:()=>canvases},labelMenu={hidden:true};
const labelContext={isEnglish:true,
 document:labelDocument,jars:labelJars,positions:labelJars.map((_,i)=>({visible:i>=1&&i<=3})),
 reducedMotion:labelReduced,menu:labelMenu,carouselTablet:false,offset:1,targetOffset:1,frame:null,
 clamp:(v,min,max)=>Math.min(max,Math.max(min,v)),wrap:(v,n)=>((v%n)+n)%n,
 homeIsActive:()=>labelHome,carouselLayout(){},requestAnimationFrame:fn=>{labelFrames.push(fn);return labelFrames.length;},
 cancelAnimationFrame:()=>{labelFrames.length=0;},
 Image:class{naturalWidth=2048;naturalHeight=512;set src(value){this.onload();}}
};
const labelSource=clientSource.slice(clientSource.indexOf('const labelRenderers=[];'),clientSource.indexOf('function revealProduct('));
const labelClient=vm.runInNewContext(labelSource+'\n;({initLabels,labelMotion});',labelContext);
await labelClient.initLabels({querySelectorAll:()=>[]});
await Promise.resolve();
assert.equal(labelFrames.length,1);
const initialDraws=draws.length,initialSource=draws.find(d=>d.index===2).sx;
labelFrames.shift()(34);
const animatedDraws=draws.slice(initialDraws);
assert.deepEqual([...new Set(animatedDraws.map(d=>d.index))],[1,2,3],'Only the three visible labels animate');
assert.notEqual(animatedDraws.find(d=>d.index===2).sx,initialSource,'Rotation changes the texture sampled on the jar');
const previousFrameCount=draws.length;
labelFrames.shift()(50.67);
assert(draws.length>previousFrameCount,'Rotating labels update on consecutive display frames without a 30 fps step');
const movingCount=draws.length;
labelMenu.hidden=false;labelFrames.shift()(68);assert.equal(draws.length,movingCount,'Menu pauses label drawing');
labelMenu.hidden=true;labelDocument.hidden=true;labelFrames.shift()(102);assert.equal(draws.length,movingCount,'Hidden tabs pause label drawing');
labelHome=false;labelFrames.shift()(136);assert.equal(labelFrames.length,0,'Leaving the carousel stops its render loop');
labelReduced.matches=true;labelChange();assert.equal(labelFrames.length,0,'Reduced motion keeps the label still');
console.log('Checked cylindrical label rotation, bounded texture coordinates, visible-label rendering, menu/hidden-tab pause and render-loop cleanup.');

// Loading completes after all images settle, and a stalled image cannot obscure the page.
const loaderSource=clientSource.slice(clientSource.indexOf('function initHomeLoader('),clientSource.indexOf('function signedSlot('));
let loaderFallback,completeCalls=0;
const loaderMark={textContent:'0%'},loaderContext={labelsReady:Promise.resolve(),document:{querySelector:()=>({firstElementChild:loaderMark,classList:{add(){completeCalls++;}}})},stage:{querySelectorAll:()=>[{decode:()=>Promise.resolve()},{decode:()=>Promise.reject(new Error('image failed'))}]},setTimeout:fn=>{loaderFallback=fn;return 1;},clearTimeout(){}};
await vm.runInNewContext(loaderSource+'initHomeLoader();',loaderContext);
assert.equal(loaderMark.textContent,'100%');assert.equal(completeCalls,1);
let finishImage;
loaderContext.stage.querySelectorAll=()=>[{decode:()=>new Promise(resolve=>{finishImage=resolve;})}];
const stalledLoader=vm.runInNewContext(loaderSource+'initHomeLoader();',loaderContext);
loaderFallback();assert.equal(loaderMark.textContent,'100%');assert.equal(completeCalls,2);
finishImage();await stalledLoader;assert.equal(completeCalls,2,'A late image must not restart the loader exit');
let finishLabel;
loaderContext.labelsReady=new Promise(resolve=>{finishLabel=resolve;});
loaderContext.stage.querySelectorAll=()=>[{decode:()=>Promise.resolve()}];
const pendingLabel=vm.runInNewContext(loaderSource+'initHomeLoader();',loaderContext);
await Promise.resolve();await Promise.resolve();
assert.equal(completeCalls,2,'Loading stays visible while a cylindrical label is pending');
finishLabel();await pendingLabel;assert.equal(completeCalls,3);
console.log('Checked loader completion, label readiness, failed-image recovery and stalled-image timeout.');

// Russian Forest keeps its carousel composition and selected flavour across screen sizes.
{
 const forestToggle=element(),forestHeader=element({querySelectorAll:()=>[]});
 const forestFirst=element(),forestHomeItem=element();forestFirst.attrs.set('href','/');forestFirst.closest=()=>forestHomeItem;
 const forestMenu=element({hidden:true,querySelector:()=>forestFirst,querySelectorAll:()=>[forestFirst]});
 const forestMain=element(),forestFooter=element(),forestBody=element();
 const forestJars=products.map(p=>element({dataset:{name:p.name}}));
 forestJars.forEach((jar,i)=>{jar.attrs.set('href',productPath(products[i]));jar.closest=()=>jar;});
 const forestStage=element({clientWidth:1440,clientHeight:900,querySelectorAll:()=>forestJars,closest:()=>forestMain});
 const forestEvents=new Map(),forestDocumentEvents=new Map();
 const forestDocument={body:forestBody,documentElement:element({lang:'ru'}),title:'Русский лес',
  querySelector:selector=>({'.menu-toggle':forestToggle,'#site-menu':forestMenu,'.site-header':forestHeader,'.jar-stage':forestStage,'footer':forestFooter})[selector],
  querySelectorAll:selector=>selector==='main, footer'?[forestMain,forestFooter]:[],
  addEventListener:(type,fn)=>listen(forestDocumentEvents,type,fn)};
 const forestContext={...context,document:forestDocument,location:{pathname:'/'},matchMedia:()=>({matches:false}),
  addEventListener:(type,fn)=>listen(forestEvents,type,fn)};
 const forestClient=vm.runInNewContext(clientSource+'\n;({selectJar,get selectedIndex(){return selectedIndex;}});',forestContext);
 assert.equal(forestClient.selectedIndex,2,'Desktop foreground is Черника');
 assert.deepEqual(forestJars.map(jar=>[jar.style.width,jar.style.transform,jar.style.opacity]),desktopGeometry,'Russian Forest keeps its existing carousel geometry');
 assert.equal(forestHomeItem.classList.contains('is-active'),true);
 forestStage.clientWidth=390;forestEvents.get('resize')();
 assert.equal(forestClient.selectedIndex,1,'Phone foreground is Облепиха');
 forestStage.clientWidth=768;forestEvents.get('resize')();
 assert.equal(forestClient.selectedIndex,1,'Tablet foreground remains Облепиха');
 forestStage.clientWidth=1440;forestEvents.get('resize')();
 assert.equal(forestClient.selectedIndex,2,'Returning to desktop restores its composition');
 forestClient.selectJar(4,true);
 for(const width of [390,768,1440]){
  forestStage.clientWidth=width;forestEvents.get('resize')();
  assert.equal(forestClient.selectedIndex,4,'Russian Forest preserves an explicitly selected flavour across breakpoints');
  const foreground=forestJars[forestClient.selectedIndex];
  assert(Math.abs(position(foreground)[0]+parseFloat(foreground.style.width)/2-width/2)<.001,'Russian Forest foreground stays centred at '+width+' pixels');
 }
 forestToggle.handlers.get('click')();assert.equal(forestMenu.hidden,false);
 assert.equal(forestToggle.attrs.get('aria-label'),'Закрыть меню');assert.equal(forestMain.inert,true);
 forestDocumentEvents.get('keydown')({key:'Escape'});
 assert.equal(forestMenu.hidden,true);assert.equal(forestToggle.attrs.get('aria-label'),'Меню');assert.equal(forestMain.inert,false);
 console.log('Checked Russian Forest menu opening/closing, responsive initial composition and selected flavour persistence at 1440, 768 and 390 pixels.');
}

// Captured English pages keep English controls and highlight their own navigation.
{
 const englishToggle=element(),englishHeader=element({querySelectorAll:()=>[]});
 const englishHome=element(),englishPantry=element(),englishMain=element(),englishFooter=element();
 englishHome.attrs.set('href','/en/');englishPantry.attrs.set('href','/en/dispensa/');
 const englishMenu=element({hidden:true,querySelector:()=>englishHome,querySelectorAll:()=>[englishHome,englishPantry]});
 const englishHandlers=new Map();
 const englishDocument={documentElement:{lang:'en'},body:element(),querySelector:selector=>({'.menu-toggle':englishToggle,'#site-menu':englishMenu,'.site-header':englishHeader})[selector],querySelectorAll:()=>[englishMain,englishFooter],addEventListener:(type,fn)=>listen(englishHandlers,type,fn)};
 vm.runInNewContext(clientSource.slice(0,clientSource.indexOf('const pantryFilters=')),{document:englishDocument,location:{pathname:'/en/dispensa/smeraldo/'}});
 assert.equal(englishPantry.attrs.get('aria-current'),'location');
 assert.equal(englishHome.attrs.has('aria-current'),false);
 englishToggle.handlers.get('click')();
 assert.equal(englishMenu.hidden,false);assert.equal(englishToggle.attrs.get('aria-label'),'close');assert.equal(englishMain.inert,true);
 englishHandlers.get('keydown')({key:'Escape'});
 assert.equal(englishMenu.hidden,true);assert.equal(englishToggle.attrs.get('aria-label'),'menu');assert.equal(englishMain.inert,false);
 console.log('Checked English menu labels, opening/closing and product-section navigation.');
}
