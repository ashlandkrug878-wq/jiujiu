'use strict';
const all=(s,root=document)=>Array.from(root.querySelectorAll(s));
const one=s=>document.querySelector(s);
const articles=all('article'), search=one('.search input'), gaps=one('#gaps'), menu=one('#menu');
let tab='houses', width='440', state='全部';
const text=s=>(s||'').toLowerCase().trim();
const units=all('.unit');
const terms=new Map(units.map(el=>[el,text([el.dataset.search,el.closest('[data-owner]')?.dataset.owner,el.closest('.section')?.querySelector('h2,h3')?.textContent,el.closest('.block')?.querySelector('h4')?.textContent].join(' '))]));
const opened=new Set();
function drawer(on){menu.setAttribute('aria-expanded',String(on));one('#directory').classList.toggle('open',on)}
function matches(s,words){return words.every(w=>s.includes(w))}
function filter(auto=false){
  const words=text(search.value).split(/\s+/).filter(Boolean);
  const counts={};
  for(const el of units){
    let hit=matches(terms.get(el),words);
    if(el.classList.contains('scene')){
      let visible=false;
      for(const shot of all('.shot',el)){
        const within=matches(terms.get(el)+' '+text(shot.dataset.search),words);
        shot.hidden=!within || (width!=='both' && shot.dataset.width!==width) || (state!=='全部' && !shot.dataset.state.split(' ').includes(state));
        visible ||= !shot.hidden;
      }
      hit=visible;
    }
    el.hidden=!hit;
  }
  for(const house of all('.house')){
    house.hidden=(gaps.checked && house.dataset.gap==='0') || !house.querySelector('.unit:not([hidden])');
  }
  for(const node of all('.block,.reserve,.archive'))node.hidden=!node.querySelector('.unit:not([hidden])');
  for(const d of all('.archive')){
    if(words.length && !d.hidden && !d.open){opened.add(d);d.open=true}
    if(!words.length && opened.delete(d))d.open=false;
  }
  for(const node of all('.section').reverse()){
    node.hidden=!all('.unit:not([hidden])',node).some(el=>!el.closest('.house[hidden]'));
  }
  for(const a of articles)counts[a.id]=all('.unit:not([hidden])',a).filter(el=>!el.closest('.house[hidden]')).length;
  if(auto && words.length && !counts[tab]){
    const target=articles.find(a=>counts[a.id]);
    if(target){tab=target.id;history.replaceState(null,'','#'+tab)}
  }
  for(const a of articles)a.hidden=a.id!==tab;
  for(const a of all('.tabs a'))a.setAttribute('aria-current',String(a.hash==='#'+tab));
  for(const nav of all('[data-dir]')){
    nav.hidden=nav.dataset.dir!==tab;
    for(const a of all('a',nav))a.hidden=!!document.getElementById(a.hash.slice(1))?.hidden;
  }
  for(const b of all('[data-v]'))b.setAttribute('aria-pressed',String(b.dataset.v===width));
  for(const b of all('[data-s]'))b.setAttribute('aria-pressed',String(b.dataset.s===state));
  one('#atlas').classList.toggle('compare',width==='both');
  one('#empty').hidden=counts[tab]>0;
  one('#status').textContent=words.length?'当前标签匹配 '+counts[tab]+' 项':'';
}
function navigate(){
  const target=document.getElementById(location.hash.slice(1));
  tab=target?.closest('article')?.id || 'houses';
  if(target?.classList.contains('art')){
    search.value='';
    if(target.closest('.house')?.dataset.gap==='0')gaps.checked=false;
  }
  drawer(false);filter();
  if(target?.classList.contains('art') && target.closest('.archive'))target.closest('.archive').open=true;
  if(target && !target.matches('article'))target.scrollIntoView();
  else window.scrollTo(0,0);
}
window.addEventListener('hashchange',navigate);
all('#directory a,.tabs a').forEach(a=>a.addEventListener('click',()=>{
  drawer(false);if(a.hash===location.hash)navigate();
}));
search.addEventListener('input',()=>{filter(true);window.scrollTo(0,0)});
gaps.addEventListener('change',()=>filter());
menu.onclick=()=>drawer(menu.getAttribute('aria-expanded')!=='true');
one('#reset').onclick=()=>{search.value='';gaps.checked=false;state='全部';filter()};
for(const b of all('[data-v],[data-s]'))b.onclick=()=>{
  if(b.dataset.v)width=b.dataset.v;else state=b.dataset.s;
  filter();
};
const viewer=one('#viewer'),large=one('#large');
let gallery=[],index=0;
function display(){
  const a=gallery[index];large.src=a.getAttribute('href');
  const title=a.querySelector('img')?.alt || a.closest('.art')?.querySelector('h5')?.textContent || '初见卡';
  large.alt=title;one('#caption').textContent=title+' · '+large.getAttribute('src').split('/').pop();
  one('#counter').textContent=(index+1)+' / '+gallery.length;
  viewer.classList.remove('zoomed');one('#zoom').setAttribute('aria-pressed','false');
}
function step(delta){index=(index+delta+gallery.length)%gallery.length;display()}
document.addEventListener('click',async ev=>{
  const a=ev.target.closest('a[data-light]');
  if(a && !ev.metaKey && !ev.ctrlKey){
    ev.preventDefault();
    const local=a.closest('table') || a.closest('article');
    const links=all(local.matches('table')?'a[data-light]':'a.picture',local).filter(el=>el.checkVisibility());
    gallery=[...new Map([...links,a].map(el=>[el.getAttribute('href'),el])).values()];
    index=gallery.findIndex(el=>el.getAttribute('href')===a.getAttribute('href'));
    display();viewer.showModal();return;
  }
  const btn=ev.target.closest('.copy');
  if(btn){
    const p=btn.parentNode.querySelector('p');
    try{await navigator.clipboard.writeText(p.textContent)}
    catch{
      const range=document.createRange();range.selectNodeContents(p);const sel=getSelection();sel.removeAllRanges();sel.addRange(range);
      if(!document.execCommand('copy')){btn.textContent='已选中文案，可复制';return}
      sel.removeAllRanges();
    }
    btn.textContent='已复制';setTimeout(()=>btn.textContent='复制初见信',1500);
  }
});
one('#close').onclick=()=>viewer.close();
one('#prev').onclick=()=>step(-1);one('#next').onclick=()=>step(1);
one('#zoom').onclick=()=>one('#zoom').setAttribute('aria-pressed',String(viewer.classList.toggle('zoomed')));
document.addEventListener('keydown',ev=>{
  if(viewer.open && ['ArrowLeft','ArrowRight'].includes(ev.key)){ev.preventDefault();step(ev.key==='ArrowLeft'?-1:1)}
  if(ev.key==='Escape')drawer(false);
});
new ResizeObserver(()=>document.documentElement.style.setProperty('--mast',one('.mast').offsetHeight+'px')).observe(one('.mast'));
navigate();

new ResizeObserver(([entry])=>{if(entry.target.offsetHeight)document.documentElement.style.setProperty('--filters',entry.target.offsetHeight+'px')}).observe(one('.filters'));
