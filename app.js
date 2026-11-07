'use strict';
const $=s=>document.querySelector(s);
const categories=['岛民明信片','岛上地点','岛上的一天','天气来信','工作日常','岛民的生活','小巢收藏室','季节明信片','形象设定','表情与小巢','啾啾的朋友','储备朋友'];
const descriptions={'储备朋友':'睡鼠、刺猬和河狸，沿用最早确认的外观。','岛民明信片':'十二位岛民各有一张横版明信片，记录它们和建筑一起做的小事。','岛上地点':'全岛地图、建筑单体与局部图。','啾啾的朋友':'认识在岛上生活的朋友，看看它们各自忙些什么。','岛上的一天':'清晨的布帘，午后的阳光，和深夜还亮着的窗。','天气来信':'雨滴、大风和薄雾，都是小岛寄来的信。','工作日常':'分信、晾信、搬叶子。忙碌的小小身影，也会偶尔走错门。','岛民的生活':'两杯热茶、一把湿伞、一条围巾。没人出镜，也能感觉到有人生活。','小巢收藏室':'一枚贝壳、一颗石子，每件小东西都有自己的来历。','季节明信片':'春花、夏风、秋叶、冬雪，四季慢慢经过小岛。','形象设定':'从正面到背面，认识啾啾的每一面。','表情与小巢':'开心、好奇、打盹，还有一个小小的巢。','全部':'小岛的日常、四季，以及啾啾的每一个小表情。'};
let all=[],filtered=[],activeCategory='岛上的一天',opened=[],current=0,lastFocus=null;
function render(){const term=$('#search').value.trim().toLowerCase();filtered=all.filter(x=>(activeCategory==='全部'||x.category===activeCategory)&&(!term||(x.title+x.category+(x.tags||'')).toLowerCase().includes(term)));$('#gallery-count').textContent=`${filtered.length} 幅画`;$('#gallery-description').textContent=descriptions[activeCategory];$('#empty').hidden=!!filtered.length;const grid=$('#gallery-grid');grid.replaceChildren();filtered.forEach((art,i)=>{const button=document.createElement('button');button.className='art'+(['形象设定','表情与小巢','啾啾的朋友','岛上地点','储备朋友'].includes(art.category)?' character':'');const img=document.createElement('img');img.src=art.src;img.alt=art.title;img.loading='lazy';img.width=art.width;img.height=art.height;const name=document.createElement('span');name.className='art-name';name.textContent=art.title;const category=document.createElement('span');category.className='art-type';category.textContent=art.category+' / 点击放大';button.append(img,name,category);button.addEventListener('click',()=>openGallery(filtered,i));grid.append(button);});}
function showImage(){const item=opened[current];$('#lightbox-image').src=item.src;$('#lightbox-image').alt=item.title;$('#lightbox-title').textContent=item.title;$('#lightbox-category').textContent=item.category;$('#lightbox-position').textContent=`${current+1} / ${opened.length}`;$('#download-image').href=item.src;$('#download-image').download=item.title+'.webp';$('#prev-image').disabled=opened.length<2;$('#next-image').disabled=opened.length<2;}
function openGallery(items,index){if(!items.length)return;opened=items;current=index;lastFocus=document.activeElement;showImage();$('#lightbox').showModal();document.body.style.overflow='hidden';}
function changeImage(delta){current=(current+delta+opened.length)%opened.length;showImage();}
$('#close-lightbox').addEventListener('click',()=>$('#lightbox').close());$('#lightbox').addEventListener('close',()=>{document.body.style.overflow='';lastFocus?.focus();});$('#lightbox').addEventListener('click',e=>{if(e.target===$('#lightbox')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});$('#prev-image').addEventListener('click',()=>changeImage(-1));$('#next-image').addEventListener('click',()=>changeImage(1));$('#lightbox').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();changeImage(-1);}if(e.key==='ArrowRight'){e.preventDefault();changeImage(1);}});
$('#search').addEventListener('input',render);
document.querySelectorAll('a[data-open-art]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const art = all.find(entry => entry.id === Number(link.dataset.openArt));
    if (!art) return;
    event.preventDefault();
    const group = all.filter(entry => entry.category === art.category);
    openGallery(group, group.indexOf(art));
  });
});
const letters=[{title:'慢一点，也会到的。',body:'有时候，绕了一点远路，\n刚好看见了原本会错过的风景。',id:27},{title:'今天的雨，明天会干。',body:'把淋湿的心事晾在檐下。\n风会来的，阳光也是。',id:31},{title:'小小的事，也值得珍藏。',body:'一枚贝壳，一颗圆石子。\n喜欢，就是收藏它的理由。',id:29},{title:'给自己留一小会儿。',body:'什么都不做也没关系。\n窗边的阳光，刚好够睡一个午觉。',id:20}];let letter=0;
$('#next-letter').addEventListener('click',()=>{letter=(letter+1)%letters.length;const l=letters[letter],art=all.find(x=>x.id===l.id);$('#letter-title').textContent=l.title;$('#letter-body').innerText=l.body;if(art){$('#letter-image').src=art.src;$('#letter-image').alt=art.title;}});
fetch('assets.json?v=roster-12').then(r=>{if(!r.ok)throw Error('load');return r.json();}).then(data=>{all=data;[...categories,'全部'].forEach(cat=>{const b=document.createElement('button');b.textContent=cat;b.setAttribute('aria-pressed',String(cat===activeCategory));b.addEventListener('click',()=>{activeCategory=cat;document.querySelectorAll('#filters button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();});$('#filters').append(b);});render();}).catch(()=>{$('#empty').hidden=false;$('#empty').textContent='画册暂时没有加载成功，请刷新页面再试。';});


const mapLabelToggle = document.querySelector('#toggle-map-labels');
const mapPins = document.querySelectorAll('#map-board .map-pin');
mapLabelToggle.hidden = false;
mapLabelToggle.addEventListener('click', () => {
  const showLabels = mapLabelToggle.getAttribute('aria-pressed') !== 'true';
  for (const pin of mapPins) pin.hidden = !showLabels;
  mapLabelToggle.setAttribute('aria-pressed', String(showLabels));
  mapLabelToggle.textContent = showLabels ? '隐藏地名' : '显示地名';
});
