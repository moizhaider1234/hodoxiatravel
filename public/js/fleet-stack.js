(()=>{
const $=s=>document.querySelector(s);const sc=$('#fscroll');if(!sc)return;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const CLS={business:'Business class',first:'First class',suv:'Business SUVs'};
const CARS=[
['business','Mercedes E-Class','mercedes-e-class','Quiet, composed and ideal for executive airport transfers.',3,'3'],
['business','BMW 5 Series','bmw-5-series','Sharp handling with a refined, tech-forward cabin.',3,'3'],
['business','Audi A6','audi-a6','Understated elegance with a smooth long-distance ride.',3,'3'],
['business','Cadillac XTS','cadillac-xts','Generous rear legroom and a hushed cabin.',3,'3'],
['first','Mercedes S-Class','mercedes-s-class','The flagship of comfort: reclining rear seats and ambient calm.',3,'3'],
['first','BMW 7 Series','bmw-7-series','Executive lounge comfort with commanding presence.',3,'3'],
['first','Audi A8','audi-a8','Whisper-quiet luxury for arrivals that matter.',3,'3'],
['suv','Mercedes V-Class','mercedes-v-class','Boardroom-style seating for up to 6 guests.',6,'6'],
['suv','Chevy Suburban','chevy-suburban','Room for the whole group and all their luggage.',6,'7'],
['suv','Cadillac Escalade','cadillac-escalade','Presence, space and plush captain seating.',6,'6'],
['suv','GMC Yukon Denali','gmc-yukon-denali','All-weather confidence across Canadian winters.',6,'6']];
const KEYS=Object.keys(CLS),M=KEYS.length,G=KEYS.map(k=>CARS.filter(c=>c[0]===k));
const card=$('#fcard'),cars=$('#fcars'),ghost=$('#fghost'),streaks=$('#fstreaks'),floor=$('.ffloor'),pills=$('#fpills'),dots=$('#fdots'),hint=$('#fhint');
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),wrap=(x,n)=>((x%n)+n)%n,off=(i,p,n)=>wrap(i-p+n/2,n)-n/2,sm=x=>x*x*(3-2*x);
/* layers: one group of cut-out cars per class */
const grp=G.map(L=>{const g=document.createElement('div');g.className='fgrp';cars.append(g);
  return {g,im:L.map(c=>{const i=new Image();i.src='fleet/cutout/'+c[2]+'.webp';i.alt=c[1];i.draggable=false;i.decoding='async';g.append(i);return i})}});
ghost.innerHTML=KEYS.map(k=>'<span>'+CLS[k]+'</span>').join('');const gs=[...ghost.children];
pills.innerHTML=KEYS.map(k=>'<button type="button" data-k="'+k+'">'+CLS[k]+'</button>').join('');const pb=[...pills.children];
const SK=Array.from({length:7},(_,i)=>{const e=document.createElement('i');e.style.top=(22+i*8.5)+'%';e.dataset.s=(i*29)%140;e.dataset.m=.7+i*.16;streaks.append(e);return e});
let pinned=!reduce;if(!pinned)sc.classList.add('nopin');
let cT=0,cP=0,hi=KEYS.map(()=>0),ht=KEYS.map(()=>0),hp=KEYS.map(()=>0),raf=0,shown={c:-1,i:-1,raw:0},touched=false;
const act=()=>clamp(Math.round(cP),0,M-1);
function buildDots(c){dots.innerHTML=G[c].map((_,i)=>'<i data-i="'+i+'"></i>').join('');[...dots.children].forEach(d=>d.onclick=()=>{const n=G[c].length;let df=+d.dataset.i-wrap(Math.round(hi[c]),n);if(df>n/2)df-=n;if(df<-n/2)df+=n;step(df)})}
function setCap(c,i,kind){
  const x=G[c][i];$('#fk').textContent=CLS[x[0]];$('#fn').textContent=x[1];$('#fb').textContent=x[3];
  $('#fs1').textContent=x[4];$('#fs2').textContent=x[5];$('#fbook').href='book.html?class='+x[0];
  $('#fcount').innerHTML='<b>'+String(i+1).padStart(2,'0')+'</b> / '+String(G[c].length).padStart(2,'0');
  const cap=$('#fcap');cap.classList.remove('cap-dn','cap-up','cap-nx','cap-pv');void cap.offsetWidth;cap.classList.add(kind);
  pb.forEach((b,k)=>b.classList.toggle('on',k===c));
  [...dots.children].forEach((d,k)=>d.classList.toggle('on',k===i));
}
function render(){
  const W=card.clientWidth,H=card.clientHeight,sp=W*.78;
  grp.forEach((L,c)=>{
    const v=c-cP,av=Math.abs(v),n=G[c].length;
    if(av>1.2){L.g.style.visibility='hidden';gs[c].style.opacity=0;return}
    L.g.style.visibility='visible';L.g.style.opacity=clamp(1-av*1.1,0,1).toFixed(3);
    L.g.style.transform='translate3d(0,'+(v*H*.7).toFixed(1)+'px,0)';
    L.g.style.filter=av>.02?'blur('+(av*8).toFixed(1)+'px)':'none';
    gs[c].style.opacity=clamp(1-av*1.2,0,1).toFixed(3);
    gs[c].style.transform='translate(-50%,0) translate3d('+(-hp[c]*90).toFixed(1)+'px,'+(v*H*.55).toFixed(1)+'px,0)';
    L.im.forEach((im,i)=>{
      const o=off(i,hp[c],n),a=Math.abs(o);
      if(a>1.25){im.style.visibility='hidden';return}
      im.style.visibility='visible';im.style.opacity=clamp(1-a*.95,0,1).toFixed(3);
      im.style.transform='translate3d(calc(-50% + '+(o*sp).toFixed(1)+'px),0,0) scale('+(1-Math.min(a,1)*.16).toFixed(3)+') skewX('+(-o*7).toFixed(2)+'deg)';
      im.style.filter=a>.02?'blur('+(a*7).toFixed(1)+'px) drop-shadow(0 26px 26px rgba(0,0,0,.65))':'drop-shadow(0 26px 26px rgba(0,0,0,.65))';
    });
  });
  const c=act(),n=G[c].length;
  floor.style.setProperty('--fx',(-hp[c]*420).toFixed(1)+'px');
  const sv=clamp(Math.abs(ht[c]-hp[c])*1.8+Math.abs(cT-cP)*1.4,0,.85);
  SK.forEach(e=>{const p=(((+e.dataset.s-(hp[c]+cP*2)*320*e.dataset.m)%140)+140)%140-20;e.style.left=p+'%';e.style.setProperty('--sp',sv.toFixed(2))});
  pb.forEach((b,k)=>b.style.setProperty('--f',clamp(1-Math.abs(cP-k),0,1).toFixed(3)));
  const raw=Math.round(hp[c]),ci=wrap(raw,n);
  if(c!==shown.c||ci!==shown.i){
    const first=shown.c<0,cc=c!==shown.c;
    if(cc)buildDots(c);
    setCap(c,ci,first?'cap-dn':cc?(c>shown.c?'cap-dn':'cap-up'):(raw>shown.raw?'cap-nx':'cap-pv'));
    if(!first&&touched===false){touched=true}
    if(!first)hint.classList.add('gone');
    shown={c,i:ci,raw};
  }else shown.raw=raw;
}
function frame(){
  let moving=false;
  if(reduce){cP=cT;hp=ht.slice()}else{
    cP+=(cT-cP)*.1;if(Math.abs(cT-cP)<.001)cP=cT;else moving=true;
    hp=hp.map((p,c)=>{p+=(ht[c]-p)*.14;if(Math.abs(ht[c]-p)<.001)p=ht[c];else moving=true;return p});
  }
  render();raf=moving?requestAnimationFrame(frame):0;
}
const kick=()=>{if(!raf)raf=requestAnimationFrame(frame)};
function step(d){const c=act();if(Math.abs(cP-Math.round(cP))>.1||!d)return;hi[c]+=d;ht[c]=hi[c];kick()}
/* vertical: scroll moves between classes (with a pause on each) */
function onScroll(){
  if(!pinned)return;
  const vh=innerHeight,r=sc.getBoundingClientRect(),stage=$('.fstage'),stick=parseFloat(getComputedStyle(stage).top)||0;
  const R=Math.max(1,sc.offsetHeight-stage.offsetHeight),p=clamp((stick-r.top)/R,0,1),t=p*(M-1),b=Math.min(M-2,Math.floor(t)),fr=t-b;
  cT=b+sm(clamp((fr-.28)/.44,0,1));
  const e=clamp(1-(r.top-stick)/(vh*.55),0,1);
  card.style.transform='scale('+(.9+.1*e).toFixed(4)+')';card.style.borderRadius=(46-18*e).toFixed(1)+'px';
  kick();
}
function gotoCat(k){
  if(pinned){const stage=$('.fstage'),stick=parseFloat(getComputedStyle(stage).top)||0,R=sc.offsetHeight-stage.offsetHeight;
    scrollTo({top:scrollY+sc.getBoundingClientRect().top-stick+R*(k/(M-1))+(k===0?1:k===M-1?-1:0),behavior:'smooth'})}
  else{cT=k;kick()}
}
pb.forEach((b,k)=>b.onclick=()=>gotoCat(k));
/* horizontal: swipe / drag / arrows / keys change the car within the class */
const SP=()=>card.clientWidth*.78;
let drag=null;
card.addEventListener('pointerdown',e=>{
  if(e.target.closest('button,a,i'))return;if(e.pointerType==='mouse'&&e.button)return;
  if(Math.abs(cP-Math.round(cP))>.1)return;const c=act();
  drag={id:e.pointerId,c,x:e.clientX,y:e.clientY,t:performance.now(),base:hi[c],axis:null,dx:0};
});
card.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.axis&&(Math.abs(dx)>8||Math.abs(dy)>8)){drag.axis=Math.abs(dx)>Math.abs(dy)?'x':'y';if(drag.axis==='x'){try{card.setPointerCapture(e.pointerId)}catch(_){}card.style.cursor='grabbing'}}
  if(drag.axis==='x'){drag.dx=dx;ht[drag.c]=drag.base-dx/SP()*1.15;kick()}
});
function end(e,cancel){
  if(!drag||e.pointerId!==drag.id)return;const d=drag;drag=null;card.style.cursor='';
  if(d.axis!=='x')return;
  const dx=d.dx,v=Math.abs(dx)/Math.max(1,performance.now()-d.t);
  const s=!cancel&&(Math.abs(dx)>SP()*.1||(v>.35&&Math.abs(dx)>22))?(dx<0?1:-1):0;
  hi[d.c]=d.base+s;ht[d.c]=hi[d.c];kick();
}
card.addEventListener('pointerup',e=>end(e,false));card.addEventListener('pointercancel',e=>end(e,true));
$('#fprev').onclick=()=>step(-1);$('#fnext').onclick=()=>step(1);
addEventListener('keydown',e=>{
  if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;if(/INPUT|SELECT|TEXTAREA/.test((e.target.tagName||'')))return;
  const r=card.getBoundingClientRect();if(r.top>innerHeight*.6||r.bottom<innerHeight*.3)return;
  step(e.key==='ArrowRight'?1:-1);
});
let wl=0;card.addEventListener('wheel',e=>{
  if(Math.abs(e.deltaX)>Math.abs(e.deltaY)&&Math.abs(e.deltaX)>20){e.preventDefault();const t=performance.now();if(t-wl>420){wl=t;step(e.deltaX>0?1:-1)}}
},{passive:false});
card.addEventListener('dragstart',e=>e.preventDefault());
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',()=>{onScroll();render()});
render();onScroll();
})();
