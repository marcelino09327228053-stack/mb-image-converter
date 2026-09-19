(() => {
  function shapePreview(shape) {
    const id = shape.id;
    const simple = ['rectangle','rounded','circle','triangle','line','diamond'].includes(id);
    if (simple) return `<span class="shape-preview ${id === 'rectangle' ? '' : id}"></span>`;
    const symbols = {
      oval:'⬭', square:'□', 'arrow-right':'→', 'arrow-left':'←', 'arrow-up':'↑', 'arrow-down':'↓',
      'chevron-right':'›', 'chevron-left':'‹', pentagon:'⬠', hexagon:'⬡', star:'★', banner:'▰', plus:'＋', minus:'−'
    };
    return `<span class="shape-preview arrow">${symbols[id] || '◇'}</span>`;
  }

  function refreshLucide() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({attrs:{width:22,height:22,'stroke-width':2}});
    }
  }

  function populate() {
    const shapeGrid = document.getElementById('shapeGrid');
    const iconGrid = document.getElementById('iconGrid');
    if (!shapeGrid || !iconGrid || !window.MB_RESUME_SHAPES || !window.MB_RESUME_ICONS) return;

    shapeGrid.innerHTML = window.MB_RESUME_SHAPES.map(shape =>
      `<button class="picker-item mb-asset-shape" type="button" data-asset-shape="${shape.id}" title="${shape.label}" aria-label="${shape.label}">${shapePreview(shape)}</button>`
    ).join('');

    iconGrid.innerHTML = window.MB_RESUME_ICONS.map(icon =>
      `<button class="picker-item mb-asset-icon" type="button" data-asset-icon="${icon.id}" title="${icon.label}" aria-label="${icon.label}"><i data-lucide="${icon.id}"></i></button>`
    ).join('');

    refreshLucide();

    shapeGrid.addEventListener('click', e => {
      const button = e.target.closest('[data-asset-shape]');
      if (!button) return;
      const id = button.dataset.assetShape;
      const legacy = {rectangle:'rectangle',rounded:'rounded',circle:'circle',triangle:'triangle',line:'line',diamond:'diamond','arrow-right':'arrow'};
      if (legacy[id] && typeof window.addShape === 'function') return window.addShape(legacy[id]);
      if (typeof window.addAssetShape === 'function') return window.addAssetShape(id);
    });

    iconGrid.addEventListener('click', e => {
      const button = e.target.closest('[data-asset-icon]');
      if (!button) return;
      if (typeof window.addLucideResumeIcon === 'function') window.addLucideResumeIcon(button.dataset.assetIcon);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', populate);
  else populate();
})();
