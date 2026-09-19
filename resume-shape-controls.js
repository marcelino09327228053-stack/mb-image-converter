// Shape-only controls for the MB Resume Editor.
// Does not modify text or icon behavior.
(() => {
  const page = document.getElementById('page');
  const panel = document.getElementById('shapeIconPanel');
  if (!page || !panel) return;

  const style = document.createElement('style');
  style.textContent = `
    .shape-tools{display:none;border-top:1px solid #e1e5e3;margin-top:10px;padding-top:10px}
    .shape-tools.show{display:block}
    .shape-tools-title{font-size:11px;font-weight:800;color:#68736d;margin-bottom:7px}
    .shape-tool-row{display:flex;align-items:center;gap:7px;margin-bottom:8px}
    .shape-mode{flex:1;border:1px solid #d8dfe2;background:#fff;border-radius:8px;padding:8px;font-weight:800;cursor:pointer}
    .shape-mode.active{background:#194d3b;color:#fff;border-color:#194d3b}
    .shape-color{width:48px;height:38px;border:0;background:transparent;cursor:pointer}
    .shape-element.shape-controlled{min-width:20px;min-height:20px}
    .shape-control-delete,.shape-control-resize{display:none;position:absolute;z-index:60;user-select:none;touch-action:none}
    .shape-element.selected .shape-control-delete,.shape-element.selected .shape-control-resize{display:block}
    .shape-control-delete{right:-17px;top:-17px;width:30px;height:30px;padding:0;border:2px solid #fff;border-radius:50%;background:#c93636;color:#fff;font:700 20px/26px Arial,sans-serif;text-align:center;cursor:pointer;box-shadow:0 1px 4px #0003}
    .shape-control-resize{right:-7px;bottom:-7px;width:15px;height:15px;border:2px solid #fff;border-radius:3px;background:#194d3b;cursor:nwse-resize}
  `;
  document.head.appendChild(style);

  const tools = document.createElement('div');
  tools.className = 'shape-tools';
  tools.innerHTML = `<div class="shape-tools-title">Shape style</div><div class="shape-tool-row"><button type="button" class="shape-mode active" data-shape-mode="line">Line Only</button><button type="button" class="shape-mode" data-shape-mode="fill">Fill</button></div><div class="shape-tool-row"><input class="shape-color" id="shapeColor" type="color" value="#194d3b"><span id="shapeColorValue">#194d3b</span></div>`;
  panel.appendChild(tools);

  const color = tools.querySelector('#shapeColor');
  const colorValue = tools.querySelector('#shapeColorValue');
  let active = null;
  let resizing = null;
  let sx=0, sy=0, sw=0, sh=0;

  function isShape(el){ return !!el?.classList?.contains('shape-element'); }
  function currentColor(el){ return el?.dataset.shapeColor || '#194d3b'; }
  function applyVisual(el){
    if (!isShape(el)) return;
    const c=currentColor(el), mode=el.dataset.shapeMode || 'line';
    const kind=[...el.classList].find(x=>!['element','shape-element','selected','shape-controlled'].includes(x)) || '';
    el.style.color=c;
    if(kind==='line'){el.style.borderTopColor=c;return;}
    if(kind==='triangle'){el.style.borderBottomColor=c;return;}
    if(kind==='diamond'){el.style.background=c;return;}
    if(kind==='arrow'){el.style.color=c;return;}
    el.style.borderColor=c;
    el.style.backgroundColor=mode==='fill'?c:'transparent';
  }
  function syncTools(el){
    active=isShape(el)?el:null;
    tools.classList.toggle('show',!!active);
    if(!active)return;
    active.dataset.shapeMode ||= 'line'; active.dataset.shapeColor ||= '#194d3b';
    color.value=active.dataset.shapeColor;colorValue.textContent=color.value;
    tools.querySelectorAll('[data-shape-mode]').forEach(b=>b.classList.toggle('active',b.dataset.shapeMode===active.dataset.shapeMode));
  }
  function addControls(el){
    if(!isShape(el)||el.classList.contains('shape-controlled'))return;
    el.classList.add('shape-controlled');el.dataset.shapeMode ||= 'line';el.dataset.shapeColor ||= '#194d3b';
    const del=document.createElement('button');del.type='button';del.className='shape-control-delete';del.textContent='×';del.title='Delete shape';
    const resize=document.createElement('div');resize.className='shape-control-resize';resize.title='Resize shape';
    del.onpointerdown=e=>{e.preventDefault();e.stopPropagation()};
    del.onclick=e=>{e.preventDefault();e.stopPropagation();el.remove();if(active===el)syncTools(null);if(!page.querySelector('.element'))document.getElementById('empty')?.style.setProperty('display','grid')};
    resize.onpointerdown=e=>{e.preventDefault();e.stopPropagation();resizing=el;syncTools(el);sx=e.clientX;sy=e.clientY;sw=el.offsetWidth;sh=el.offsetHeight};
    el.append(del,resize);applyVisual(el);
  }
  function scan(){page.querySelectorAll('.shape-element').forEach(addControls)}
  new MutationObserver(scan).observe(page,{childList:true,subtree:false});scan();

  page.addEventListener('pointerdown',e=>{
    const shape=e.target.closest?.('.shape-element');
    if(shape){setTimeout(()=>syncTools(shape),0)} else if(e.target===page) syncTools(null);
  });
  window.addEventListener('pointermove',e=>{
    if(!resizing)return;
    const left=parseFloat(resizing.style.left)||0,top=parseFloat(resizing.style.top)||0;
    resizing.style.width=Math.max(20,Math.min(page.clientWidth-left,sw+e.clientX-sx))+'px';
    resizing.style.height=Math.max(20,Math.min(page.clientHeight-top,sh+e.clientY-sy))+'px';
  });
  window.addEventListener('pointerup',()=>resizing=null);
  tools.querySelectorAll('[data-shape-mode]').forEach(b=>b.onclick=()=>{if(!active)return;active.dataset.shapeMode=b.dataset.shapeMode;tools.querySelectorAll('[data-shape-mode]').forEach(x=>x.classList.toggle('active',x===b));applyVisual(active)});
  color.addEventListener('input',()=>{if(!active)return;active.dataset.shapeColor=color.value;colorValue.textContent=color.value;applyVisual(active)});
})();
