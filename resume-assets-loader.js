(() => {
  const stroke = '#194d3b';

  const svgShapes = {
    pentagon: '<svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="50,7 94,39 77,92 23,92 6,39"/></svg>',
    hexagon: '<svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="25,8 75,8 96,50 75,92 25,92 4,50"/></svg>',
    star: '<svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="50,5 61,36 95,37 68,57 77,90 50,71 23,90 32,57 5,37 39,36"/></svg>',
    heart: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 88 C40 78 10 58 10 34 C10 17 30 10 42 22 L50 31 L58 22 C70 10 90 17 90 34 C90 58 60 78 50 88 Z"/></svg>'
  };

  function svgMarkup(id, preview=false) {
    const raw = svgShapes[id] || '';
    if (!raw) return '';
    return raw.replace('<svg ', `<svg class="${preview ? 'shape-svg-preview' : 'shape-svg'}" `);
  }

  function shapePreview(shape) {
    const id = shape.id;
    if (['rectangle','rounded','circle','triangle','line','diamond'].includes(id)) {
      return `<span class="shape-preview ${id === 'rectangle' ? '' : id}"></span>`;
    }
    if (id === 'square') return '<span class="shape-preview square"></span>';
    if (id === 'oval') return '<span class="shape-preview oval"></span>';
    return svgMarkup(id, true);
  }

  function refreshLucide(){if(window.lucide?.createIcons)window.lucide.createIcons({attrs:{width:22,height:22,'stroke-width':2}})}

  window.addAssetShape=function(id){
    if(typeof window.baseElement!=='function')return;
    const el=window.baseElement();
    el.classList.add('shape-element', id);
    el.dataset.shapeMode='line';
    el.dataset.shapeColor=stroke;
    el.style.width = id === 'oval' ? '120px' : '80px';
    el.style.height = id === 'oval' ? '70px' : '80px';
    el.style.padding='0';
    el.style.border='0';
    el.style.background='transparent';

    if(id==='oval') {
      el.style.border=`2px solid ${stroke}`;
      el.style.borderRadius='50%';
    } else if(id==='square') {
      el.style.border=`2px solid ${stroke}`;
    } else {
      el.innerHTML=svgMarkup(id);
      const svg=el.querySelector('svg');
      if(svg){
        svg.style.width='100%';svg.style.height='100%';svg.style.display='block';
        svg.querySelectorAll('polygon,path').forEach(node=>{
          node.setAttribute('fill','none');node.setAttribute('stroke',stroke);node.setAttribute('stroke-width','4');node.setAttribute('stroke-linejoin','round');
        });
      }
    }
    el.onpointerdown=window.startDrag;
    el.addEventListener('pointerdown',()=>window.selectEl(el));
    window.page.appendChild(el);window.selectEl(el);
  };

  window.addLucideResumeIcon=function(id){
    if(typeof window.baseElement!=='function')return;
    const el=window.baseElement();el.classList.add('icon-element');el.innerHTML=`<i data-lucide="${id}"></i>`;
    el.style.color=stroke;el.onpointerdown=window.startDrag;el.addEventListener('pointerdown',()=>window.selectEl(el));window.page.appendChild(el);window.selectEl(el);refreshLucide();
  };

  function populate(){
    const shapeGrid=document.getElementById('shapeGrid'),iconGrid=document.getElementById('iconGrid');
    if(!shapeGrid||!iconGrid||!window.MB_RESUME_SHAPES||!window.MB_RESUME_ICONS)return;
    shapeGrid.innerHTML=window.MB_RESUME_SHAPES.map(s=>`<button class="picker-item" type="button" data-asset-shape="${s.id}" title="${s.label}">${shapePreview(s)}</button>`).join('');
    iconGrid.innerHTML=window.MB_RESUME_ICONS.map(i=>`<button class="picker-item" type="button" data-asset-icon="${i.id}" title="${i.label}"><i data-lucide="${i.id}"></i></button>`).join('');
    refreshLucide();
    shapeGrid.onclick=e=>{
      const b=e.target.closest('[data-asset-shape]');if(!b)return;
      const id=b.dataset.assetShape;
      const legacy={rectangle:'rectangle',rounded:'rounded',circle:'circle',triangle:'triangle',line:'line',diamond:'diamond'};
      if(legacy[id]) {
        window.addShape(legacy[id]);
        const selected=window.page?.querySelector('.shape-element.selected');
        if(selected){selected.dataset.shapeMode='line';selected.dataset.shapeColor=stroke;if(!['triangle','diamond'].includes(id))selected.style.backgroundColor='transparent';}
      } else window.addAssetShape(id);
    };
    iconGrid.onclick=e=>{const b=e.target.closest('[data-asset-icon]');if(b)window.addLucideResumeIcon(b.dataset.assetIcon)};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',populate);else populate();
})();