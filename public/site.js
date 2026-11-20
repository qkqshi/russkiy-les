const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#site-menu');
const header = document.querySelector('.site-header');
const isEnglish = document.documentElement.lang === 'en';
function setBackgroundInert(value){document.querySelectorAll('main, footer').forEach(el=>el.inert=value);}
function closeMenu(){
 menu.hidden=true;document.body.classList.remove('menu-open');document.body.style.overflow='';
 toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label',isEnglish?'menu':'Меню');header.classList.remove('is-nav-open');setBackgroundInert(false);toggle.focus();
}
toggle?.addEventListener('click',()=>{
 if(!menu.hidden)return closeMenu();
 menu.hidden=false;document.body.classList.add('menu-open');document.body.style.overflow='hidden';
 toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label',isEnglish?'close':'Закрыть меню');header.classList.add('is-nav-open');setBackgroundInert(true);menu.querySelector('a')?.focus();
});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&!menu.hidden)closeMenu();
 if(e.key==='Tab'&&!menu.hidden){
  const focusable=[...header.querySelectorAll('a,button'),...menu.querySelectorAll('a')].filter(el=>el.getClientRects().length);
  const first=focusable[0],last=focusable.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
});
function updateMenu(){
 const rawPath=location.pathname.replace(/\/+$/,'')||'/';
 const aliases={'/en':'/','/en/dispensa':'/catalog/banki','/dispensa':'/catalog/banki','/en/privacy':'/privacy','/en/produzione':'/production','/en/experience':'/wholesale','/en/chi-siamo':'/about','/en/contatti':'/contacts'};
 const path=isEnglish?(rawPath==='/'?'/en':rawPath):(aliases[rawPath]||rawPath.replace(/^\/(?:en\/)?dispensa\//,'/catalog/banki/'));
 menu?.querySelectorAll('a').forEach(link=>{
  const href=link.getAttribute('href').replace(/\/+$/,'')||'/';
  const current=href===path,section=(href===(isEnglish?'/en/dispensa':'/catalog/banki'))&&path.startsWith(href+'/');
  link.closest('.fp-nav__item, .fp-nav__secondary-item')?.classList.toggle('is-active',current||section);
  link.removeAttribute('aria-current');if(current||section)link.setAttribute('aria-current',current?'page':'location');
 });
}
updateMenu();
const pantryFilters=document.querySelector('.pantry-filters');
if(pantryFilters){
 const buttons=[...pantryFilters.querySelectorAll('button')];
 const cards=[...document.querySelectorAll('.pantry-grid .product-slide')];
 const count=document.querySelector('.pantry-count');
 buttons.forEach(button=>button.addEventListener('click',()=>{
  const category=button.dataset.category;
  buttons.forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  cards.forEach(card=>card.hidden=!!category&&card.dataset.category!==category);
  count.textContent='Показано: '+cards.filter(card=>!card.hidden).length+' из '+cards.length;
 }));
 pantryFilters.hidden=false;
}
const stage=document.querySelector('.jar-stage');
const jars=[...stage?.querySelectorAll('.home-jar')||[]];
const circle=document.querySelector('.home-shape .circle');
const announcement=document.querySelector('.jar-announcement');
const reducedMotion=matchMedia('(prefers-reduced-motion:reduce)');
const wrap=(value,length)=>((value%length)+length)%length;
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
let offset=0,targetOffset=0,frame=null,lastTime=null,snapTimer=null,selectedIndex=-1;
let startX=null,startY=null,pointerId=null,dragAxis=null,dragged=false,dragStartOffset=0;
let positions=[],opening=false,keyboardSelecting=false,carouselInteracted=false,carouselTablet=stage?.clientWidth<=1024;
let labelsReady=Promise.resolve();
const homeIsActive=()=>!!stage&&document.body.classList.contains('home-page');
function initHomeLoader(){
 const loader=document.querySelector('.home-loader');if(!loader)return;
 const images=[...stage.querySelectorAll('img')];let loaded=0,finished=false;
 function done(){if(finished)return;finished=true;clearTimeout(timeout);loader.firstElementChild.textContent='100%';loader.classList.add('is-complete');}
 const timeout=setTimeout(done,2500);
 return Promise.all(images.map(image=>(image.decode?.()||Promise.resolve()).catch(()=>{}).then(()=>{
  if(!finished)loader.firstElementChild.textContent=Math.round(++loaded/images.length*100)+'%';
 }))).then(()=>labelsReady).then(done);
}
function signedSlot(index,value=offset){return wrap(index+value-2+jars.length/2,jars.length)-jars.length/2;}
function carouselLayout(){
 if(!stage)return;
 const width=stage.clientWidth,height=stage.clientHeight,mobile=width<=480,tablet=width<=1024;
 const headroom=Math.min(height*.21,mobile?175:190),footroom=mobile?130:140;
 const size=Math.max(44,Math.min(width*(mobile?.38:tablet?.40:.21),(height-headroom-footroom)/1.61));
 const centreX=width*.5+(isEnglish?Math.min(mobile?12:80,width*.11):0);
 const centreY=height*(mobile?.465:tablet?.46:.565)+(isEnglish&&tablet?5:0);
 const spacing=width*(mobile?.49:tablet?.58:.305);
 const selected=wrap(2-Math.round(offset),jars.length);
 if(circle)circle.style.rotate=(reducedMotion.matches?0:(offset-(carouselTablet?1:0))*12)+'deg';
 positions=jars.map((jar,index)=>{
  const slot=signedSlot(index),distance=Math.abs(slot),depth=Math.min(distance,1);
  const desktop=!tablet;
  const jarWidth=size*(1-(mobile?(slot<0?.42:.54):tablet?(slot<0?.38:.50):slot<0?.17:.27)*depth)*Math.max(.55,1-Math.max(0,distance-1)*.3);
  const horizontalGap=mobile?width*(slot<0?(isEnglish?.47:.49):.45):desktop?width*(slot<0?(isEnglish&&slot<-1?.285:.319):.285):slot<0?width*.538:spacing;
  const x=centreX+slot*horizontalGap-jarWidth/2;
  const y=centreY+(mobile&&slot<0?(isEnglish?0:10)*depth:0)+(isEnglish&&tablet&&slot<0?-(mobile?3:20)*depth:0)+slot*height*(mobile?(slot<0?.055:(isEnglish?.012:.025)):tablet?.10:slot<0?(isEnglish&&slot<-1?.079:.064):.115)-jarWidth*1.61/2;
  const turn=depth*depth*(3-2*depth);
  const tilt=(tablet?24:-5)+(tablet?(slot<0?-15:-31):(slot<0?29:14))*turn-(isEnglish&&desktop&&slot<-1?Math.min(1,distance-1)*15:0);
  const visibleLimit=isEnglish&&desktop?2.6:1.65;
  const visible=distance<visibleLimit;
  jar.style.left='0px';jar.style.top='0px';jar.style.width=jarWidth+'px';
  jar.style.transform='translate3d('+x+'px,'+y+'px,0) rotate('+tilt+'deg)';
  jar.style.opacity=String(clamp((visibleLimit-distance)/.65,0,1));
  jar.style.visibility='visible';jar.style.pointerEvents=visible?'auto':'none';
  jar.style.filter='brightness('+((isEnglish?1:1.1)-(isEnglish?.13:.23)*depth)+') blur('+((isEnglish?distance:depth)*.88)+'px)';
  jar.style.zIndex=String(Math.round(100-distance*20));
  jar.classList.toggle('is-selected',index===selected);
  jar.tabIndex=index===selected?0:-1;
  if(index===selected)jar.setAttribute('aria-current','true');else jar.removeAttribute('aria-current');
  return {x,y,width:jarWidth,slot,visible};
 });
 if(selected!==selectedIndex){
  selectedIndex=selected;
 }
 if(stage)stage.classList.toggle('is-moving',Math.abs(targetOffset-offset)>.005);
}
function announceSelection(){
 if(announcement)announcement.textContent=jars[selectedIndex].dataset.name+', '+(selectedIndex+1)+(isEnglish?' of ':' из ')+jars.length+(isEnglish?'. Press Enter to discover this flavour.':'. Нажмите Enter, чтобы узнать вкус.');
}
function animateJars(now){
 frame=null;if(!homeIsActive()){lastTime=null;return;}
 const dt=Math.min(64,Math.max(0,now-(lastTime??now-16.67)));lastTime=now;
 offset+=(targetOffset-offset)*(1-Math.exp(-dt/180));
 if(Math.abs(targetOffset-offset)<.0001)offset=targetOffset;
 carouselLayout();
 if(offset!==targetOffset)frame=requestAnimationFrame(animateJars);
 else{lastTime=null;announceSelection();}
}
function shiftJars(delta,instant=false){
 if(!jars.length||opening)return;
 carouselInteracted=true;
 targetOffset+=delta;
 if(instant||reducedMotion.matches){offset=targetOffset;carouselLayout();}
 else if(frame===null)frame=requestAnimationFrame(animateJars);
}
function snapJars(){
 clearTimeout(snapTimer);snapTimer=null;
 shiftJars(Math.round(targetOffset)-targetOffset);announceSelection();
}
function selectJar(index,instant=false){
 clearTimeout(snapTimer);snapTimer=null;
 targetOffset=offset;shiftJars(-signedSlot(index),instant);
}
if(stage){
 document.body.classList.add('home-page');initHomeLoader();if(stage.clientWidth<=1024)offset=targetOffset=1;carouselLayout();
 addEventListener('resize',()=>{
  const tablet=stage.clientWidth<=1024;
  // Match a fresh load at each breakpoint until the visitor chooses a flavour.
  if(!carouselInteracted&&tablet!==carouselTablet){const shift=tablet?1:-1;offset+=shift;targetOffset+=shift;selectedIndex=-1;}
  carouselTablet=tablet;
  carouselLayout();
 });
 addEventListener('wheel',e=>{
  if(!homeIsActive()||opening||e.ctrlKey||!menu.hidden)return;
  e.preventDefault();
  const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;
  const unit=e.deltaMode===1?16:e.deltaMode===2?stage.clientHeight:1;
  shiftJars(-clamp(delta*unit,-240,240)/180);
  clearTimeout(snapTimer);snapTimer=setTimeout(snapJars,150);
 },{passive:false});
 document.addEventListener('keydown',e=>{
  if(!homeIsActive()||opening||!menu.hidden||e.altKey||e.ctrlKey||e.metaKey)return;
  if(e.target?.closest('button, input, textarea, select'))return;
  const direction={ArrowDown:-1,ArrowUp:1,PageDown:-1,PageUp:1,' ':e.shiftKey?1:-1}[e.key];
  if(direction){e.preventDefault();clearTimeout(snapTimer);shiftJars(Math.round(targetOffset)+direction-targetOffset);}
 });
}
stage?.addEventListener('dragstart',e=>e.preventDefault());
stage?.addEventListener('pointerdown',e=>{
 if(e.button!==0||!e.isPrimary||opening)return;
 clearTimeout(snapTimer);startX=e.clientX;startY=e.clientY;pointerId=e.pointerId;
 dragged=false;dragAxis=null;targetOffset=offset;dragStartOffset=offset;
});
stage?.addEventListener('pointermove',e=>{
 if(startX===null||e.pointerId!==pointerId)return;
 const dx=e.clientX-startX,dy=e.clientY-startY;
 if(!dragged&&Math.hypot(dx,dy)<=4)return;
 if(!dragged){dragged=true;dragAxis=Math.abs(dx)>=Math.abs(dy)?'x':'y';stage.setPointerCapture(pointerId);stage.classList.add('is-dragging');}
 shiftJars((dragAxis==='x'?dx:dy)/(stage.clientWidth<=480?180:360),true);
 startX=e.clientX;startY=e.clientY;
});
function finishDrag(cancelled=false){
 if(startX===null)return;
 const wasDragged=dragged,travel=offset-dragStartOffset,id=pointerId;
 startX=null;startY=null;pointerId=null;stage?.classList.remove('is-dragging');
 if(id!==null&&stage?.hasPointerCapture(id))stage.releasePointerCapture(id);
 if(wasDragged){
  const destination=cancelled?Math.round(offset):Math.abs(travel)>.12?Math.round(dragStartOffset)+Math.sign(travel):Math.round(offset);
  targetOffset=offset;shiftJars(destination-offset);
 }
 if(cancelled)dragged=false;
}
document.addEventListener('pointerup',e=>{if(e.pointerId===pointerId)finishDrag();});
document.addEventListener('pointercancel',e=>{if(e.pointerId===pointerId)finishDrag(true);});
stage?.addEventListener('lostpointercapture',()=>finishDrag(true));
stage?.addEventListener('click',e=>{
 if(dragged&&e.detail!==0){e.preventDefault();dragged=false;return;}dragged=false;
 if(e.button>0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
 const jar=e.target.closest('.home-jar');if(!jar)return;
 e.preventDefault();
 const index=jars.indexOf(jar);
 if(index!==selectedIndex||Math.abs(signedSlot(index))>.01){selectJar(index);return;}
 openProduct(jar.getAttribute('href'));
});
stage?.addEventListener('focusin',e=>{
 const jar=e.target.closest('.home-jar');if(!jar||keyboardSelecting||!jar.matches(':focus-visible'))return;
 stage.closest('.home-hero').scrollLeft=0;selectJar(jars.indexOf(jar),true);
});
stage?.addEventListener('keydown',e=>{
 if(!['ArrowLeft','ArrowRight'].includes(e.key)||e.altKey||e.ctrlKey||e.metaKey)return;
 const index=jars.indexOf(e.target.closest('.home-jar'));if(index<0)return;
 e.preventDefault();const next=wrap(index+(e.key==='ArrowRight'?1:-1),jars.length);
 // Move focus without allowing focusin to skip the visual transition.
 keyboardSelecting=true;selectJar(next);jars[next].focus({preventScroll:true});keyboardSelecting=false;
});

function initGalleries(root=document){
 root.querySelectorAll('.photo-slider').forEach(slider=>{
  if(slider.dataset.ready)return;slider.dataset.ready='true';
  function panPhotos(){
   const width=slider.clientWidth,gap=parseFloat(getComputedStyle(slider).getPropertyValue('--photo-gap'));
   slider.querySelectorAll('.photo-panel').forEach(panel=>{
    const image=panel.querySelector('img');if(!image)return;
    const relative=(panel.offsetLeft-slider.scrollLeft+panel.clientWidth/2-width/2)/(panel.clientWidth+gap);
    const galleryJar=panel.querySelector('.gallery-jar');
    if(galleryJar)galleryJar.style.setProperty('--gallery-shift',(-.42*clamp(relative,-1,1)*panel.clientWidth)+'px');
    else image.style.transform='translateX('+(-12.1212*(1+clamp(relative,-1,1)))+'%)';
   });
  }
  slider.addEventListener('scroll',panPhotos,{passive:true});
  function init(){
   const img=slider.querySelector('.photo-panel');
   slider.scrollLeft=img.getBoundingClientRect().width+parseFloat(getComputedStyle(slider).getPropertyValue('--photo-gap'));
   panPhotos();
  }
  requestAnimationFrame(init);
  addEventListener('resize',()=>{if(slider.isConnected)init();});
  slider.addEventListener('keydown',e=>{
   if(['ArrowLeft','ArrowRight'].includes(e.key)){
    e.preventDefault();slider.scrollBy({left:(e.key==='ArrowRight'?1:-1)*(slider.querySelector('.photo-panel').clientWidth+parseFloat(getComputedStyle(slider).getPropertyValue('--photo-gap'))),behavior:reducedMotion.matches?'instant':'smooth'});
   }
  });
 });
}
initGalleries();

// Rotate the artwork around a cylindrical surface; the lid and glass stay photographic.
const labelRenderers=[];
function initLabels(root=document){
 const ready=[...root.querySelectorAll('canvas[data-label]')].map(canvas=>new Promise(resolve=>{
  const texture=new Image();
  texture.onload=()=>{
   canvas.width=995;canvas.height=1600;const ctx=canvas.getContext('2d');if(!ctx){resolve();return;}
   const left=58,right=938,top=isEnglish?450:454,bottom=isEnglish?1410:1426,radius=(right-left)/2,center=(left+right)/2,arc=Math.PI*(isEnglish?1.8:2);
   const shade=ctx.createLinearGradient(left,0,right,0);
   shade.addColorStop(0,isEnglish?'rgba(255,255,255,.03)':'rgba(0,0,0,.23)');shade.addColorStop(.2,isEnglish?'rgba(0,0,0,0)':'rgba(255,255,255,.03)');shade.addColorStop(.6,isEnglish?'rgba(0,0,0,.32)':'rgba(0,0,0,0)');shade.addColorStop(1,isEnglish?'rgba(0,0,0,.65)':'rgba(0,0,0,.3)');
   const strips=[];
   for(let x=left;x<right;x+=3){
    const n1=clamp((x-center)/radius,-1,1),n2=clamp((Math.min(x+3,right)-center)/radius,-1,1);
    strips.push([x,(isEnglish?.56:.55)+Math.asin(n1)/arc,(Math.asin(n2)-Math.asin(n1))/arc,top-(1-Math.sqrt(1-n1*n1))*20]);
   }
   function draw(angle=0){
    ctx.clearRect(0,0,995,1600);ctx.globalCompositeOperation='source-over';
    for(const [x,start,span,y] of strips){
     const u=wrap(start+angle,1)*texture.naturalWidth,sw=Math.max(.5,span*texture.naturalWidth),dw=Math.min(3,right-x)+.2;
     const first=Math.min(sw,texture.naturalWidth-u),fraction=first/sw;
     ctx.drawImage(texture,u,0,first,texture.naturalHeight,x,y,dw*fraction,bottom-top);
     if(first<sw)ctx.drawImage(texture,0,0,sw-first,texture.naturalHeight,x+dw*fraction,y,dw*(1-fraction),bottom-top);
    }
    ctx.globalCompositeOperation='source-atop';ctx.fillStyle=shade;ctx.fillRect(left,top-20,right-left,bottom-top+20);
   }
   draw();
   const index=jars.indexOf(canvas.closest('.home-jar'));
   if(index>=0)labelRenderers.push({index,draw});
   resolve();
  };
  texture.onerror=resolve;texture.src=canvas.dataset.label;
 }));
 return Promise.all(ready);
}
let labelFrame=null;
function labelMotion(now){
 labelFrame=null;if(!homeIsActive()||reducedMotion.matches)return;
 if(!document.hidden&&menu.hidden){
  labelRenderers.forEach(({index,draw})=>{if(positions[index]?.visible)draw((offset-(carouselTablet?1:0))*.12+Math.sin(now/2800+index)*.055);});
 }
 labelFrame=requestAnimationFrame(labelMotion);
}
function startLabelMotion(){if(labelRenderers.length&&labelFrame===null&&!reducedMotion.matches&&homeIsActive())labelFrame=requestAnimationFrame(labelMotion);}
labelsReady=initLabels();
labelsReady.then(startLabelMotion);
reducedMotion.addEventListener?.('change',()=>{
 if(reducedMotion.matches){
  if(frame!==null)cancelAnimationFrame(frame);frame=null;offset=targetOffset=Math.round(targetOffset);carouselLayout();
  if(labelFrame!==null)cancelAnimationFrame(labelFrame);labelFrame=null;labelRenderers.forEach(({draw})=>draw());
 }else startLabelMotion();
});

function revealProduct(root=document){
 root.querySelector('.product-page')?.classList.add('is-arriving');
 if(reducedMotion.matches||typeof IntersectionObserver==='undefined')return;
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});
 },{threshold:.08});
 root.querySelectorAll('.product-copy,.meta-grid').forEach(el=>{el.classList.add('reveal-on-scroll');observer.observe(el);});
}
revealProduct();

// Keep the page and the jar in one visual transition, with ordinary links as a fallback.
const homeMain=stage?.closest('main');
const homeFooter=stage?document.querySelector('footer'):null;
const homeTitle=document.title,homePath=location.pathname;
const homeDescription=document.querySelector('meta[name="description"]')?.content;
let productMain=null,productFooter=null;
async function changeView(update){
 const commit=()=>{if(!menu.hidden)closeMenu();update();};
 if(reducedMotion.matches){commit();return;}
 if(typeof document.startViewTransition==='function'){
  document.documentElement.classList.add('page-transitioning');
  const transition=document.startViewTransition(commit);
  try{await transition.finished;}catch{/* A skipped visual transition still commits the page. */}
  finally{document.querySelector('.product-page')?.classList.add('has-transitioned');document.documentElement.classList.remove('page-transitioning');}
 }else{
  const leaving=document.querySelector('main');
  const animation=leaving?.animate?.([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-28px)'}],{duration:260,easing:'ease-in',fill:'forwards'});
  if(animation){try{await animation.finished;}catch{/* Continue if the exit animation is interrupted. */}}
  commit();
  // The detached home is reused by Back, so it must not retain the exit effect.
  animation?.cancel();
  document.querySelector('main')?.animate?.([{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:550,easing:'cubic-bezier(.22,1,.36,1)'});
 }
}
async function openProduct(href,push=true){
 if(opening)return;opening=true;
 clearTimeout(snapTimer);
 try{
  const response=await fetch(href);if(!response.ok)throw new Error('Product unavailable');
  const page=new DOMParser().parseFromString(await response.text(),'text/html');
  const nextMain=page.querySelector('.product-page'),nextFooter=page.querySelector('.site-footer');
  if(!nextMain||!nextFooter)throw new Error('Product markup unavailable');
  // Prepare the destination label before its view-transition snapshot is taken.
  await Promise.race([initLabels(nextMain),new Promise(resolve=>setTimeout(resolve,1200))]);
  await changeView(()=>{
   (productMain||homeMain).replaceWith(nextMain);(productFooter||homeFooter).replaceWith(nextFooter);
   productMain=nextMain;productFooter=nextFooter;
   document.body.classList.remove('home-page');header.classList.add('compact');
   document.title=page.title;
   document.querySelector('meta[name="description"]')?.setAttribute('content',page.querySelector('meta[name="description"]')?.content||'');
   if(push)history.pushState({forestProduct:href},'',href);
   window.scrollTo({top:0,left:0,behavior:'instant'});
   updateMenu();initGalleries();revealProduct();
   const title=nextMain.querySelector('h1');title.setAttribute('tabindex','-1');title.focus({preventScroll:true});
  });
 }catch{
  location.assign(href);
 }finally{opening=false;}
}
if(stage)addEventListener('popstate',async()=>{
 if(location.pathname!==homePath)return openProduct(location.pathname,false);
 if(!productMain)return;
 opening=true;
 await changeView(()=>{
  productMain.replaceWith(homeMain);productFooter.replaceWith(homeFooter);productMain=null;productFooter=null;
  document.body.classList.add('home-page');header.classList.remove('compact');document.title=homeTitle;
  document.querySelector('meta[name="description"]')?.setAttribute('content',homeDescription||'');
  window.scrollTo({top:0,left:0,behavior:'instant'});updateMenu();carouselLayout();startLabelMotion();
 });
 opening=false;jars[selectedIndex].focus({preventScroll:true});
});
