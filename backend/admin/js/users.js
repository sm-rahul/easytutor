// Users page logic
checkAuth();

let currentPage = 1;
let currentSearch = '';
let totalPages = 1;

async function loadUsers() {
  const tbody = document.getElementById('usersBody');
  tbody.innerHTML = '<tr><td colspan="8" class="loading"><div class="spinner"></div> Loading...</td></tr>';

  try {
    const res = await getUsers(currentPage, 20, currentSearch);
    totalPages = res.pagination.pages || 1;

    if (res.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-muted" style="text-align:center;padding:30px;">No users found</td></tr>';
      updatePagination(res.pagination);
      return;
    }

    tbody.innerHTML = res.data.map(u => `
      <tr>
        <td>
          <div class="avatar-cell">${escapeHtml((u.avatar || u.name?.charAt(0) || '?').toUpperCase())}</div>
        </td>
        <td style="color:var(--text-primary);font-weight:600;">${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.child_name || '—')}</td>
        <td class="text-accent">${u.total_scans}</td>
        <td class="text-accent">${u.total_saved}</td>
        <td class="text-muted">${formatDate(u.created_at)}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="confirmDelete(${u.id}, '${escapeHtml(u.name)}')">Delete</button>
        </td>
      </tr>
    `).join('');

    updatePagination(res.pagination);
  } catch (err) {
    console.error('Load users error:', err);
    tbody.innerHTML = '<tr><td colspan="8" class="text-danger" style="text-align:center;padding:30px;">Failed to load users</td></tr>';
  }
}

function updatePagination(p) {
  document.getElementById('pageInfo').textContent = `Page ${p.page} of ${p.pages || 1}`;
  document.getElementById('prevBtn').disabled = p.page <= 1;
  document.getElementById('nextBtn').disabled = p.page >= (p.pages || 1);
  document.getElementById('totalCount').textContent = `${p.total} user${p.total !== 1 ? 's' : ''}`;
}

function prevPage() {
  if (currentPage > 1) { currentPage--; loadUsers(); }
}

function nextPage() {
  if (currentPage < totalPages) { currentPage++; loadUsers(); }
}

// Search with debounce
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentSearch = e.target.value.trim();
    currentPage = 1;
    loadUsers();
  }, 300);
});

// Delete confirmation
function confirmDelete(userId, userName) {
  document.getElementById('deleteUserName').textContent = userName;
  document.getElementById('confirmDeleteBtn').onclick = () => doDelete(userId);
  document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
  document.getElementById('deleteModal').classList.remove('active');
}

async function doDelete(userId) {
  try {
    await deleteUser(userId);
    closeDeleteModal();
    showToast('User deleted successfully');
    loadUsers();
  } catch (err) {
    showToast('Failed to delete user', 'error');
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

loadUsers();
