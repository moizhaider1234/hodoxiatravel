(()=>{const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const CL={business:['Business class','Best for airport transfers, meetings and solo or two-person trips.'],first:['First class','Flagship comfort for arrivals and occasions that matter.'],suv:['Business SUV','Best for groups, extra luggage and all-weather travel.']};
const F=[
['business','Mercedes E-Class','Quiet, composed and ideal for executive airport transfers. A calm cabin makes it easy to take a call, read or rest between the terminal and your meeting.',3,3],
['business','BMW 5 Series','Sharp handling with a refined, tech-forward cabin. A confident choice for business travellers who want a modern, polished ride across town.',3,3],
['business','Audi A6','Understated elegance with a smooth long-distance ride. Comfortable on longer city-to-city journeys as well as short transfers.',3,3],
['business','Cadillac XTS','Generous rear legroom and a hushed cabin. Room to stretch out for guests who value space in the back seat.',3,3],
['first','Mercedes S-Class','The flagship of comfort: reclining rear seats and ambient calm. Chosen for executives, VIP guests and milestone arrivals.',3,3],
['first','BMW 7 Series','Executive lounge comfort with commanding presence. A stately arrival for clients, speakers and special evenings.',3,3],
['first','Audi A8','Whisper-quiet luxury for arrivals that matter. Refined and unhurried from pickup to drop-off.',3,3],
['suv','Mercedes V-Class','Boardroom-style seating for up to 6 guests. Ideal for teams, delegations and families travelling together.',6,6],
['suv','Chevy Suburban','Room for the whole group and all their luggage. A practical choice for larger parties and airport runs with heavy bags.',6,7],
['suv','Cadillac Escalade','Presence, space and plush captain seating. Makes a statement at weddings, galas and corporate events.',6,6],
['suv','GMC Yukon Denali','All-weather confidence across Canadian winters. Spacious and steady when conditions turn.',6,6]];
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-');
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches,calm=matchMedia('(prefers-reduced-motion:reduce)').matches;
let cat='all';const grid=$('#fgrid'),tabs=$('#ftabs');
tabs.innerHTML=[['all','All vehicles'],...Object.entries(CL).map(([k,v])=>[k,v[0]])].map(([k,v])=>`<button class="tab" data-k="${k}" aria-selected="${k===cat}">${v}</button>`).join('');
const pad=n=>String(n).padStart(2,'0');
F.forEach(([c,n,d,s,b],i)=>{const sl=slug(n),el=document.createElement('article');el.className='fcard reveal';el.dataset.c=c;el.dataset.i=i;el.style.setProperty('--d',(i%3)*90+'ms');
el.innerHTML=`<div class="stage" data-cls="${c}"><span class="idx">${pad(i+1)}</span><span class="kind">${CL[c][0]}</span><div class="spot"></div>
<img class="cut" src="fleet/cutout/${sl}.webp" alt="${n}" loading="lazy" draggable="false" onerror="this.onerror=null;this.src='fleet/${sl}.jpg';this.classList.add('raw')"><div class="shadow"></div><button class="qv" aria-label="View ${n} larger"><svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>View</button></div>
<div class="fb"><h3>${n}</h3><p class="fd">${d.split('. ')[0].replace(/\.$/,'')}.</p>
<div class="meters"><div><span>Passengers</span><i style="--v:${s/7}"></i><b>${s}</b></div><div><span>Luggage</span><i style="--v:${b/7}"></i><b>${b}</b></div></div>
<div class="more"><div><p class="fd">${d.split('. ').slice(1).join('. ')}</p><p class="fbest">${CL[c][1]}</p></div></div>
<div class="fact"><a class="btn solid" href="book.html?class=${c}">Book this class</a><span class="tag2">Chauffeur driven</span></div></div>`;
grid.append(el);
const st=$('.stage',el),im=$('.cut',el);
if(fine&&!calm){el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;el.style.setProperty('--mx',x*100+'%');el.style.setProperty('--my',y*100+'%');el.style.setProperty('--rx',((.5-y)*6)+'deg');el.style.setProperty('--ry',((x-.5)*8)+'deg');const r2=st.getBoundingClientRect();st.style.setProperty('--px',((e.clientX-r2.left)/r2.width-.5)*2)});el.addEventListener('pointerleave',()=>{['--rx','--ry','--px'].forEach(k=>el.style.setProperty(k,'0'))})}
$('.qv',el).onclick=()=>open(i);im.onclick=()=>open(i)});
tabs.onclick=e=>{const b=e.target.closest('.tab');if(!b)return;cat=b.dataset.k;$$('.tab',tabs).forEach(t=>t.setAttribute('aria-selected',t===b));let k=0;$$('.fcard',grid).forEach(c=>{const on=cat==='all'||c.dataset.c===cat;c.hidden=!on;if(on){c.style.setProperty('--d',(k++%3)*70+'ms');c.classList.remove('in');void c.offsetWidth;c.classList.add('in')}})};
// viewer
const lb=$('#lb');let cur=0;
lb.innerHTML=`<div class="lbin"><button class="lx" aria-label="Close">&times;</button><button class="la p" aria-label="Previous">&#8249;</button><button class="la n" aria-label="Next">&#8250;</button><div class="lbs"><img alt=""></div><div class="lbt"><h3></h3><p></p><a class="btn solid" href="book.html">Book this class</a></div></div>`;
function paint(){const [c,n,d,s,b]=F[cur];const im=$('.lbs img',lb);im.classList.remove('swap');void im.offsetWidth;im.src=`fleet/cutout/${slug(n)}.webp`;im.alt=n;im.classList.add('swap');$('.lbt h3',lb).textContent=n;$('.lbt p',lb).textContent=`${CL[c][0]}  ·  ${s} passengers  ·  ${b} bags`;$('.lbt a',lb).href='book.html?class='+c}
function open(i){cur=i;paint();lb.showModal();document.body.style.overflow='hidden'}
const step=d=>{cur=(cur+d+F.length)%F.length;paint()};
$('.p',lb).onclick=e=>{e.stopPropagation();step(-1)};$('.n',lb).onclick=e=>{e.stopPropagation();step(1)};$('.lx',lb).onclick=()=>lb.close();
lb.addEventListener('click',e=>{if(e.target===lb||e.target.classList.contains('lbin')||e.target.classList.contains('lbs'))lb.close()});lb.addEventListener('close',()=>document.body.style.overflow='');
lb.addEventListener('keydown',e=>{if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1)});
let sx=null;lb.addEventListener('pointerdown',e=>sx=e.clientX);lb.addEventListener('pointerup',e=>{if(sx!==null&&Math.abs(e.clientX-sx)>50)step(e.clientX<sx?1:-1);sx=null});
const io=new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');setTimeout(()=>e.target.style.removeProperty('--d'),1800);o.unobserve(e.target)}}),{threshold:.08});
$$('.fcard').forEach(c=>io.observe(c));
})();
