const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const menuButton = $('#menuButton');
const mobileNav = $('#mobileNav');
menuButton?.addEventListener('click', () => mobileNav.classList.toggle('open'));
$$('#mobileNav a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
},{threshold:.08,rootMargin:'0px 0px -30px 0px'});
$$('.reveal').forEach(el => observer.observe(el));

const searchOverlay = $('#searchOverlay');
const searchInput = $('#searchInput');
const searchResults = $('#searchResults');
const pages = [
  {title:'核心功能', desc:'項目包、HTML 原型、PRD、評審、本地 MCP 與局域網分享', href:'#capabilities'},
  {title:'工作流', desc:'導入項目、瀏覽原型、對照 PRD、導出 AI 上下文', href:'#workflow'},
  {title:'AI 協作', desc:'Codex、Claude、本地 MCP 與結構化項目上下文', href:'#ai'},
  {title:'技術棧', desc:'React 19、Ant Design 6、TypeScript、Vite 6', href:'#stack'},
  {title:'快速開始', desc:'克隆倉庫並啓動本地開發環境', href:'#start'}
];
function renderResults(q=''){
  const query=q.trim().toLowerCase();
  const items=query ? pages.filter(x => `${x.title}${x.desc}`.toLowerCase().includes(query)) : pages;
  searchResults.innerHTML = items.length ? items.map(x=>`<a class="search-item" href="${x.href}"><b>${x.title}</b><small>${x.desc}</small></a>`).join('') : '<p>沒有找到相關內容。</p>';
  $$('.search-item',searchResults).forEach(a=>a.addEventListener('click',closeSearch));
}
function openSearch(){searchOverlay.hidden=false;renderResults();setTimeout(()=>searchInput.focus(),10)}
function closeSearch(){searchOverlay.hidden=true;searchInput.value=''}
$('#openSearch')?.addEventListener('click',openSearch);
$('#closeSearch')?.addEventListener('click',closeSearch);
searchOverlay?.addEventListener('click',e=>{if(e.target===searchOverlay)closeSearch()});
searchInput?.addEventListener('input',e=>renderResults(e.target.value));
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}if(e.key==='Escape'&&!searchOverlay.hidden)closeSearch()});

$('#copyCommand')?.addEventListener('click', async e => {
  const text='git clone https://github.com/JinPen-G/PEC.git';
  try{await navigator.clipboard.writeText(text);e.currentTarget.textContent='已複製';setTimeout(()=>e.currentTarget.textContent='複製',1200)}catch{e.currentTarget.textContent='請手動複製'}
});
