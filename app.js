const el = id => document.getElementById(id);
const app = window.Telegram?.WebApp;
app?.ready(); app?.expand();
const data = await fetch('./catalog.json').then(r => r.json());
const products = data.products.slice(0,20);
const price = p => '€'+Number(p.euros).toFixed(2);
let index=0, frame=0, muted=false;
const viewer=el('viewer'), media=el('media');
el('count').textContent=products.length;
products.forEach((p,i)=>{
  const card=document.createElement('article');
  card.innerHTML='<button><div class="cover"><img alt=""><span><label></label><b></b></span></div><strong></strong></button>';
  card.querySelector('img').src=p.poster;
  card.querySelector('label').textContent=p.grams+' g';
  card.querySelector('b').textContent=price(p);
  card.querySelector('strong').textContent=p.name;
  card.querySelector('button').onclick=()=>{index=i;frame=0;viewer.showModal();render();app?.disableVerticalSwipes?.()};
  el('grid').append(card);
});
el('mode').onclick=e=>{
  const single=el('grid').classList.toggle('single');
  e.currentTarget.textContent=single?'⊞':'▣';
  e.currentTarget.ariaLabel=single?'Switch to grid':'Switch to carousel';
};
function render(){
  const p=products[index];
  const video=Boolean(p.video && frame===0);
  const current=document.createElement(video?'video':'img');
  media.replaceChildren(current);
  el('sound').hidden=!video;
  if(video){
    current.playsInline=true;current.loop=true;current.muted=muted;current.poster=p.poster;current.src=p.video;
    current.play().catch(()=>{current.muted=true;el('sound').textContent='Enable sound';current.play().catch(()=>{current.controls=true})});
    el('sound').textContent=muted?'Enable sound':'Mute';
    el('sound').onclick=()=>{muted=!current.muted;current.muted=muted;current.play().catch(()=>{current.controls=true});el('sound').textContent=muted?'Enable sound':'Mute'};
  }else{current.src=p.photos?.[Math.max(0,frame-1)]||p.poster;current.alt=p.name}
  el('gallery').hidden=!p.photos?.length||(!p.video&&p.photos.length<2);
  el('gallery').textContent=frame===p.photos?.length&&p.video?'Video':'Photos →';
  el('name').textContent=p.name;el('desc').textContent=p.description;
  el('details').textContent=p.grams+' g   ·   '+price(p);
}
el('gallery').onclick=()=>{const p=products[index];frame=frame>=p.photos.length?(p.video?0:1):(!p.video&&!frame?2:frame+1);render()};
function move(step){index=(index+step+products.length)%products.length;frame=0;render()}
el('next').onclick=()=>move(1);
let start;
viewer.addEventListener('touchstart',e=>start=e.touches[0].clientY,{passive:true});
viewer.addEventListener('touchend',e=>{const dy=e.changedTouches[0].clientY-start;if(Math.abs(dy)>55)move(dy<0?1:-1)});
el('closeView').onclick=()=>viewer.close();
viewer.onclose=()=>{media.replaceChildren();app?.enableVerticalSwipes?.()};
for(const [id,url] of [['tg',data.telegram],['sg',data.signal]]){
 const link=el(id);
 if(!url){link.hidden=true;link.style.display='none';continue}
 link.href=url;link.target='_blank';link.rel='noopener';
 link.onclick=e=>{if(!app?.initData)return;e.preventDefault();if(id==='tg')app.openTelegramLink(url);else app.openLink(url)};
}
