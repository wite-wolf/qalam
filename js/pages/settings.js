function renderSettingsPage() {
  const container = document.getElementById('settingsContent');
  const saved = JSON.parse(localStorage.getItem('qalam_settings') || '{}');
  container.innerHTML = `
    <div class="settings-header">
      <h2>⚙ الإعدادات</h2>
      <button onclick="router.navigate('home')" style="background:none;border:none;color:var(--accent,#6c5ce7);cursor:pointer;font-size:13px;margin-top:4px;">← رجوع</button>
    </div>
    <div class="settings-body">
      <div class="settings-group">
        <label>اللغة</label>
        <select id="setLang">
          <option value="ar" ${saved.lang === 'ar' ? 'selected' : ''}>العربية</option>
          <option value="en" ${saved.lang === 'en' ? 'selected' : ''}>English</option>
        </select>
      </div>
      <div class="settings-group">
        <label>حجم القلم الافتراضي</label>
        <select id="setSize">
          ${[2,3,4,5,6,8,10,12,16,20].map(v =>
            `<option value="${v}" ${(saved.size || 5) == v ? 'selected' : ''}>${v}px</option>`
          ).join('')}
        </select>
      </div>
      <div class="settings-group">
        <label>اللون الافتراضي</label>
        <input type="color" id="setColor" value="${saved.color || '#6c5ce7'}">
      </div>
      <div class="settings-group">
        <label>إظهار الشبكة تلقائياً</label>
        <select id="setGrid">
          <option value="0" ${!saved.grid ? 'selected' : ''}>لا</option>
          <option value="1" ${saved.grid ? 'selected' : ''}>نعم</option>
        </select>
      </div>
      <div class="settings-group">
        <label>عدد مرات التراجع (Undo)</label>
        <select id="setUndo">
          ${[10,20,30,50,100].map(v =>
            `<option value="${v}" ${(saved.undo || 50) == v ? 'selected' : ''}>${v}</option>`
          ).join('')}
        </select>
      </div>
      <button class="btn-primary" id="saveSettingsBtn" style="margin-top:8px;">💾 حفظ الإعدادات</button>

      <div style="margin-top:32px;padding-top:20px;border-top:1px solid var(--border,#2e2e42);">
        <h3 style="font-size:15px;color:var(--text-primary,#f0f0f5);margin-bottom:12px;">ℹ عن التطبيق</h3>
        <div style="font-size:13px;color:var(--text-muted,#9090a8);line-height:1.7;">
          <p><strong style="color:var(--text-primary,#f0f0f5);">قلم</strong> - السبورة البيضاء الذكية</p>
          <p>الإصدار: 1.0.0</p>
          <p>الترخيص: MIT</p>
          <p style="margin-top:8px;">المطور: <strong style="color:var(--accent,#6c5ce7);">wite wolf</strong></p>
          <p>التواصل: <a href="https://t.me/j49_c" target="_blank" style="color:var(--accent,#6c5ce7);text-decoration:none;">@j49_c</a></p>
          <p style="margin-top:6px;">
            <a href="https://github.com/wite-wolf/qalam" target="_blank" style="color:var(--accent,#6c5ce7);text-decoration:none;">GitHub</a>
          </p>
        </div>
      </div>
    </div>`;

  document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
    const settings = {
      lang: document.getElementById('setLang').value,
      size: parseInt(document.getElementById('setSize').value),
      color: document.getElementById('setColor').value,
      grid: document.getElementById('setGrid').value === '1',
      undo: parseInt(document.getElementById('setUndo').value),
    };
    localStorage.setItem('qalam_settings', JSON.stringify(settings));
    WB.setSize(settings.size);
    WB.setColor(settings.color);
    WB.maxHistory = settings.undo;
    if (settings.grid) WB.setGrid(true);
    showToast('تم حفظ الإعدادات');
    setTimeout(() => router.navigate('home'), 800);
  });
}
window.renderSettingsPage = renderSettingsPage;
