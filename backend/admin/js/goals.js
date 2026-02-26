// Goals & Progress page logic
checkAuth();

let currentPage = 1;
let currentSearch = '';
let totalPages = 1;
let editUserId = null;

const searchInput = document.getElementById('searchInput');
let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentSearch = searchInput.value.trim();
    currentPage = 1;
    loadGoals();
  }, 400);
});

async function loadGoals() {
  try {
    const res = await getGoalsAdmin(currentPage, 20, currentSearch);
    const users = res.data;
    const p = res.pagination;
    totalPages = p.pages || 1;

    document.getElementById('totalCount').textContent = `${p.total} user${p.total !== 1 ? 's' : ''}`;
    updatePagination(p);

    const tbody = document.getElementById('goalsBody');
    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><p>No users found</p></td></tr>';
      return;
    }

    tbody.innerHTML = users.map(u => {
      const todayMin = Math.round((u.today_reading_seconds || 0) / 60);
      const totalHrs = ((u.total_reading_seconds || 0) / 3600).toFixed(1);
      const lessonProg = u.daily_goal_lessons > 0 ? Math.min(u.today_lessons / u.daily_goal_lessons, 1) : 0;
      const timeProg = u.daily_goal_minutes > 0 ? Math.min(todayMin / u.daily_goal_minutes, 1) : 0;

      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="avatar-cell" style="width:30px;height:30px;border-radius:10px;font-size:12px;">${(u.name || '?').charAt(0).toUpperCase()}</div>
              <div>
                <div style="color:var(--text-primary);font-weight:600;font-size:13px;">${escapeHtml(u.name)}</div>
                <div style="font-size:11px;color:var(--text-muted);">${escapeHtml(u.email)}</div>
              </div>
            </div>
          </td>
          <td>${u.daily_goal_lessons} lessons/day</td>
          <td>${u.daily_goal_minutes} min/day</td>
          <td>
            ${u.today_lessons}/${u.daily_goal_lessons}
            <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${Math.round(lessonProg * 100)}%"></div></div>
          </td>
          <td>
            ${todayMin}/${u.daily_goal_minutes}m
            <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${Math.round(timeProg * 100)}%"></div></div>
          </td>
          <td>${totalHrs}h</td>
          <td>${u.total_quizzes || 0}</td>
          <td>
            <button class="btn btn-ghost btn-sm" onclick="editGoals(${u.id}, '${escapeHtml(u.name)}', ${u.daily_goal_lessons}, ${u.daily_goal_minutes})">Edit</button>
          </td>
        </tr>`;
    }).join('');
  } catch (err) {
    console.error('Load goals error:', err);
  }
}

function updatePagination(p) {
  document.getElementById('pageInfo').textContent = `Page ${p.page} of ${p.pages || 1}`;
  document.getElementById('prevBtn').disabled = p.page <= 1;
  document.getElementById('nextBtn').disabled = p.page >= (p.pages || 1);
}

function prevPage() { if (currentPage > 1) { currentPage--; loadGoals(); } }
function nextPage() { if (currentPage < totalPages) { currentPage++; loadGoals(); } }

function editGoals(userId, name, lessons, minutes) {
  editUserId = userId;
  document.getElementById('editUserName').textContent = `Setting goals for: ${name}`;
  document.getElementById('editLessons').value = lessons;
  document.getElementById('editMinutes').value = minutes;
  document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
  editUserId = null;
  document.getElementById('editModal').classList.remove('active');
}

async function saveGoals() {
  if (!editUserId) return;
  const dailyLessons = parseInt(document.getElementById('editLessons').value) || 3;
  const dailyMinutes = parseInt(document.getElementById('editMinutes').value) || 15;

  try {
    await updateGoalsAdmin(editUserId, { dailyLessons, dailyMinutes });
    closeEditModal();
    showToast('Goals updated successfully', 'success');
    loadGoals();
  } catch (err) {
    console.error('Save goals error:', err);
    showToast('Failed to update goals', 'error');
  }
}

function showToast(msg, type) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => { toast.className = 'toast'; }, 3000);
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

loadGoals();
