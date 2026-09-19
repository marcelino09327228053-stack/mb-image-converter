// Icon controls for the MB Resume Editor.
// Adds immediate color editing plus move/delete/proportional resize handles.
(() => {
  const page=document.getElementById('page'),panel=document.getElementById('shapeIconPanel');
  if(!page||!panel)return;

  const style=document.createElement('style');
  style.textContent=`
    .icon-tools{display:block;border-top:1px solid #e1e5e3;margin-top:10px;padding-top:10px}
    .icon-tools-title{font-size:11px;font-weight:800;color:#68736d;margin-bottom:7px}
    .icon-tool-row{display:flex;align-items:center;gap:7px;margin-bottom:8px}
    .icon-tool-label{font-size:11px;font-weight:800;color:#68736d;white-space:nowrap}
    .icon-color{width:48px;height:38px;border:0;background:transparent;cursor:pointer}
    .icon-tools.no-icon .icon-color{opacity:.55}
    .icon-element.icon-controlled{min-width:22px;min-height:22px;box-sizing:border-box}
    .icon-element.icon-controlled>svg{width:100%;height:100%;display:block;stroke:currentColor}
    .icon-element.icon-controlled>.resume-brand-icon{width:100%!important;height:100%!important;font-size:clamp(12px,70%,28px)!important}
    .icon-control-move,.icon-control-delete,.icon-control-resize{display:none;position:absolute;z-index:110;user-select:none;touch-action:none}
    .icon-element.selected .icon-control-move,.icon-element.selected .icon-control-delete,.icon-element.selected .icon-control-resize{display:block}
    .icon-control-move{left:-38px;top:50%;transform:translateY(-50%);width:26px;height:26px;border:2px solid #fff;border-radius:50%;background:#194d3b;color:#fff;font:700 15px/22px Arial;text-align:center;cursor:grab;box-shadow:0 1px 4px #0004}
    .icon-control-delete{right:-16px;top:-16px;width:26px;height:26px;padding:0;border:2px solid #fff;border-radius:50%;background:#c93636;color:#fff;font:700 17px/22px Arial;text-align:center;cursor:pointer;box-shadow:0 1px 4px #0004}
    .icon-control-resize{right:-10px;bottom:-10px;width:19px;height:19px;border:2px solid #fff;border-radius:4px;background:#194d3b;cursor:nwse-resize;box-shadow:0 1px 4px #0004}
  `;
  document.head.appendChild(style);

  const tools=document.createElement('div');
  tools.className='icon-tools no-icon';
  tools.innerHTML=`<div class="icon-tools-title">Icon style</div><div class="icon-tool-row"><span class="icon-tool-label">Color</span><input class="icon-color" id="iconColor" type="color" value="#194d3b"><span id="iconColorValue">#194d3b</span></div>`;
  panel.appendChild(tools);
  const color=tools.querySelector('#iconColor'),colorValue=tools.querySelector('#iconColorValue');
  let active=null,resizing=null,startX=0,startW=0,startH=0,ratio=1;
  const isIcon=el=>!!el?.classList?.contains('icon-element');

  function applyColor(el){if(!isIcon(el))return;const c=el.dataset.iconColor||'#194d3b';el.style.color=c;el.querySelectorAll('svg').forEach(svg=>{svg.style.stroke=c;svg.style.color=c});const brand=el.querySelector('.resume-brand-icon');if(brand)brand.style.color=c}
  function sync(el){active=isIcon(el)?el:null;tools.classList.toggle('no-icon',!active);if(!active)return;active.dataset.iconColor||='#194d3b';color.value=active.dataset.iconColor;colorValue.textContent=color.value}
  function activate(el){if(!isIcon(el))return;page.querySelectorAll('.element').forEach(x=>x.classList.remove('selected'));el.classList.add('selected');sync(el)}
  function addControls(el){
    if(!isIcon(el)||el.classList.contains('icon-controlled'))return;
    el.classList.add('icon-controlled');el.dataset.iconColor||='#194d3b';
    const move=document.createElement('div');move.className='icon-control-move';move.textContent='✥';move.title='Move icon';
    const del=document.createElement('button');del.type='button';del.className='icon-control-delete';del.textContent='×';del.title='Delete icon';
    const resize=document.createElement('div');resize.className='icon-control-resize';resize.title='Resize icon';
    move.onpointerdown=e=>{e.preventDefault();e.stopPropagation();window.startDrag?.({preventDefault(){},stopPropagation(){},currentTarget:el,clientX:e.clientX,clientY:e.clientY})};
    del.onpointerdown=e=>{e.preventDefault();e.stopPropagation()};
    del.onclick=e=>{e.preventDefault();e.stopPropagation();el.remove();if(active===el){active=null;tools.classList.add('no-icon')}if(!page.querySelector('.element'))document.getElementById('empty')?.style.setProperty('display','grid')};
    resize.onpointerdown=e=>{e.preventDefault();e.stopPropagation();resizing=el;activate(el);startX=e.clientX;startW=el.offsetWidth;startH=el.offsetHeight;ratio=startW/Math.max(startH,1)};
    el.append(move,del,resize);applyColor(el);
  }
  function scan(){let newest=null;page.querySelectorAll('.icon-element').forEach(el=>{if(!el.classList.contains('icon-controlled')){addControls(el);newest=el}});if(newest)requestAnimationFrame(()=>activate(newest))}
  new MutationObserver(scan).observe(page,{childList:true,subtree:false});scan();
  page.addEventListener('pointerdown',e=>{const icon=e.target.closest?.('.icon-element');if(icon)setTimeout(()=>sync(icon),0);else if(e.target===page){active=null;tools.classList.add('no-icon')}});
  window.addEventListener('pointermove',e=>{if(!resizing)return;const left=parseFloat(resizing.style.left)||0,top=parseFloat(resizing.style.top)||0;let w=Math.max(22,startW+(e.clientX-startX)),h=w/ratio;if(left+w>page.clientWidth){w=page.clientWidth-left;h=w/ratio}if(top+h>page.clientHeight){h=page.clientHeight-top;w=h*ratio}resizing.style.width=w+'px';resizing.style.height=h+'px'});
  window.addEventListener('pointerup',()=>resizing=null);
  color.addEventListener('input',()=>{if(!active)return;active.dataset.iconColor=color.value;colorValue.textContent=color.value;applyColor(active)});
})();
