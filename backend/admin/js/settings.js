// Settings page logic
checkAuth();

let allSettings = [];
let deleteKey = null;

// Known setting groups for organized display
const aboutKeys = ['about_title', 'about_description', 'about_features', 'about_image'];
const contactKeys = ['contact_email', 'app_version'];

async function loadSettings() {
  try {
    const res = await getSettings();
    allSettings = res.data;
    renderSettings();
  } catch (err) {
    console.error('Load settings error:', err);
    document.getElementById('settingsContainer').innerHTML = '<div class="empty-state"><p>Failed to load settings</p></div>';
  }
}

function renderSettings() {
  const container = document.getElementById('settingsContainer');
  const aboutSettings = allSettings.filter(s => aboutKeys.includes(s.setting_key));
  const contactSettings = allSettings.filter(s => contactKeys.includes(s.setting_key));
  const customSettings = allSettings.filter(s => !aboutKeys.includes(s.setting_key) && !contactKeys.includes(s.setting_key));

  let html = '';

  // About Us Card
  html += `<div class="settings-card">
    <h3>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
      About Us
    </h3>`;

  // Image upload section
  const aboutImageSetting = allSettings.find(s => s.setting_key === 'about_image');
  const currentImage = aboutImageSetting ? aboutImageSetting.setting_value : '';

  html += `<div class="form-group">
    <label>About Image</label>
    <div style="display:flex;align-items:flex-start;gap:16px;">
      <div id="imagePreview" style="width:120px;height:80px;border-radius:var(--radius-md);border:1px solid var(--border);overflow:hidden;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        ${currentImage
          ? `<img src="${currentImage}" style="width:100%;height:100%;object-fit:cover;" alt="About image">`
          : `<span style="font-size:11px;color:var(--text-muted);">No image</span>`
        }
      </div>
      <div style="flex:1;">
        <input type="file" id="aboutImageInput" accept="image/*" style="display:none;" onchange="handleImageSelect(this)">
        <button class="btn btn-ghost btn-sm" onclick="document.getElementById('aboutImageInput').click()" style="margin-bottom:6px;">Choose Image</button>
        <p style="font-size:11px;color:var(--text-muted);margin:0;">JPG or PNG, recommended 800x400px</p>
      </div>
    </div>
  </div>`;

  aboutSettings.filter(s => s.setting_key !== 'about_image').forEach(s => {
    const isTextarea = s.setting_key === 'about_description' || s.setting_key === 'about_features';
    const label = formatLabel(s.setting_key);
    const hint = s.setting_key === 'about_features' ? ' (JSON array format)' : '';

    if (isTextarea) {
      html += `<div class="form-group">
        <label>${label}${hint}</label>
        <textarea class="form-textarea" id="setting_${s.setting_key}" rows="3">${escapeHtml(s.setting_value)}</textarea>
      </div>`;
    } else {
      html += `<div class="form-group">
        <label>${label}</label>
        <input type="text" class="form-input" id="setting_${s.setting_key}" value="${escapeAttr(s.setting_value)}">
      </div>`;
    }
  });

  html += `<button class="btn btn-accent btn-sm" onclick="saveGroup('about')">Save About</button></div>`;

  // Contact & Version Card
  html += `<div class="settings-card">
    <h3>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      Contact & Version
    </h3>`;

  contactSettings.forEach(s => {
    html += `<div class="form-group">
      <label>${formatLabel(s.setting_key)}</label>
      <input type="text" class="form-input" id="setting_${s.setting_key}" value="${escapeAttr(s.setting_value)}">
    </div>`;
  });

  html += `<button class="btn btn-accent btn-sm" onclick="saveGroup('contact')">Save Contact</button></div>`;

  // Custom Settings Card
  html += `<div class="settings-card">
    <h3 style="justify-content:space-between;">
      <span style="display:flex;align-items:center;gap:8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-pink)" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9c.26.6.85 1 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        Custom Settings
      </span>
      <button class="btn btn-ghost btn-sm" onclick="openAddModal()">+ Add</button>
    </h3>`;

  if (customSettings.length === 0) {
    html += '<p style="color:var(--text-muted);font-size:13px;">No custom settings yet</p>';
  } else {
    html += '<div class="table-wrap"><table><thead><tr><th>Key</th><th>Value</th><th>Description</th><th style="width:100px;">Actions</th></tr></thead><tbody>';
    customSettings.forEach(s => {
      html += `<tr>
        <td style="color:var(--accent-light);font-weight:600;font-size:13px;">${escapeHtml(s.setting_key)}</td>
        <td class="text-truncate">${escapeHtml(truncate(s.setting_value, 60))}</td>
        <td class="text-muted">${escapeHtml(s.description || '—')}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-ghost btn-sm" onclick="editCustom('${escapeAttr(s.setting_key)}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="confirmDelete('${escapeAttr(s.setting_key)}')">Del</button>
          </div>
        </td>
      </tr>`;
    });
    html += '</tbody></table></div>';
  }

  html += '</div>';

  container.innerHTML = html;
}

async function saveGroup(group) {
  const keys = group === 'about' ? aboutKeys : contactKeys;
  try {
    for (const key of keys) {
      const el = document.getElementById('setting_' + key);
      if (el) {
        const value = el.tagName === 'TEXTAREA' ? el.value : el.value;
        await updateSetting(key, value);
      }
    }
    showToast('Settings saved successfully', 'success');
  } catch (err) {
    console.error('Save settings error:', err);
    showToast('Failed to save settings', 'error');
  }
}

function editCustom(key) {
  const setting = allSettings.find(s => s.setting_key === key);
  if (!setting) return;

  document.getElementById('addKey').value = setting.setting_key;
  document.getElementById('addKey').disabled = true;
  document.getElementById('addValue').value = setting.setting_value;
  document.getElementById('addDesc').value = setting.description || '';
  document.getElementById('addModal').querySelector('h3').textContent = 'Edit Setting';
  document.getElementById('addModal').querySelector('.btn-accent').textContent = 'Save Changes';
  document.getElementById('addModal').querySelector('.btn-accent').onclick = async () => {
    try {
      await updateSetting(key, document.getElementById('addValue').value);
      closeAddModal();
      showToast('Setting updated', 'success');
      loadSettings();
    } catch (err) {
      showToast('Failed to update', 'error');
    }
  };
  document.getElementById('addModal').classList.add('active');
}

function openAddModal() {
  document.getElementById('addKey').value = '';
  document.getElementById('addKey').disabled = false;
  document.getElementById('addValue').value = '';
  document.getElementById('addDesc').value = '';
  document.getElementById('addModal').querySelector('h3').textContent = 'Add Custom Setting';
  document.getElementById('addModal').querySelector('.btn-accent').textContent = 'Add Setting';
  document.getElementById('addModal').querySelector('.btn-accent').onclick = doAddSetting;
  document.getElementById('addModal').classList.add('active');
}

function closeAddModal() {
  document.getElementById('addModal').classList.remove('active');
}

async function doAddSetting() {
  const key = document.getElementById('addKey').value.trim();
  const value = document.getElementById('addValue').value;
  const description = document.getElementById('addDesc').value.trim();

  if (!key) { showToast('Key is required', 'error'); return; }

  try {
    await createSetting({ key, value, type: 'text', description });
    closeAddModal();
    showToast('Setting added', 'success');
    loadSettings();
  } catch (err) {
    showToast('Failed to add setting', 'error');
  }
}

function confirmDelete(key) {
  deleteKey = key;
  document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
  deleteKey = null;
  document.getElementById('deleteModal').classList.remove('active');
}

async function doDeleteSetting() {
  if (!deleteKey) return;
  try {
    await deleteSetting(deleteKey);
    closeDeleteModal();
    showToast('Setting deleted', 'success');
    loadSettings();
  } catch (err) {
    showToast('Failed to delete setting', 'error');
  }
}

function showToast(msg, type) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}

function formatLabel(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

// Image upload
function handleImageSelect(input) {
  const file = input.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Please select an image file', 'error');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('Image must be under 5MB', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result;
    // Show preview immediately
    document.getElementById('imagePreview').innerHTML = `<img src="${base64}" style="width:100%;height:100%;object-fit:cover;" alt="Preview">`;

    try {
      const res = await uploadAboutImage(base64, 'about-us');
      showToast('Image uploaded successfully', 'success');
      // Reload to get updated setting
      loadSettings();
    } catch (err) {
      console.error('Upload error:', err);
      showToast('Failed to upload image', 'error');
    }
  };
  reader.readAsDataURL(file);
}

loadSettings();
