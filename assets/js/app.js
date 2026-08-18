(function(){
'use strict';
const pages=[['index.html','Home'],['vision.html','Vision'],['impact.html','Impact'],['parliament.html','Parliament'],['updates.html','Updates'],['community.html','Community'],['about.html','About'],['media.html','Media'],['resources.html','Resources']];
const current=(location.pathname.split('/').pop()||'index.html');
const icon=(name)=>({home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/>',vision:'<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',impact:'<path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M22 19H2"/>',community:'<path d="M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M2.5 20c.5-4 2.6-6 5.5-6s5 2 5.5 6"/><path d="M16 9a2.5 2.5 0 1 0 0-5"/><path d="M15 14c3.6 0 5.5 1.8 6 5"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>'}[name]||'');

// global UI layers
if(!document.querySelector('.page-enter')) document.body.insertAdjacentHTML('afterbegin','<div class="page-enter" aria-hidden="true"></div><div class="scroll-progress" aria-hidden="true"><span></span></div>');

const head=document.querySelector('[data-site-header]');
if(head){head.innerHTML=`<header class="header"><div class="container nav"><a class="brand" href="index.html" aria-label="Budadiri East home"><span class="brand-mark">BE</span><span class="brand-copy">Budadiri East<span>Office of Hon. Julius Nakiyi Muntu</span></span></a><nav class="navlinks" aria-label="Primary navigation">${pages.map(([u,n])=>`<a href="${u}" class="${current===u?'active':''}">${n}</a>`).join('')}</nav><div class="nav-cta"><a class="btn btn-primary" href="community.html#submit">Raise an issue <span>↗</span></a><button class="menu-btn" aria-label="Open menu" aria-expanded="false"><i></i></button></div></div></header><div class="mobile-menu" aria-hidden="true"><div class="mobile-menu-inner"><div class="mobile-kicker">Budadiri East digital office</div>${pages.map(([u,n])=>`<a href="${u}">${n}</a>`).join('')}<a href="admin.html">Admin prototype</a></div></div>`}

const dockItems=[['index.html','Home','home'],['vision.html','Vision','vision'],['impact.html','Impact','impact'],['community.html','Engage','community']];
document.body.insertAdjacentHTML('beforeend',`<nav class="mobile-dock" aria-label="Quick navigation">${dockItems.map(([u,n,i])=>`<a href="${u}" class="${current===u?'active':''}"><svg viewBox="0 0 24 24">${icon(i)}</svg><span>${n}</span></a>`).join('')}</nav>`);

const foot=document.querySelector('[data-site-footer]');
if(foot){foot.innerHTML=`<footer class="footer"><div class="container"><div class="footer-grid"><div><div class="brand"><span class="brand-mark" style="background:#fff;color:#073c2b">BE</span><span class="brand-copy">Budadiri East<span style="color:rgba(255,255,255,.56)">Transparent. Visible. Accountable.</span></span></div><p style="max-width:430px;color:rgba(255,255,255,.64);margin-top:18px">A digital constituency platform built around productive households, education, connectivity, climate resilience and inclusive local development.</p></div><div><h4>Explore</h4><a href="vision.html">Vision & pillars</a><a href="impact.html">People's Dashboard</a><a href="parliament.html">In Parliament</a><a href="media.html">Media archive</a></div><div><h4>Participate</h4><a href="community.html#submit">Raise an issue</a><a href="community.html#opportunities">Opportunities</a><a href="community.html#engagements">Engagements</a><a href="resources.html">Development resources</a></div><div><h4>Office</h4><a href="about.html">About Hon. Nakiyi</a><a href="admin.html">Admin prototype</a><a href="resources.html#sources">Sources & references</a><a href="https://www.tiktok.com/@hon.nakiyi.julius" target="_blank" rel="noopener">TikTok ↗</a></div></div><div class="footer-bottom"><span>Prototype website • Budadiri County East, Sironko District, Uganda</span><span>Official contacts and final project-status data require verification before public launch.</span></div></div></footer>`}

// header, menu, scroll state
const header=document.querySelector('.header');
const progress=document.querySelector('.scroll-progress span');
let lastY=0;
function onScroll(){
  const y=window.scrollY||0;
  if(header) header.classList.toggle('scrolled',y>18);
  if(progress){const max=document.documentElement.scrollHeight-innerHeight; progress.style.width=(max?Math.min(100,(y/max)*100):0)+'%'}
  lastY=y;
}
addEventListener('scroll',onScroll,{passive:true});onScroll();
const mb=document.querySelector('.menu-btn'), mm=document.querySelector('.mobile-menu');
function toggleMenu(force){if(!mb||!mm)return;const open=typeof force==='boolean'?force:!mm.classList.contains('open');mm.classList.toggle('open',open);mb.classList.toggle('open',open);mb.setAttribute('aria-expanded',String(open));mm.setAttribute('aria-hidden',String(!open));document.body.style.overflow=open?'hidden':''}
if(mb)mb.addEventListener('click',()=>toggleMenu());
if(mm)mm.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));
addEventListener('keydown',e=>{if(e.key==='Escape')toggleMenu(false)});

// stagger card groups automatically
['.grid-3','.grid-4','.progress-list','.feature-list'].forEach(sel=>document.querySelectorAll(sel).forEach(group=>{[...group.children].forEach((el,i)=>{if(el.classList.contains('reveal')&&!el.dataset.delay)el.dataset.delay=String(Math.min(5,(i%6)+1))})}));

// reveal observer
const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!prefersReduced&&'IntersectionObserver' in window){
 const io=new IntersectionObserver((entries,o)=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');o.unobserve(e.target)}}),{threshold:.11,rootMargin:'0px 0px -5%'});
 document.querySelectorAll('.reveal,.reveal-left').forEach(el=>io.observe(el));
}else document.querySelectorAll('.reveal,.reveal-left').forEach(el=>el.classList.add('in'));

// before / after compare
const ba=document.querySelector('.beforeafter input');
if(ba){const root=ba.closest('.beforeafter'),after=root.querySelector('.after'),div=root.querySelector('.divider'),handle=root.querySelector('.handle');const set=v=>{after.style.clipPath=`inset(0 ${100-v}% 0 0)`;div.style.left=v+'%';handle.style.left=v+'%'};ba.addEventListener('input',e=>set(+e.target.value));set(+ba.value)}

// hero parallax - subtle only on pointer devices
const heroPhoto=document.querySelector('.hero-photo');
const heroWrap=document.querySelector('.hero-photo-wrap');
if(heroPhoto&&heroWrap&&matchMedia('(hover:hover) and (pointer:fine)').matches&&!prefersReduced){
 heroWrap.addEventListener('pointermove',e=>{const r=heroWrap.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;heroPhoto.style.transform=`translate3d(${x*7}px,${y*7}px,0) rotateX(${y*-1.4}deg) rotateY(${x*1.6}deg)`});
 heroWrap.addEventListener('pointerleave',()=>heroPhoto.style.transform='');
}

// subtle tilt on cards for desktop
if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!prefersReduced){document.querySelectorAll('.pillar,.photo-card').forEach(card=>{card.classList.add('tilt');card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.setProperty('--ry',(x*2.7)+'deg');card.style.setProperty('--rx',(y*-2.2)+'deg')});card.addEventListener('pointerleave',()=>{card.style.setProperty('--ry','0deg');card.style.setProperty('--rx','0deg')})})}

// animated numeric stats (leaves 24/7 etc intact)
document.querySelectorAll('.stat strong').forEach(el=>{const raw=el.textContent.trim();const m=raw.match(/^(\d+)(.*)$/);if(!m||prefersReduced)return;const end=+m[1],suffix=m[2];el.textContent='0'+suffix;const run=()=>{const start=performance.now(),dur=900;function tick(t){const p=Math.min(1,(t-start)/dur),v=Math.round(end*(1-Math.pow(1-p,3)));el.textContent=v+suffix;if(p<1)requestAnimationFrame(tick)}requestAnimationFrame(tick)};if('IntersectionObserver'in window){new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){run();o.disconnect()}}),{threshold:.7}).observe(el)}else run()});

// issue form prototype
const form=document.querySelector('#issueForm');
if(form){form.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(form),obj=Object.fromEntries(fd.entries());obj.ref='BE-'+new Date().toISOString().slice(2,10).replaceAll('-','')+'-'+Math.random().toString(36).slice(2,6).toUpperCase();obj.created=new Date().toISOString();const arr=JSON.parse(localStorage.getItem('budadiriIssues')||'[]');arr.unshift(obj);localStorage.setItem('budadiriIssues',JSON.stringify(arr));const out=document.querySelector('#formResult');if(out){out.innerHTML=`<strong>Issue recorded.</strong><br>Your prototype reference is <b>${obj.ref}</b>. In the live version, this would be sent securely to the constituency office and acknowledged by SMS/WhatsApp.`;out.style.display='block';out.scrollIntoView({behavior:'smooth',block:'nearest'})}form.reset()})}

// Make pillar cards swipe naturally on phones
const pg=document.querySelector('.grid-3');if(pg&&pg.querySelector('.pillar'))pg.classList.add('pillars-scroll');

// Smooth in-page anchors while respecting fixed header
addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute('href');if(id==='#')return;const t=document.querySelector(id);if(t){e.preventDefault();const top=t.getBoundingClientRect().top+scrollY-92;scrollTo({top,behavior:prefersReduced?'auto':'smooth'})}});
})();
