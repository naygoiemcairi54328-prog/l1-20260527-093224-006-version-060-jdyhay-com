
(function(){
  const toggle=document.querySelector('[data-nav-toggle]');
  const nav=document.getElementById('mainNav');
  if(toggle&&nav){toggle.addEventListener('click',()=>nav.classList.toggle('open'));}
  const slides=[...document.querySelectorAll('.hero-slide')];
  const dots=[...document.querySelectorAll('.hero-dot')];
  let idx=0;
  function show(i){if(!slides.length)return;idx=(i+slides.length)%slides.length;slides.forEach((s,n)=>s.classList.toggle('active',n===idx));dots.forEach((d,n)=>d.classList.toggle('active',n===idx));}
  dots.forEach((d,n)=>d.addEventListener('click',()=>show(n)));
  if(slides.length>1){show(0);setInterval(()=>show(idx+1),5200);}
  const input=document.querySelector('[data-search-input]');
  const year=document.querySelector('[data-year-filter]');
  const region=document.querySelector('[data-region-filter]');
  const cards=[...document.querySelectorAll('.movie-card')];
  function filter(){
    const q=(input&&input.value||'').trim().toLowerCase();
    const y=year&&year.value||'';
    const r=region&&region.value||'';
    cards.forEach(card=>{
      const text=(card.dataset.title+' '+card.dataset.genre+' '+card.dataset.region+' '+card.dataset.type).toLowerCase();
      const ok=(!q||text.includes(q))&&(!y||card.dataset.year===y)&&(!r||card.dataset.region===r);
      card.classList.toggle('hidden-by-filter',!ok);
    });
  }
  [input,year,region].forEach(el=>el&&el.addEventListener('input',filter));
})();
