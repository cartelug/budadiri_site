
(function(){
if(!window.PDF_MEDIA) return;
const grid=document.querySelector('#mediaGrid'); if(!grid) return;
let filter='all',shown=0; const step=60; const modal=document.querySelector('#mediaModal');
const label={ndpiv:'NDP IV',manifesto:'NRM Manifesto',vision2040:'Vision 2040'};
function data(){return filter==='all'?window.PDF_MEDIA:window.PDF_MEDIA.filter(x=>x.doc===filter)}
function render(reset=false){if(reset){grid.innerHTML='';shown=0} const d=data(); const slice=d.slice(shown,shown+step); for(const x of slice){const el=document.createElement('button');el.className='media-item';el.setAttribute('aria-label','Open '+x.name);el.innerHTML=`<img loading="lazy" src="${x.thumb}" alt="Extracted image from ${label[x.doc]}"><span class="media-label">${label[x.doc]}</span>`;el.onclick=()=>{modal.querySelector('img').src=x.src;modal.classList.add('open')};grid.appendChild(el)} shown+=slice.length;document.querySelector('#loadMedia').style.display=shown<d.length?'inline-flex':'none';document.querySelector('#mediaCount').textContent=`Showing ${shown.toLocaleString()} of ${d.length.toLocaleString()} extracted images`}
document.querySelectorAll('[data-media-filter]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-media-filter]').forEach(x=>x.classList.remove('active'));b.classList.add('active');filter=b.dataset.mediaFilter;render(true)});document.querySelector('#loadMedia').onclick=()=>render();modal.querySelector('button').onclick=()=>modal.classList.remove('open');modal.onclick=e=>{if(e.target===modal)modal.classList.remove('open')};render(true)
})();
