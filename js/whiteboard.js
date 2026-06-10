const CURSORS = {
  pen: "url('data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="4" cy="4" r="3" fill="rgba(108,92,231,0.6)" stroke="white" stroke-width="1"/><line x1="7" y1="7" x2="28" y2="28" stroke="rgba(108,92,231,0.4)" stroke-width="1" stroke-dasharray="3,2"/></svg>') + "') 4 4, crosshair",
  eraser: "url('data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="2" y="2" width="12" height="12" rx="2" fill="rgba(255,107,107,0.5)" stroke="white" stroke-width="1"/><line x1="14" y1="14" x2="28" y2="28" stroke="rgba(255,107,107,0.3)" stroke-width="1" stroke-dasharray="3,2"/></svg>') + "') 8 8, crosshair",
  highlighter: "url('data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="2" y="8" width="20" height="6" rx="1" fill="rgba(255,169,77,0.5)" stroke="white" stroke-width="1" transform="rotate(-15 12 11)"/></svg>') + "') 4 4, crosshair",
  line: "url('data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><line x1="4" y1="28" x2="28" y2="4" stroke="rgba(0,214,143,0.6)" stroke-width="2"/><circle cx="28" cy="4" r="2" fill="rgba(0,214,143,0.8)"/></svg>') + "') 28 4, crosshair",
  arrow: "url('data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><line x1="4" y1="28" x2="28" y2="4" stroke="rgba(0,214,143,0.6)" stroke-width="2"/><polygon points="24,10 28,4 22,8" fill="rgba(0,214,143,0.8)"/></svg>') + "') 28 4, crosshair",
  rect: "url('data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" rx="2" fill="none" stroke="rgba(0,214,143,0.5)" stroke-width="2"/></svg>') + "') 16 16, crosshair",
  circle: "url('data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="none" stroke="rgba(0,214,143,0.5)" stroke-width="2"/></svg>') + "') 16 16, crosshair",
  triangle: "url('data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><polygon points="16,4 4,28 28,28" fill="none" stroke="rgba(0,214,143,0.5)" stroke-width="2"/></svg>') + "') 16 24, crosshair",
  text: "url('data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><text x="16" y="22" font-size="18" fill="rgba(108,92,231,0.7)" font-family="sans-serif" text-anchor="middle" font-weight="bold">T</text></svg>') + "') 16 16, crosshair",
  hand: 'grab',
  default: 'crosshair'
};

const WB = {
  canvas: null, ctx: null, gridCanvas: null, gridCtx: null,
  width: 800, height: 600,
  zoom: 1, panX: 0, panY: 0,
  tool: 'pen', color: '#6c5ce7', size: 5, opacity: 1,
  isDrawing: false, lastX: 0, lastY: 0,
  history: [], historyIndex: -1, maxHistory: 50,
  gridEnabled: false, gridSize: 30,
  startX: 0, startY: 0,
  savedState: null,
  qalamData: null,

  init(canvasId, gridId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.gridCanvas = document.getElementById(gridId);
    this.gridCtx = this.gridCanvas.getContext('2d');
    this.resize();
    this.bindEvents();
    this.saveState();
    this.drawGrid();
    this.setCursor();

    document.getElementById('zoomInBtn')?.addEventListener('click', () => this.zoomIn());
    document.getElementById('zoomOutBtn')?.addEventListener('click', () => this.zoomOut());
    document.getElementById('zoomResetBtn')?.addEventListener('click', () => this.zoomReset());
  },

  resize() {
    const wrap = this.canvas.parentElement;
    this.width = wrap.clientWidth;
    this.height = wrap.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.gridCanvas.width = this.width;
    this.gridCanvas.height = this.height;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.render();
  },

  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    let cx, cy;
    if (e.touches && e.touches.length > 0) {
      cx = e.touches[0].clientX - rect.left;
      cy = e.touches[0].clientY - rect.top;
    } else {
      cx = e.clientX - rect.left;
      cy = e.clientY - rect.top;
    }
    return { x: (cx - this.panX) / this.zoom, y: (cy - this.panY) / this.zoom };
  },

  setTool(t) {
    this.tool = t;
    this.setCursor();
    const names = { pen:'قلم', eraser:'ممحاة', highlighter:'هايلايتر', line:'خط',
      arrow:'سهم', rect:'مستطيل', circle:'دائرة', triangle:'مثلث', text:'نص', hand:'تحريك' };
    document.getElementById('statusTool').textContent = names[t] || t;
  },

  setCursor() {
    const c = CURSORS[this.tool] || CURSORS.default;
    this.canvas.style.cursor = c;
  },

  setColor(c) { this.color = c; document.getElementById('statusColor').textContent = c; },
  setSize(s) { this.size = Math.max(1, Math.min(100, s)); document.getElementById('statusSize').textContent = s + 'px'; },

  updateStatus(msg) {
    const el = document.getElementById('statusMsg');
    if (el) el.textContent = msg || 'جاهز';
  },

  bindEvents() {
    const c = this.canvas;
    c.addEventListener('mousedown', e => this.pointerDown(e));
    c.addEventListener('mousemove', e => this.pointerMove(e));
    c.addEventListener('mouseup', e => this.pointerUp(e));
    c.addEventListener('mouseleave', e => { if (this.isDrawing) this.finishShape(), this.pointerUp(e); });
    c.addEventListener('touchstart', e => { e.preventDefault(); this.pointerDown(e); }, { passive: false });
    c.addEventListener('touchmove', e => { e.preventDefault(); this.pointerMove(e); }, { passive: false });
    c.addEventListener('touchend', e => this.pointerUp(e));
  },

  pointerDown(e) {
    const pos = this.getPos(e);
    this.isDrawing = true;
    this.lastX = pos.x; this.lastY = pos.y;
    this.startX = pos.x; this.startY = pos.y;

    if (this.tool === 'hand') {
      this._dragStartX = e.clientX - this.panX;
      this._dragStartY = e.clientY - this.panY;
    }

    if (['pen','eraser','highlighter'].includes(this.tool)) {
      this.ctx.beginPath(); this.ctx.moveTo(pos.x, pos.y);
    }

    if (['line','arrow','rect','circle','triangle'].includes(this.tool)) {
      this.savedState = this.ctx.getImageData(0, 0, this.width, this.height);
    }

    if (this.tool === 'text') {
      const text = prompt('أدخل النص:', 'نص');
      if (text) { this.drawText(pos.x, pos.y, text); this.saveState(); }
      this.isDrawing = false;
    }
  },

  pointerMove(e) {
    const pos = this.getPos(e);
    if (this.tool === 'hand' && this.isDrawing) {
      this.panX = e.clientX - this._dragStartX;
      this.panY = e.clientY - this._dragStartY;
      this.render(); return;
    }
    if (!this.isDrawing) return;

    if (['pen','eraser','highlighter'].includes(this.tool)) {
      this.ctx.beginPath(); this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(pos.x, pos.y);
      if (this.tool === 'eraser') { this.ctx.strokeStyle = '#ffffff'; this.ctx.lineWidth = this.size * 4; }
      else if (this.tool === 'highlighter') { this.ctx.strokeStyle = this.color; this.ctx.lineWidth = this.size * 3; this.ctx.globalAlpha = 0.3; }
      else { this.ctx.strokeStyle = this.color; this.ctx.lineWidth = this.size; this.ctx.globalAlpha = 1; }
      this.ctx.stroke(); this.ctx.globalAlpha = 1;
      this.lastX = pos.x; this.lastY = pos.y;
    }

    if (['line','arrow','rect','circle','triangle'].includes(this.tool)) {
      this.ctx.putImageData(this.savedState, 0, 0);
      this.drawShapePreview(this.tool, this.startX, this.startY, pos.x, pos.y);
    }
  },

  pointerUp(e) {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    if (['line','arrow','rect','circle','triangle'].includes(this.tool)) {
      const pos = this.getPos(e);
      this.drawShape(this.tool, this.startX, this.startY, pos.x, pos.y);
    }
    this.saveState();
    this.updateStatus('جاهز');
  },

  drawShapePreview(type, x1, y1, x2, y2) {
    const ctx = this.ctx; ctx.save();
    ctx.strokeStyle = this.color; ctx.lineWidth = this.size;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = 0.5;
    ctx.beginPath();
    if (type === 'line') { ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); }
    else if (type === 'arrow') { const a = Math.atan2(y2-y1, x2-x1), l = 15+this.size*2; ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2-l*Math.cos(a-0.4), y2-l*Math.sin(a-0.4)); ctx.moveTo(x2, y2); ctx.lineTo(x2-l*Math.cos(a+0.4), y2-l*Math.sin(a+0.4)); ctx.stroke(); ctx.restore(); return; }
    else if (type === 'rect') { ctx.rect(Math.min(x1,x2), Math.min(y1,y2), Math.abs(x2-x1), Math.abs(y2-y1)); }
    else if (type === 'circle') { ctx.ellipse((x1+x2)/2, (y1+y2)/2, Math.abs(x2-x1)/2||1, Math.abs(y2-y1)/2||1, 0, 0, Math.PI*2); }
    else if (type === 'triangle') { ctx.moveTo((x1+x2)/2, Math.min(y1,y2)); ctx.lineTo(Math.min(x1,x2), Math.max(y1,y2)); ctx.lineTo(Math.max(x1,x2), Math.max(y1,y2)); ctx.closePath(); }
    ctx.stroke(); ctx.restore();
  },

  drawShape(type, x1, y1, x2, y2) {
    const ctx = this.ctx; ctx.save();
    ctx.strokeStyle = this.color; ctx.lineWidth = this.size;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    if (type === 'line') { ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
    else if (type === 'arrow') { const a = Math.atan2(y2-y1, x2-x1), l = 15+this.size*2; ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2-l*Math.cos(a-0.4), y2-l*Math.sin(a-0.4)); ctx.moveTo(x2, y2); ctx.lineTo(x2-l*Math.cos(a+0.4), y2-l*Math.sin(a+0.4)); ctx.stroke(); }
    else if (type === 'rect') { ctx.rect(Math.min(x1,x2), Math.min(y1,y2), Math.abs(x2-x1), Math.abs(y2-y1)); ctx.stroke(); }
    else if (type === 'circle') { ctx.ellipse((x1+x2)/2, (y1+y2)/2, Math.abs(x2-x1)/2||1, Math.abs(y2-y1)/2||1, 0, 0, Math.PI*2); ctx.stroke(); }
    else if (type === 'triangle') { ctx.moveTo((x1+x2)/2, Math.min(y1,y2)); ctx.lineTo(Math.min(x1,x2), Math.max(y1,y2)); ctx.lineTo(Math.max(x1,x2), Math.max(y1,y2)); ctx.closePath(); ctx.stroke(); }
    ctx.restore();
  },

  drawText(x, y, text) {
    this.ctx.save();
    this.ctx.font = `bold ${Math.max(14, this.size*4)}px Tajawal, sans-serif`;
    this.ctx.fillStyle = this.color;
    this.ctx.textAlign = 'right';
    this.ctx.fillText(text, x, y);
    this.ctx.restore();
  },

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.history = []; this.historyIndex = -1;
    this.saveState(); this.render();
  },

  saveState() {
    this.historyIndex++;
    this.history = this.history.slice(0, this.historyIndex);
    this.history.push(this.canvas.toDataURL());
    if (this.history.length > this.maxHistory) { this.history.shift(); this.historyIndex--; }
    this.updateUndoButtons();
  },

  undo() {
    if (this.historyIndex <= 0) return;
    this.historyIndex--; this.loadState(this.historyIndex);
    this.updateUndoButtons(); this.updateStatus('تراجع');
  },

  redo() {
    if (this.historyIndex >= this.history.length - 1) return;
    this.historyIndex++; this.loadState(this.historyIndex);
    this.updateUndoButtons(); this.updateStatus('إعادة');
  },

  loadState(idx) {
    const img = new Image();
    img.onload = () => { this.ctx.clearRect(0, 0, this.width, this.height); this.ctx.drawImage(img, 0, 0); };
    img.src = this.history[idx];
  },

  updateUndoButtons() {
    const u = document.getElementById('undoBtn'), r = document.getElementById('redoBtn');
    if (u) u.classList.toggle('disabled', this.historyIndex <= 0);
    if (r) r.classList.toggle('disabled', this.historyIndex >= this.history.length - 1);
  },

  render() {
    this.canvas.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    this.gridCanvas.style.transform = this.canvas.style.transform;
    this.drawGrid();
  },

  zoomIn() { this.zoom = Math.min(5, +(this.zoom+0.1).toFixed(2)); this.render(); this.updateZoomLabel(); },
  zoomOut() { this.zoom = Math.max(0.1, +(this.zoom-0.1).toFixed(2)); this.render(); this.updateZoomLabel(); },
  zoomReset() { this.zoom = 1; this.panX = 0; this.panY = 0; this.render(); this.updateZoomLabel(); },
  updateZoomLabel() { const el = document.getElementById('zoomLabel'); if (el) el.textContent = Math.round(this.zoom*100)+'%'; },

  toggleGrid() { this.gridEnabled = !this.gridEnabled; this.drawGrid(); return this.gridEnabled; },

  drawGrid() {
    const ctx = this.gridCtx; ctx.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);
    if (!this.gridEnabled) return;
    ctx.strokeStyle = 'rgba(148,163,184,0.15)'; ctx.lineWidth = 0.5;
    const gs = this.gridSize * this.zoom, ox = this.panX % gs, oy = this.panY % gs;
    for (let x = ox; x < this.width; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.height); ctx.stroke(); }
    for (let y = oy; y < this.height; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke(); }
  },

  toDataURL() { return this.canvas.toDataURL(); },

  /* ─── Export / Import ─── */
  exportQalam(name) {
    const data = {
      version: '1.0',
      name: name || 'لوحة',
      date: new Date().toISOString(),
      app: 'قلم',
      canvas: {
        width: this.width,
        height: this.height,
        dataURL: this.canvas.toDataURL('image/png')
      },
      state: {
        tool: this.tool,
        color: this.color,
        size: this.size,
        zoom: this.zoom,
        panX: this.panX,
        panY: this.panY
      }
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = (name || 'board') + '.qalam';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    this.updateStatus('تم التصدير .qalam');
    return data;
  },

  importQalam(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.canvas || !data.canvas.dataURL) {
          alert('ملف .qalam غير صالح');
          return;
        }
        this.qalamData = data;
        const img = new Image();
        img.onload = () => {
          this.ctx.clearRect(0, 0, this.width, this.height);
          this.ctx.drawImage(img, 0, 0);
          if (data.state) {
            if (data.state.zoom) this.zoom = data.state.zoom;
            if (data.state.panX !== undefined) this.panX = data.state.panX;
            if (data.state.panY !== undefined) this.panY = data.state.panY;
            this.render();
            this.updateZoomLabel();
          }
          this.saveState();
          this.updateStatus('تم استيراد ' + (data.name || 'ملف'));
          if (callback) callback(data);
        };
        img.onerror = () => alert('فشل تحميل الصورة من الملف');
        img.src = data.canvas.dataURL;
      } catch (err) {
        alert('خطأ في قراءة الملف: ' + err.message);
      }
    };
    reader.readAsText(file);
  },

  exportPNG() {
    const link = document.createElement('a');
    link.download = 'board.png';
    link.href = this.canvas.toDataURL('image/png');
    link.click(); this.updateStatus('تم التصدير PNG');
  },

  exportJPG() {
    const tmp = document.createElement('canvas');
    tmp.width = this.width; tmp.height = this.height;
    const tctx = tmp.getContext('2d');
    tctx.fillStyle = '#ffffff'; tctx.fillRect(0,0,tmp.width,tmp.height);
    tctx.drawImage(this.canvas, 0, 0);
    const link = document.createElement('a');
    link.download = 'board.jpg';
    link.href = tmp.toDataURL('image/jpeg', 0.95);
    link.click(); this.updateStatus('تم التصدير JPG');
  }
};
