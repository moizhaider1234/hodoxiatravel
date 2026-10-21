(()=>{
const S=[...document.querySelectorAll('.fslide')];if(!S.length)return;
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;if(reduce)return;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));let tick=false;
function update(){
  tick=false;const vh=innerHeight;
  S.forEach((s,i)=>{
    const r=s.getBoundingClientRect(),stick=parseFloat(getComputedStyle(s).top)||0,H=r.height;
    /* previous slide: shrinks and darkens as the next one slides up over it */
    const n=S[i+1];let covered=0;
    if(n){covered=clamp(((stick+H)-n.getBoundingClientRect().top)/H,0,1)}
    s.style.setProperty('--sc',(1-covered*.07).toFixed(4));
    s.style.setProperty('--dim',(covered*.6).toFixed(3));
    /* caption rises in as the slide arrives; photo drifts for parallax */
    s.style.setProperty('--in',clamp(1-(r.top-stick)/(vh*.55),0,1).toFixed(3));
    s.style.setProperty('--py',clamp((r.top-stick)*-.06,-60,60).toFixed(1)+'px');
  });
}
const req=()=>{if(!tick){tick=true;requestAnimationFrame(update)}};
addEventListener('scroll',req,{passive:true});addEventListener('resize',req);update();
})();
