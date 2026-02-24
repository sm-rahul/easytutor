// History page logic
checkAuth();

let currentPage = 1;
let currentSearch = '';
let totalPages = 1;

async function loadHistory() {
  const tbody = document.getElementById('historyBody');
  tbody.innerHTML = '<tr><td colspan="5" class="loading"><div class="spinner"></div> Loading...</td></tr>';

  try {
    const res = await getHistory(currentPage, 20, currentSearch);
    totalPages = res.pagination.pages || 1;

    if (res.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-muted" style="text-align:center;padding:30px;">No lessons found</td></tr>';
      updatePagination(res.pagination);
      return;
    }

    tbody.innerHTML = res.data.map(h => `
      <tr style="cursor:pointer;" onclick="showDetail(${h.id}, this)" data-item='${escapeAttr(JSON.stringify(h))}'>
        <td class="text-muted">#${h.id}</td>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="avatar-cell">${(h.user_name || '?').charAt(0).toUpperCase()}</div>
            <div>
              <div style="color:var(--text-primary);font-weight:600;font-size:13px;">${escapeHtml(h.user_name)}</div>
              <div style="font-size:11px;color:var(--text-muted);">${escapeHtml(h.user_email)}</div>
            </div>
          </div>
        </td>
        <td class="text-truncate">${escapeHtml(truncate(h.summary || h.extracted_text || '—', 80))}</td>
        <td class="text-muted">${formatDate(h.created_at)}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();confirmDelete(${h.id})">Delete</button>
        </td>
      </tr>
    `).join('');

    updatePagination(res.pagination);
  } catch (err) {
    console.error('Load history error:', err);
    tbody.innerHTML = '<tr><td colspan="5" class="text-danger" style="text-align:center;padding:30px;">Failed to load history</td></tr>';
  }
}

function updatePagination(p) {
  document.getElementById('pageInfo').textContent = `Page ${p.page} of ${p.pages || 1}`;
  document.getElementById('prevBtn').disabled = p.page <= 1;
  document.getElementById('nextBtn').disabled = p.page >= (p.pages || 1);
  document.getElementById('totalCount').textContent = `${p.total} lesson${p.total !== 1 ? 's' : ''}`;
}

function prevPage() {
  if (currentPage > 1) { currentPage--; loadHistory(); }
}

function nextPage() {
  if (currentPage < totalPages) { currentPage++; loadHistory(); }
}

// Search
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentSearch = e.target.value.trim();
    currentPage = 1;
    loadHistory();
  }, 300);
});

// Detail modal
function showDetail(id, row) {
  try {
    const item = JSON.parse(row.dataset.item);
    let examples = item.real_world_examples;
    if (typeof examples === 'string') {
      try { examples = JSON.parse(examples); } catch(e) { examples = []; }
    }
    let keywords = item.key_words;
    if (typeof keywords === 'string') {
      try { keywords = JSON.parse(keywords); } catch(e) { keywords = []; }
    }

    document.getElementById('detailContent').innerHTML = `
      <div class="detail-section">
        <div class="detail-label">User</div>
        <div class="detail-value">${escapeHtml(item.user_name)} (${escapeHtml(item.user_email)})</div>
      </div>
      <div class="detail-section">
        <div class="detail-label">Date</div>
        <div class="detail-value">${formatDate(item.created_at)}</div>
      </div>
      ${item.extracted_text ? `
        <div class="detail-section">
          <div class="detail-label">Extracted Text</div>
          <div class="detail-value">${escapeHtml(item.extracted_text)}</div>
        </div>
      ` : ''}
      ${item.summary ? `
        <div class="detail-section">
          <div class="detail-label">Summary</div>
          <div class="detail-value">${escapeHtml(item.summary)}</div>
        </div>
      ` : ''}
      ${item.visual_explanation ? `
        <div class="detail-section">
          <div class="detail-label">Visual Explanation</div>
          <div class="detail-value">${escapeHtml(item.visual_explanation)}</div>
        </div>
      ` : ''}
      ${examples && examples.length > 0 ? `
        <div class="detail-section">
          <div class="detail-label">Real-World Examples</div>
          <div class="detail-value">${examples.map((ex, i) => `${i + 1}. ${escapeHtml(ex)}`).join('<br>')}</div>
        </div>
      ` : ''}
      ${keywords && keywords.length > 0 ? `
        <div class="detail-section">
          <div class="detail-label">Key Words</div>
          <div class="detail-value">${keywords.map(w => `<span class="badge badge-accent" style="margin:2px;">${escapeHtml(w)}</span>`).join(' ')}</div>
        </div>
      ` : ''}
    `;
    document.getElementById('detailModal').classList.add('active');
  } catch (e) {
    console.error('Detail parse error:', e);
  }
}

function closeDetailModal() {
  document.getElementById('detailModal').classList.remove('active');
}

// Delete confirmation
let deleteTargetId = null;
function confirmDelete(id) {
  deleteTargetId = id;
  document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
  deleteTargetId = null;
}

async function doDelete() {
  if (!deleteTargetId) return;
  try {
    await deleteHistory(deleteTargetId);
    closeDeleteModal();
    showToast('Lesson deleted successfully');
    loadHistory();
  } catch (err) {
    showToast('Failed to delete lesson', 'error');
  }
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '...' : str;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

loadHistory();
