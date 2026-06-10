let toastTimeout;
function showToast(msg) {
  const el = document.getElementById('globalToast');
  if (!el) return;
  clearTimeout(toastTimeout);
  el.textContent = msg;
  el.className = 'toast show';
  toastTimeout = setTimeout(() => el.className = 'toast', 2500);
}

document.addEventListener('DOMContentLoaded', () => {
  router.register('home', renderHomePage);
  router.register('board', () => {
    document.getElementById('boardPage').classList.add('active');
    setTimeout(() => { WB.resize(); WB.updateZoomLabel(); WB.updateUndoButtons(); }, 50);
  });
  router.register('gallery', renderGalleryPage);
  router.register('settings', renderSettingsPage);

  WB.init('mainCanvas', 'gridCanvas');

  const savedSettings = JSON.parse(localStorage.getItem('qalam_settings') || '{}');
  if (savedSettings.size) WB.setSize(savedSettings.size);
  if (savedSettings.color) { WB.setColor(savedSettings.color); }
  if (savedSettings.undo) WB.maxHistory = savedSettings.undo;
  document.getElementById('sizeSlider').value = WB.size;
  document.getElementById('sizeLabel').textContent = WB.size;

  document.querySelectorAll('.color-swatch').forEach(el => {
    el.addEventListener('click', () => {
      if (!el.dataset.color) return;
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      el.classList.add('active');
      WB.setColor(el.dataset.color);
    });
  });

  const customInput = document.getElementById('customColor');
  const customSwatch = customInput?.previousElementSibling;
  if (customSwatch && customInput) {
    customSwatch.addEventListener('click', () => customInput.click());
    customInput.addEventListener('input', e => {
      WB.setColor(e.target.value);
      customSwatch.style.background = e.target.value;
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      customSwatch.classList.add('active');
    });
  }

  document.getElementById('sizeSlider')?.addEventListener('input', e => {
    const v = parseInt(e.target.value);
    document.getElementById('sizeLabel').textContent = v;
    WB.setSize(v);
  });

  document.getElementById('undoBtn')?.addEventListener('click', () => WB.undo());
  document.getElementById('redoBtn')?.addEventListener('click', () => WB.redo());

  document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      WB.setTool(btn.dataset.tool);
    });
  });

  setupMenus();
  setupKeyboard();

  const tempBoard = localStorage.getItem('qalam_temp_board');
  if (tempBoard) {
    localStorage.removeItem('qalam_temp_board');
    const img = new Image();
    img.onload = () => {
      router.navigate('board');
      setTimeout(() => { WB.ctx.drawImage(img, 0, 0); WB.saveState(); }, 200);
    };
    img.src = tempBoard;
  } else {
    router.navigate('home');
  }
});

function setupMenus() {
  document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const dd = btn.nextElementSibling;
      const isOpen = dd.classList.contains('open');
      closeAllMenus();
      if (!isOpen) dd.classList.add('open');
    });
  });
  document.addEventListener('click', closeAllMenus);

  document.getElementById('menuHome')?.addEventListener('click', () => { closeAllMenus(); saveUnsavedPrompt(() => router.navigate('home')); });
  document.getElementById('menuNew')?.addEventListener('click', () => { closeAllMenus(); if (confirm('مسح السبورة وبدء لوحة جديدة؟')) { WB.clear(); WB.zoomReset(); } });
  document.getElementById('menuSave')?.addEventListener('click', () => { saveCurrentProject(); closeAllMenus(); });

  document.getElementById('menuExportQalam')?.addEventListener('click', () => {
    closeAllMenus();
    const name = prompt('اسم الملف:', 'لوحة');
    if (name) WB.exportQalam(name);
  });
  document.getElementById('menuExportPNG')?.addEventListener('click', () => { WB.exportPNG(); closeAllMenus(); });
  document.getElementById('menuExportJPG')?.addEventListener('click', () => { WB.exportJPG(); closeAllMenus(); });
  document.getElementById('menuImportQalam')?.addEventListener('click', () => {
    closeAllMenus();
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.qalam';
    input.onchange = e => {
      const file = e.target.files[0];
      if (file) { WB.importQalam(file, () => router.navigate('board')); }
    };
    input.click();
  });
  document.getElementById('menuEmbed')?.addEventListener('click', () => {
    closeAllMenus();
    const code = WB.getEmbedCode();
    const txt = document.createElement('textarea');
    txt.value = code; txt.style.width = '100%'; txt.style.height = '80px';
    txt.style.direction = 'ltr'; txt.style.fontSize = '11px';
    const div = document.createElement('div');
    div.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1a1a24;border:1px solid #2e2e42;border-radius:12px;padding:20px;z-index:9999;max-width:500px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.5);direction:rtl;';
    div.innerHTML = '<h3 style="margin-bottom:10px;font-size:14px;">🔗 كود التضمين (Embed)</h3><p style="font-size:12px;color:#9090a8;margin-bottom:8px;">انسخ هذا الكود وأضفه في موقعك لتضمين السبورة:</p>';
    div.appendChild(txt);
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ إغلاق'; closeBtn.style.cssText = 'margin-top:10px;background:#6c5ce7;color:#fff;border:none;padding:6px 16px;border-radius:8px;cursor:pointer;font-size:12px;';
    closeBtn.onclick = () => div.remove();
    div.appendChild(closeBtn);
    document.body.appendChild(div);
    txt.select(); txt.setSelectionRange(0, 99999);
  });

  document.getElementById('menuUndo')?.addEventListener('click', () => { WB.undo(); closeAllMenus(); });
  document.getElementById('menuRedo')?.addEventListener('click', () => { WB.redo(); closeAllMenus(); });
  document.getElementById('menuClear')?.addEventListener('click', () => { if (confirm('مسح السبورة بالكامل؟')) WB.clear(); closeAllMenus(); });
  document.getElementById('menuGrid')?.addEventListener('click', () => {
    const on = WB.toggleGrid();
    document.getElementById('menuGrid').textContent = on ? '✓ إخفاء الشبكة' : '☐ إظهار الشبكة';
    closeAllMenus();
  });
  document.getElementById('menuZoomIn')?.addEventListener('click', () => { WB.zoomIn(); closeAllMenus(); });
  document.getElementById('menuZoomOut')?.addEventListener('click', () => { WB.zoomOut(); closeAllMenus(); });
  document.getElementById('menuZoomReset')?.addEventListener('click', () => { WB.zoomReset(); closeAllMenus(); });
}

function saveUnsavedPrompt(cb) {
  if (confirm('هل تريد حفظ اللوحة الحالية قبل المغادرة؟')) saveCurrentProject();
  if (cb) cb();
}

function closeAllMenus() {
  document.querySelectorAll('.menu-dropdown.open').forEach(d => d.classList.remove('open'));
}

function setupKeyboard() {
  document.addEventListener('keydown', e => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod) {
      switch (e.key.toLowerCase()) {
        case 'z': e.preventDefault(); if (!e.shiftKey) WB.undo(); else WB.redo(); break;
        case 'y': e.preventDefault(); WB.redo(); break;
        case 's': e.preventDefault(); if (router.current === 'board') saveCurrentProject(); break;
        case 'n': e.preventDefault(); if (confirm('مسح السبورة؟')) { WB.clear(); WB.zoomReset(); } break;
        case 'e': e.preventDefault(); if (router.current === 'board') WB.exportPNG(); break;
        case '0': e.preventDefault(); WB.zoomReset(); break;
        case '=': case '+': e.preventDefault(); WB.zoomIn(); break;
        case '-': case '_': e.preventDefault(); WB.zoomOut(); break;
        case 'g': e.preventDefault(); const on = WB.toggleGrid(); const btn = document.getElementById('menuGrid'); if (btn) btn.textContent = on ? '✓ إخفاء الشبكة' : '☐ إظهار الشبكة'; break;
      }
    }
    if (!mod) {
      const map = { 'p':'pen', 'e':'eraser', 'h':'highlighter', 'l':'line', 'a':'arrow', 'r':'rect', 'c':'circle', 't':'triangle', 'n':'text', 'm':'hand', 'b':'connect' };
      const tool = map[e.key.toLowerCase()];
      if (tool) {
        document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`.tool-btn[data-tool="${tool}"]`);
        if (btn) { btn.classList.add('active'); WB.setTool(tool); }
      }
    }
  });
}

window.addEventListener('resize', () => {
  if (document.getElementById('boardPage')?.classList.contains('active')) WB.resize();
});
