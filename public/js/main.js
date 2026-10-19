// ===== Hodoxia shared script =====
// MEDIA CONFIG: optional direct links (leave empty to use files in /media and /fleet).
const MEDIA={video:'',poster:'',photos:{}};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),4200)};
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-');
const getJSON=(u,fb)=>fetch(u).then(r=>r.ok?r.json():fb).catch(()=>fb);
const FALLBACK=[['business','Mercedes E-Class','Quiet, composed and ideal for executive airport transfers.',3,3],['business','BMW 5 Series','Sharp handling with a refined, tech-forward cabin.',3,3],['business','Audi A6','Understated elegance with a smooth long-distance ride.',3,3],['business','Cadillac XTS','Generous rear legroom and a hushed cabin.',3,3],['first','Mercedes S-Class','The flagship of comfort: reclining rear seats and ambient calm.',3,3],['first','BMW 7 Series','Executive lounge comfort with commanding presence.',3,3],['first','Audi A8','Whisper-quiet luxury for arrivals that matter.',3,3],['suv','Mercedes V-Class','Boardroom-style seating for up to 6 guests.',6,6],['suv','Chevy Suburban','Room for the whole group and all their luggage.',6,7],['suv','Cadillac Escalade','Presence, space and plush captain seating.',6,6],['suv','GMC Yukon Denali','All-weather confidence across Canadian winters.',6,6]].map((f,i)=>({id:i,category:f[0],name:f[1],blurb:f[2],seats:f[3],bags:f[4]}));
const CITYFB=['Toronto','Vancouver','Montreal','Calgary','Ottawa','Edmonton','Quebec City','Winnipeg','Halifax','Mississauga','Victoria','Niagara Falls'];
// nav
addEventListener('scroll',()=>$('#nav').classList.toggle('solid',scrollY>60),{passive:true});$('#nav').classList.toggle('solid',scrollY>60);
$('#burger').onclick=()=>$('#menu').classList.toggle('open');
addEventListener('pointermove',e=>{const g=$('#glow');g.style.left=e.clientX+'px';g.style.top=e.clientY+'px'});
// reveal + counters
function countTo(el,t,s=''){let k=0;const id=setInterval(()=>{k+=Math.max(1,Math.ceil(t/30));if(k>=t){k=t;clearInterval(id)}el.textContent=k+s},30)}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('in');$$('[data-n]',e.target).forEach(n=>countTo(n,+n.dataset.n,n.dataset.s||''));io.unobserve(e.target)}),{threshold:.12});
$$('.reveal').forEach(e=>io.observe(e));
$$('.card').forEach(c=>{c.onpointermove=e=>{const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;c.style.setProperty('--mx',x*100+'%');c.style.setProperty('--my',y*100+'%');if(!reduce)c.style.transform=`perspective(700px) rotateY(${(x-.5)*8}deg) rotateX(${(.5-y)*8}deg)`};c.onpointerleave=()=>c.style.transform=''});
// hero title
if($('#title'))[...'HODOXIA'].forEach((c,i)=>{const s=document.createElement('span');s.textContent=c;s.style.animationDelay=(0.3+i*.09)+'s';$('#title').append(s)});
if($('#mq'))$('#mq').innerHTML=Array(2).fill(['Toronto','Vancouver','Montreal','Calgary','Ottawa','Edmonton','Quebec City','Winnipeg','Halifax','Victoria'].map(c=>`<span>${c}</span>`).join('<span>&#10022;</span>')).join('<span>&#10022;</span>');
// ===== booking form (vertical) =====
function mountBooking(box,full){
  const F=(id,l,t='text',x='')=>`<div class="f"><label for="${id}">${l}</label><input id="${id}" name="${id}" type="${t}" ${x}></div>`;
  const S=(id,l,o)=>`<div class="f"><label for="${id}">${l}</label><select id="${id}" name="${id}">${o}</select></div>`;
  box.innerHTML=`<form class="bform" novalidate>
   ${F('name','Full name','text','required autocomplete="name"')}${F('email','Email','email','required autocomplete="email"')}${F('phone','Phone','tel','placeholder="+1 416 555 0123" required autocomplete="tel"')}
   ${S('city','City','')}
   ${S('category','Vehicle class','<option value="business">Business class</option><option value="first">First class</option><option value="suv">Business SUV</option>')}
   ${full?S('service','Service','<option>Airport transfer</option><option>Corporate travel</option><option>Wedding or event</option><option>Hourly charter</option><option>City-to-city</option>'):''}
   ${F('pickup','Pickup address','text','required')}${full?F('dropoff','Drop-off address'):''}
   ${F('date','Date','date','required')}${F('time','Time','time','required')}
   ${full?F('passengers','Passengers','number','min="1" max="20" value="1"')+'<div class="f"><label for="notes">Notes</label><textarea id="notes" name="notes" rows="3" placeholder="Flight number, luggage, child seats"></textarea></div>':''}
   <button class="btn solid" type="submit">Request booking</button><div class="msg" role="status"></div></form>`;
  const f=$('form',box),msg=$('.msg',box);f.date.min=new Date().toISOString().slice(0,10);
  getJSON('/api/cities',CITYFB).then(cs=>{cs=Array.isArray(cs)?cs:CITYFB;f.city.innerHTML=cs.map(c=>`<option>${c}</option>`).join('');const q=new URLSearchParams(location.search);if(q.get('city')&&cs.includes(q.get('city')))f.city.value=q.get('city');});
  const q=new URLSearchParams(location.search);if(['business','first','suv'].includes(q.get('class')))f.category.value=q.get('class');
  f.onsubmit=async e=>{e.preventDefault();msg.className='msg';msg.textContent='Sending...';
    try{const r=await fetch('/api/bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(f)))}),j=await r.json();
      if(!r.ok)throw new Error(j.error||'Something went wrong');const t=`Request received. Your reference is ${j.ref}. We will confirm shortly.`;msg.textContent=t;toast(t);f.reset()}
    catch(e){msg.className='msg err';msg.textContent=e.message}};
}
if($('#bookbox'))mountBooking($('#bookbox'),false);if($('#bookfull'))mountBooking($('#bookfull'),true);
// contact
if($('#cf'))$('#cf').onsubmit=async e=>{e.preventDefault();const m=$('#cmsg');m.className='msg';m.textContent='Sending...';
  try{const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:$('#cn').value,email:$('#ce').value,message:$('#cm').value})}),j=await r.json();
    if(!r.ok)throw new Error(j.error||'Something went wrong');m.textContent='Message sent. Thank you.';toast('Message sent. Thank you.');e.target.reset()}catch(x){m.className='msg err';m.textContent=x.message}};
// coverage chips
if($('#chips'))getJSON('/api/cities',CITYFB).then(cs=>{cs=Array.isArray(cs)?cs:CITYFB;$('#chips').innerHTML=cs.map(c=>`<a class="chip" href="book.html?city=${encodeURIComponent(c)}">${c}</a>`).join('')});
// ===== animated fleet showroom =====
const car=suv=>suv?`<svg viewBox="0 0 600 220"><g fill="none" stroke="#d4a62a" stroke-width="2.5" stroke-linejoin="round"><path d="M40 160V118q0-14 16-18l90-14 40-42q8-8 22-8h196q16 0 26 10l62 48 50 14q18 6 18 24v28q0 8-8 8h-30M120 168H40q-4 0-4-8M240 168h160"/><path d="M168 86l30-36h112v36zM322 86V50h46l50 36z"/></g><g fill="#050505" stroke="#f1cf6b" stroke-width="3"><circle cx="190" cy="170" r="34"/><circle cx="470" cy="170" r="34"/></g><g fill="#d4a62a"><circle cx="190" cy="170" r="10"/><circle cx="470" cy="170" r="10"/></g></svg>`:`<svg viewBox="0 0 600 200"><g fill="none" stroke="#d4a62a" stroke-width="2.5" stroke-linejoin="round"><path d="M30 142v-22q0-16 20-22l100-18 52-34q10-8 26-8h150q16 0 28 9l52 36 80 18q22 6 22 28v13q0 8-8 8h-30M118 150H38q-8 0-8-8M236 150h130"/><path d="M200 82l42-26h106l48 30z"/></g><g fill="#050505" stroke="#f1cf6b" stroke-width="3"><circle cx="178" cy="152" r="32"/><circle cx="458" cy="152" r="32"/></g><g fill="#d4a62a"><circle cx="178" cy="152" r="9"/><circle cx="458" cy="152" r="9"/></g></svg>`;
if($('#carousel')){
  const CATS={business:'Business class',first:'First class',suv:'Business SUVs'};
  let fleet=[],cat='business',idx=0,timer,hover=false,first=true;const track=$('#carousel'),scene=$('.scene');
  $('.scene').insertAdjacentHTML('beforeend','<i class="skyline"></i><div class="roadbed"></div>'+Array.from({length:9},(_,i)=>`<i class="streak" style="top:${18+i*8}%;--d:${i*40}ms"></i>`).join(''));
  const tabs=()=>{$('#tabs').innerHTML=Object.entries(CATS).map(([k,v])=>`<button class="tab" role="tab" data-k="${k}" aria-selected="${k===cat}">${v}</button>`).join('');$$('.tab').forEach(b=>b.onclick=()=>{if(b.dataset.k===cat)return;cat=b.dataset.k;idx=0;first=true;tabs();build()})};
  const list=()=>fleet.filter(f=>f.category===cat);
  function build(){
    $$('.vcard',track).forEach(c=>c.remove());
    list().forEach((f,i)=>{const d=document.createElement('article');d.className='vcard';d.setAttribute('aria-label',f.name);
      d.innerHTML=`<div class="art">${car(f.category==='suv')}</div><div class="sweep"></div><div class="plate">${f.name}</div>`;
      const im=new Image();im.alt=f.name;im.src=MEDIA.photos[slug(f.name)]||`/fleet/${slug(f.name)}.jpg`;im.onload=()=>{const a=$('.art',d);a.innerHTML='';a.append(im)};
      d.onclick=()=>go(i);track.append(d)});
    $('#vdots').innerHTML=list().map((_,i)=>`<i data-i="${i}"></i>`).join('');$$('#vdots i').forEach(d=>d.onclick=()=>go(+d.dataset.i));
    go(idx,true);
  }
  function go(i,init){
    const L=list(),n=L.length;if(!n)return;const prev=idx;idx=(i+n)%n;const h=Math.floor(n/2);
    $$('.vcard',track).forEach((c,k)=>{const o=((k-idx+n+h)%n)-h;c.style.setProperty('--o',o);c.style.setProperty('--a',Math.abs(o));c.dataset.far=Math.abs(o)>2?1:0;
      const was=c.classList.contains('on');c.classList.remove('on');if(k===idx){void c.offsetWidth;c.classList.add('on')}});
    const f=L[idx];
    $('#vname').innerHTML=[...f.name].map((c,k)=>`<span style="animation-delay:${k*28}ms">${c===' '?'&nbsp;':c}</span>`).join('');
    $('#vblurb').textContent=f.blurb;$('#vblurb').style.animation='none';void $('#vblurb').offsetWidth;$('#vblurb').style.animation='';
    countTo($('#vseats'),f.seats);countTo($('#vbags'),f.bags);$('#vbook').href='book.html?class='+cat;
    $$('#vdots i').forEach((d,k)=>{d.classList.remove('on');void d.offsetWidth;if(k===idx)d.classList.add('on')});
    if(!init||!first){scene.classList.add('go');setTimeout(()=>scene.classList.remove('go'),900)}first=false;
    clearInterval(timer);if(!reduce&&!hover)timer=setInterval(()=>go(idx+1),5500);
  }
  $('#vprev').onclick=()=>go(idx-1);$('#vnext').onclick=()=>go(idx+1);
  const sr=$('.showroom');sr.onpointerenter=()=>{hover=true;clearInterval(timer)};sr.onpointerleave=()=>{hover=false;go(idx,true)};
  sr.onpointermove=e=>{const r=sr.getBoundingClientRect();sr.style.setProperty('--px',((e.clientX-r.left)/r.width-.5)*2)};
  addEventListener('keydown',e=>{if(e.key==='ArrowLeft')go(idx-1);if(e.key==='ArrowRight')go(idx+1)});
  let sx=null;track.onpointerdown=e=>sx=e.clientX;track.onpointerup=e=>{if(sx!==null&&Math.abs(e.clientX-sx)>50)go(idx+(e.clientX<sx?1:-1));sx=null};
  getJSON('/api/fleet',null).then(d=>{fleet=Array.isArray(d)&&d.length?d:FALLBACK;tabs();build()});
}
if($('#sky')){
// hero fallback: animated Gulfstream-style jet takeoff on a runway (shown if /media/gulfstream.mp4 is missing)
(()=>{const v=$('#jet'),c=$('#sky'),x=c.getContext('2d');let on=true,t=0;
  if(MEDIA.video){v.querySelector('source').src=MEDIA.video;if(MEDIA.poster)v.poster=MEDIA.poster;v.load()}
  const hide=()=>{on=false;v.remove();c.style.display='none'};
  const fallback=()=>{v.style.display='none';c.style.display='block';loop()};
  v.addEventListener('error',fallback,true);v.querySelector('source').addEventListener('error',fallback);
  v.addEventListener('playing',()=>{c.style.display='none'});
  function size(){c.width=innerWidth;c.height=innerHeight}size();addEventListener('resize',size);
  function jet(px,py,a,s){x.save();x.translate(px,py);x.rotate(a);x.scale(s,s);x.fillStyle='#e9e4d4';
    x.beginPath();x.moveTo(-90,0);x.quadraticCurveTo(-60,-12,60,-10);x.quadraticCurveTo(100,-6,110,2);x.quadraticCurveTo(80,12,-60,12);x.closePath();x.fill();
    x.fillStyle='#b9b29c';x.beginPath();x.moveTo(-10,4);x.lineTo(-50,34);x.lineTo(-30,34);x.lineTo(30,4);x.fill();
    x.beginPath();x.moveTo(-80,-6);x.lineTo(-96,-40);x.lineTo(-78,-40);x.lineTo(-52,-8);x.fill();
    x.fillStyle='#d4a62a';x.fillRect(-60,0,120,2.5);x.fillStyle='#222';for(let i=0;i<7;i++)x.fillRect(20+i*10,-6,6,4);x.restore()}
  function loop(){if(!on)return;t=(t+1)%900;const W=c.width,H=c.height,p=t/900,hz=H*.52;
    const g=x.createLinearGradient(0,0,0,hz);g.addColorStop(0,'#05060a');g.addColorStop(1,'#3a2a0c');x.fillStyle=g;x.fillRect(0,0,W,H);
    x.fillStyle='#0b0a08';x.fillRect(0,hz,W,H-hz);
    x.fillStyle='#1b1912';x.beginPath();x.moveTo(W*.46,hz);x.lineTo(W*.54,hz);x.lineTo(W*.95,H);x.lineTo(W*.05,H);x.fill();
    x.fillStyle='#d4a62a';for(let i=0;i<14;i++){const d=((i/14+t/260)%1),y=hz+(H-hz)*d*d,w=2+d*d*14,h=4+d*d*60;x.globalAlpha=.7;x.fillRect(W/2-w/2,y,w,h)}x.globalAlpha=1;
    const run=Math.min(p/.55,1),lift=Math.max((p-.55)/.45,0),px=W*(.2+run*run*.3+lift*.35),py=H*.8-lift*lift*H*.5-run*H*.04;
    jet(px,py,-lift*.35,1.1+ (1-lift)*.4);requestAnimationFrame(loop)}
  setTimeout(()=>{if(v.readyState<2&&on)fallback()},1200);
})();

}
