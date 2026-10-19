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
let cat='all';const grid=$('#fgrid');
const tabs=$('#ftabs');tabs.innerHTML=[['all','All vehicles'],...Object.entries(CL).map(([k,v])=>[k,v[0]])].map(([k,v])=>`<button class="tab" data-k="${k}" aria-selected="${k===cat}">${v}</button>`).join('');
tabs.onclick=e=>{const b=e.target.closest('.tab');if(!b)return;cat=b.dataset.k;$$('.tab',tabs).forEach(t=>t.setAttribute('aria-selected',t===b));$$('.fcard',grid).forEach(c=>{const on=cat==='all'||c.dataset.c===cat;c.hidden=!on;if(on){c.classList.remove('in');void c.offsetWidth;c.classList.add('in')}})};
F.forEach(([c,n,d,s,b],i)=>{const sl=slug(n),el=document.createElement('article');el.className='fcard reveal';el.dataset.c=c;el.style.setProperty('--d',(i%3)*90+'ms');
el.innerHTML=`<div class="fg"><div class="fm"><img src="fleet/${sl}.jpg" alt="${n}" loading="lazy"><button class="fa p" aria-label="Previous photo" hidden>&#8249;</button><button class="fa n" aria-label="Next photo" hidden>&#8250;</button><span class="fc" hidden></span></div><div class="ft" hidden></div></div>
<div class="fb"><p class="fk">${CL[c][0]}</p><h3>${n}</h3><p class="fd">${d}</p><ul class="fs"><li><b>${s}</b> passengers</li><li><b>${b}</b> bags</li><li>Chauffeur driven</li></ul><p class="fbest">${CL[c][1]}</p><a class="btn solid" href="book.html?class=${c}">Book this class</a></div>`;
grid.append(el);
const imgs=[`fleet/${sl}.jpg`];let k=0;const m=$('.fm img',el),ft=$('.ft',el),cnt=$('.fc',el),pv=$('.p',el),nx=$('.n',el);
const show=j=>{k=(j+imgs.length)%imgs.length;m.style.opacity=0;setTimeout(()=>{m.src=imgs[k];m.style.opacity=1},160);$$('.ft img',el).forEach((t,x)=>t.classList.toggle('on',x===k));cnt.textContent=`${k+1} / ${imgs.length}`};
const ui=()=>{const many=imgs.length>1;[ft,cnt,pv,nx].forEach(x=>x.hidden=!many);ft.innerHTML=imgs.map((u,x)=>`<img src="${u}" alt="${n} photo ${x+1}" class="${x===k?'on':''}">`).join('');cnt.textContent=`${k+1} / ${imgs.length}`};
pv.onclick=()=>show(k-1);nx.onclick=()=>show(k+1);ft.onclick=e=>{const t=e.target.closest('img');if(t)show($$('img',ft).indexOf(t))};m.onclick=()=>{$('#lb img').src=imgs[k];$('#lb').showModal()};
for(let x=2;x<=6;x++){const u=`fleet/${sl}-${x}.jpg`,im=new Image();im.onload=()=>{imgs.push(u);imgs.sort();ui()};im.src=u}});
const lb=$('#lb');lb.onclick=()=>lb.close();
const io=new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');setTimeout(()=>e.target.style.removeProperty('--d'),1800);o.unobserve(e.target)}}),{threshold:.08});
$$('.fcard').forEach(c=>io.observe(c));
})();
