function renderGalleryPage() {
  const container = document.getElementById('galleryContent');
  const projects = getProjects();
  if (projects.length === 0) {
    container.innerHTML = `
      <div class="gallery-header">
        <h2>🖼 المعرض</h2>
        <button onclick="router.navigate('home')">← رجوع</button>
      </div>
      <div style="text-align:center;padding:60px 20px;color:#94a3b8;">
        <p style="font-size:16px;">لا توجد لوحات محفوظة</p>
        <p style="font-size:13px;margin-top:6px;">أنشئ لوحة جديدة واحفظها لتظهر هنا</p>
      </div>`;
    return;
  }
  let cards = '';
  projects.forEach((p, i) => {
    cards += `
      <div class="project-card" data-idx="${i}">
        <div class="thumb" id="gthumb-${i}">🖼</div>
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
    <div class="gallery-header">
      <h2>🖼 المعرض</h2>
      <button onclick="router.navigate('home')">← رجوع</button>
    </div>
    <div class="projects-grid" style="padding:0 40px 40px;">
      ${cards}
    </div>`;

  document.querySelectorAll('#galleryPage .open-btn').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    const idx = parseInt(b.dataset.idx);
    const projects = getProjects();
    loadProject(projects[idx]);
    router.navigate('board');
  }));
  document.querySelectorAll('#galleryPage .del-btn').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    if (!confirm('حذف هذه اللوحة؟')) return;
    const idx = parseInt(b.dataset.idx);
    const projects = getProjects();
    projects.splice(idx, 1);
    localStorage.setItem('qalam_projects', JSON.stringify(projects));
    renderGalleryPage();
  }));
  document.querySelectorAll('#galleryPage .project-card').forEach(card => {
    card.addEventListener('click', function() {
      const idx = parseInt(this.dataset.idx);
      const projects = getProjects();
      loadProject(projects[idx]);
      router.navigate('board');
    });
  });

  projects.forEach((p, i) => {
    const thumb = document.getElementById('gthumb-' + i);
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
window.renderGalleryPage = renderGalleryPage;
