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
const N=CARS.length,KEYS=Object.keys(CLS);
sc.style.setProperty('--n',N);
const card=$('#fcard'),cars=$('#fcars'),ghost=$('#fghost'),streaks=$('#fstreaks'),floor=$('.ffloor'),pills=$('#fpills');
const imgs=CARS.map(c=>{const i=new Image();i.src='fleet/cutout/'+c[2]+'.webp';i.alt=c[1];i.draggable=false;i.decoding='async';cars.append(i);return i});
ghost.innerHTML=KEYS.map(k=>'<span data-k="'+k+'">'+CLS[k]+'</span>').join('');
const gs=[...ghost.children];
const first={},last={};CARS.forEach((c,i)=>{if(first[c[0]]===undefined)first[c[0]]=i;last[c[0]]=i});
pills.innerHTML=KEYS.map(k=>'<button type="button" data-k="'+k+'">'+CLS[k]+'</button>').join('');
const pb=[...pills.children];
const SK=Array.from({length:7},(_,i)=>{const e=document.createElement('i');e.style.top=(22+i*8.5)+'%';e.dataset.s=(i*29)%140;e.dataset.m=.7+i*.16;streaks.append(e);return e});
let pinned=!reduce;if(!pinned)sc.classList.add('nopin');
let tt=0,ct=0,cur=-1,raf=0;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function setCap(i,dir){
  const c=CARS[i];$('#fk').textContent=CLS[c[0]];$('#fn').textContent=c[1];$('#fb').textContent=c[3];
  $('#fs1').textContent=c[4];$('#fs2').textContent=c[5];$('#fbook').href='book.html?class='+c[0];
  $('#fcount').innerHTML='<b>'+String(i+1).padStart(2,'0')+'</b> / '+N;
  const cap=$('#fcap');cap.classList.remove('cap-dn','cap-up');void cap.offsetWidth;cap.classList.add(dir>=0?'cap-dn':'cap-up');
  pb.forEach(b=>b.classList.toggle('on',b.dataset.k===c[0]));
  gs.forEach(g=>g.classList.toggle('on',g.dataset.k===c[0]));
}
function render(){
  const W=card.clientWidth,sp=W*.78;
  imgs.forEach((im,i)=>{
    const o=i-ct,a=Math.abs(o);
    if(a>1.25){im.style.visibility='hidden';return}
    im.style.visibility='visible';
    im.style.opacity=clamp(1-a*.95,0,1).toFixed(3);
    im.style.transform='translate3d(calc(-50% + '+(o*sp).toFixed(1)+'px),0,0) scale('+(1-Math.min(a,1)*.16).toFixed(3)+') skewX('+(-o*7).toFixed(2)+'deg)';
    im.style.filter=a>.02?'blur('+(a*7).toFixed(1)+'px) drop-shadow(0 26px 26px rgba(0,0,0,.65))':'drop-shadow(0 26px 26px rgba(0,0,0,.65))';
  });
  ghost.style.transform='translate3d('+(-ct*90).toFixed(1)+'px,0,0)';
  floor.style.setProperty('--fx',(-ct*420).toFixed(1)+'px');
  const sv=clamp(Math.abs(tt-ct)*1.8,0,.85);
  SK.forEach(e=>{const p=(((+e.dataset.s-ct*320*e.dataset.m)%140)+140)%140-20;e.style.left=p+'%';e.style.setProperty('--sp',sv.toFixed(2))});
  pb.forEach(b=>{const k=b.dataset.k,s=first[k],e=last[k];b.style.setProperty('--f',clamp((ct-s)/Math.max(1,e-s),0,1).toFixed(3))});
  const a=clamp(Math.round(ct),0,N-1);
  if(a!==cur){const d=cur<0?1:(a>cur?1:-1);cur=a;setCap(a,d);$('#fhint').classList.toggle('gone',a>0)}
}
function frame(){
  ct+=(tt-ct)*.11;if(Math.abs(tt-ct)<.0008)ct=tt;render();
  raf=ct!==tt?requestAnimationFrame(frame):0;
}
function onScroll(){
  if(!pinned)return;
  const vh=innerHeight,r=sc.getBoundingClientRect(),stage=$('.fstage'),stick=parseFloat(getComputedStyle(stage).top)||0;
  const R=Math.max(1,sc.offsetHeight-stage.offsetHeight);
  tt=clamp((stick-r.top)/R,0,1)*(N-1);
  const e=clamp(1-(r.top-stick)/(vh*.55),0,1);
  card.style.transform='scale('+(.9+.1*e).toFixed(4)+')';card.style.borderRadius=(46-18*e).toFixed(1)+'px';
  if(!raf)raf=requestAnimationFrame(frame);
}
pb.forEach(b=>b.onclick=()=>{
  const s=first[b.dataset.k];
  if(pinned){const stage=$('.fstage'),stick=parseFloat(getComputedStyle(stage).top)||0,R=sc.offsetHeight-stage.offsetHeight;
    scrollTo({top:scrollY+sc.getBoundingClientRect().top-stick+R*(s/(N-1))+1,behavior:'smooth'})}
  else{tt=ct=s;render()}
});
addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',()=>{onScroll();render()});
render();onScroll();
})();
