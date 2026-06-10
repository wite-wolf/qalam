function renderHomePage() {
  const container = document.getElementById('homeContent');
  const projects = getProjects();
  let cards = '';
  projects.forEach((p, i) => {
    cards += `
      <div class="project-card" data-idx="${i}">
        <div class="thumb" id="thumb-${i}">🖼</div>
        <div class="info">
          <div class="name">${p.name}</div>
          <div class="date">${p.date}</div>
          <div class="actions">
            <button class="open-btn" data-idx="${i}">✏ فتح</button>
            <button class="del-btn" data-idx="${i}">🗑 حذف</button>
          </div>
        </div>
      </div>`;
  });
  container.innerHTML = `
    <div class="home-header">
      <h1><img src="logo.png" alt=""> قلم - السبورة البيضاء</h1>
      <div class="actions">
        <button class="btn-primary" id="newBoardBtn">＋ لوحة جديدة</button>
        <button class="btn-secondary" id="galleryBtn">🖼 المعرض</button>
        <button class="btn-secondary" id="settingsBtn">⚙ الإعدادات</button>
      </div>
    </div>
    <div class="projects-grid">
      ${cards}
      <div class="new-board-card" id="newBoardCard">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        <span>لوحة جديدة</span>
      </div>
    </div>
  `;

  document.getElementById('newBoardBtn')?.addEventListener('click', openNewBoard);
  document.getElementById('newBoardCard')?.addEventListener('click', openNewBoard);
  document.getElementById('galleryBtn')?.addEventListener('click', () => router.navigate('gallery'));
  document.getElementById('settingsBtn')?.addEventListener('click', () => router.navigate('settings'));

  document.querySelectorAll('.open-btn').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    const idx = parseInt(b.dataset.idx);
    const projects = getProjects();
    loadProject(projects[idx]);
    router.navigate('board');
  }));
  document.querySelectorAll('.del-btn').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    if (!confirm('حذف هذه اللوحة؟')) return;
    const idx = parseInt(b.dataset.idx);
    const projects = getProjects();
    projects.splice(idx, 1);
    localStorage.setItem('qalam_projects', JSON.stringify(projects));
    renderHomePage();
  }));
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', function() {
      const idx = parseInt(this.dataset.idx);
      const projects = getProjects();
      loadProject(projects[idx]);
      router.navigate('board');
    });
  });

  projects.forEach((p, i) => {
    const thumb = document.getElementById('thumb-' + i);
    if (thumb && p.data) {
      const c = document.createElement('canvas');
      c.style.width = '100%'; c.style.height = '100%';
      thumb.innerHTML = '';
      thumb.appendChild(c);
      const img = new Image();
      img.onload = () => {
        c.width = img.width; c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, c.width, c.height);
      };
      img.src = p.data;
    }
  });
}
window.renderHomePage = renderHomePage;

function openNewBoard() {
  WB.clear();
  WB.zoomReset();
  router.navigate('board');
}

function getProjects() {
  try { return JSON.parse(localStorage.getItem('qalam_projects')) || []; }
  catch { return []; }
}

function saveCurrentProject() {
  const name = prompt('اسم اللوحة:', 'لوحة جديدة');
  if (!name) return;
  const projects = getProjects();
  projects.unshift({ name, date: new Date().toLocaleDateString('ar-SA'), data: WB.toDataURL() });
  localStorage.setItem('qalam_projects', JSON.stringify(projects));
  showToast('تم حفظ اللوحة');
}

function loadProject(p) {
  WB.clear();
  if (p && p.data) {
    const img = new Image();
    img.onload = () => { WB.ctx.drawImage(img, 0, 0); WB.saveState(); };
    img.src = p.data;
  }
}
