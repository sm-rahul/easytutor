// Dashboard page logic
checkAuth();

async function loadDashboard() {
  try {
    const res = await getDashboard();
    const d = res.data;

    document.getElementById('totalUsers').textContent = d.totalUsers;
    document.getElementById('totalScans').textContent = d.totalScans;
    document.getElementById('totalSaved').textContent = d.totalSaved;
    document.getElementById('totalQuizzes').textContent = d.totalQuizzes || 0;
    document.getElementById('newUsersWeek').textContent = d.newUsersThisWeek;

    const tbody = document.getElementById('recentBody');
    if (d.recentActivity.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-muted" style="text-align:center;padding:30px;">No activity yet</td></tr>';
      return;
    }

    tbody.innerHTML = d.recentActivity.map(item => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="avatar-cell">${(item.user_name || '?').charAt(0).toUpperCase()}</div>
            <div>
              <div style="color:var(--text-primary);font-weight:600;font-size:13px;">${escapeHtml(item.user_name)}</div>
              <div style="font-size:11px;color:var(--text-muted);">${escapeHtml(item.email)}</div>
            </div>
          </div>
        </td>
        <td class="text-truncate">${escapeHtml(item.summary || item.extracted_text || '—')}</td>
        <td class="text-muted">${formatDate(item.created_at)}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
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

loadDashboard();
// Auto-refresh every 60 seconds
setInterval(loadDashboard, 60000);
