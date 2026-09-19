(() => {
  const symbols = {oval:'⬭',square:'□','arrow-right':'→','arrow-left':'←','arrow-up':'↑','arrow-down':'↓','chevron-right':'›','chevron-left':'‹',pentagon:'⬠',hexagon:'⬡',star:'★',banner:'▰',plus:'＋',minus:'−'};

  function shapePreview(shape) {
    const id=shape.id;
    const simple=['rectangle','rounded','circle','triangle','line','diamond'].includes(id);
    if(simple) return `<span class="shape-preview ${id==='rectangle'?'':id}"></span>`;
    return `<span class="shape-preview arrow">${symbols[id]||'◇'}</span>`;
  }

  function refreshLucide(){if(window.lucide?.createIcons)window.lucide.createIcons({attrs:{width:22,height:22,'stroke-width':2}})}

  window.addAssetShape=function(id){
    if(typeof window.baseElement!=='function')return;
    const el=window.baseElement();
    el.classList.add('shape-element');
    el.style.display='grid';el.style.placeItems='center';el.style.border='0';el.style.fontSize='52px';el.style.lineHeight='1';el.style.color='#194d3b';
    if(id==='oval'){el.style.width='120px';el.style.height='70px';el.style.border='2px solid #194d3b';el.style.borderRadius='50%'}
    else if(id==='square'){el.style.width='80px';el.style.height='80px';el.style.border='2px solid #194d3b'}
    else {el.textContent=symbols[id]||'◇';el.style.width='80px';el.style.height='70px'}
    el.onpointerdown=window.startDrag;el.addEventListener('pointerdown',()=>window.selectEl(el));window.page.appendChild(el);window.selectEl(el);
  };

  window.addLucideResumeIcon=function(id){
    if(typeof window.baseElement!=='function')return;
    const el=window.baseElement();el.classList.add('icon-element');el.innerHTML=`<i data-lucide="${id}"></i>`;
    el.style.color='#194d3b';el.onpointerdown=window.startDrag;el.addEventListener('pointerdown',()=>window.selectEl(el));window.page.appendChild(el);window.selectEl(el);refreshLucide();
  };

  function populate(){
    const shapeGrid=document.getElementById('shapeGrid'),iconGrid=document.getElementById('iconGrid');
    if(!shapeGrid||!iconGrid||!window.MB_RESUME_SHAPES||!window.MB_RESUME_ICONS)return;
    shapeGrid.innerHTML=window.MB_RESUME_SHAPES.map(s=>`<button class="picker-item" type="button" data-asset-shape="${s.id}" title="${s.label}">${shapePreview(s)}</button>`).join('');
    iconGrid.innerHTML=window.MB_RESUME_ICONS.map(i=>`<button class="picker-item" type="button" data-asset-icon="${i.id}" title="${i.label}"><i data-lucide="${i.id}"></i></button>`).join('');
    refreshLucide();
    shapeGrid.onclick=e=>{const b=e.target.closest('[data-asset-shape]');if(!b)return;const id=b.dataset.assetShape,legacy={rectangle:'rectangle',rounded:'rounded',circle:'circle',triangle:'triangle',line:'line',diamond:'diamond','arrow-right':'arrow'};legacy[id]?window.addShape(legacy[id]):window.addAssetShape(id)};
    iconGrid.onclick=e=>{const b=e.target.closest('[data-asset-icon]');if(b)window.addLucideResumeIcon(b.dataset.assetIcon)};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',populate);else populate();
})();