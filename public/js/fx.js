(()=>{const d=document,$=(s,r=d)=>r.querySelector(s),$$=(s,r=d)=>[...r.querySelectorAll(s)];
if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
d.documentElement.classList.add('js');
const bar=d.createElement('div');bar.id='prog';d.body.prepend(bar);
const mt=$('#mt');if(mt){const t=[...new Set($$('.apt span').map(e=>e.textContent.trim()))].map(x=>`<span>${x}</span>`).join('');mt.innerHTML=t+t+t+t}
['.grid','.why','.routes','.apts','.faq','.stats','.occs'].forEach(s=>$$(s).forEach(g=>[...g.children].forEach((c,i)=>c.style.setProperty('--d',i*80+'ms'))));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;e.target.classList.add('in');if(e.target.classList.contains('reveal'))setTimeout(()=>e.target.style.removeProperty('--d'),1800);io.unobserve(e.target)}),{threshold:.12});
$$('.tsec:not(#fleet)').forEach(e=>io.observe(e));if($('#fleet'))$('#fleet').classList.add('in');
$$('.card,.route,.apt,.occ').forEach(e=>{e.classList.add('tilt');e.addEventListener('mousemove',v=>{const r=e.getBoundingClientRect(),x=(v.clientX-r.left)/r.width-.5,y=(v.clientY-r.top)/r.height-.5;e.style.setProperty('--rx',(-y*7)+'deg');e.style.setProperty('--ry',(x*9)+'deg');e.style.setProperty('--mx',(x+.5)*100+'%');e.style.setProperty('--my',(y+.5)*100+'%')});e.addEventListener('mouseleave',()=>{e.style.setProperty('--rx','0deg');e.style.setProperty('--ry','0deg')})});
const oc=$('.occs');if(oc){let dn=0,sx=0,sl=0;oc.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;dn=1;sx=e.clientX;sl=oc.scrollLeft;oc.style.scrollSnapType='none'});addEventListener('pointerup',()=>{dn=0;oc.style.scrollSnapType=''});oc.addEventListener('pointermove',e=>{if(dn){oc.scrollLeft=sl-(e.clientX-sx)}})}
const jl=$('.jl'),sx=$$('[data-sx]'),hc=$('.hero-copy');let tk=0;
const up=()=>{tk=0;const y=scrollY,h=innerHeight;bar.style.transform=`scaleX(${y/Math.max(1,d.documentElement.scrollHeight-h)})`;
if(hc&&y<h){hc.style.transform=`translateY(${y*.22}px)`;hc.style.opacity=1-y/(h*.9)}
sx.forEach(e=>{const r=e.parentElement.getBoundingClientRect();e.style.transform=`translateX(${(r.top-h/2)*+e.dataset.sx}px)`});
if(jl){const r=jl.getBoundingClientRect();jl.style.setProperty('--p',Math.min(1,Math.max(0,(h*.65-r.top)/r.height)));$$('li',jl).forEach(l=>l.classList.toggle('on',l.getBoundingClientRect().top<h*.65))}};
addEventListener('scroll',()=>{if(!tk)tk=requestAnimationFrame(up)},{passive:true});up();
})();
(()=>{const d=document,$=(s,r=d)=>r.querySelector(s),$$=(s,r=d)=>[...r.querySelectorAll(s)];
const calm=matchMedia('(prefers-reduced-motion:reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
// back to top
const t=d.createElement('button');t.id='totop';t.setAttribute('aria-label','Back to top');t.innerHTML='&#8593;';d.body.append(t);
t.onclick=()=>scrollTo({top:0,behavior:calm?'auto':'smooth'});addEventListener('scroll',()=>t.classList.toggle('show',scrollY>900),{passive:true});
// menu: lock scroll, label, close on link / Escape
const b=$('#burger'),m=$('#menu');if(b&&m){const set=o=>{m.classList.toggle('open',o);b.textContent=o?'Close':'Menu';b.setAttribute('aria-expanded',o);d.body.style.overflow=o?'hidden':''};b.onclick=()=>set(!m.classList.contains('open'));m.addEventListener('click',e=>{if(e.target.closest('a'))set(false)});addEventListener('keydown',e=>{if(e.key==='Escape')set(false)});addEventListener('resize',()=>{if(innerWidth>860)set(false)})}
// current page highlight
const pg=location.pathname.split('/').pop().replace('.html','')||'index';$$('#menu a').forEach(a=>{if(a.getAttribute('href').replace('.html','')===pg)a.classList.add('active')});
// magnetic buttons
if(fine&&!calm)$$('.btn.solid').forEach(e=>{e.addEventListener('pointermove',v=>{const r=e.getBoundingClientRect();e.style.transform=`translate(${(v.clientX-r.left-r.width/2)*.12}px,${(v.clientY-r.top-r.height/2)*.25}px)`});e.addEventListener('pointerleave',()=>e.style.transform='')});
})();
