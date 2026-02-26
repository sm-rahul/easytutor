// Quiz management page logic
checkAuth();

let currentPage = 1;
let currentSearch = '';
let totalPages = 1;
let deleteId = null;

const searchInput = document.getElementById('searchInput');
let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    currentSearch = searchInput.value.trim();
    currentPage = 1;
    loadQuizzes();
  }, 400);
});

async function loadQuizzes() {
  try {
    const res = await getQuizzes(currentPage, 20, currentSearch);
    const quizzes = res.data;
    const p = res.pagination;
    totalPages = p.pages || 1;

    document.getElementById('totalCount').textContent = `${p.total} quiz${p.total !== 1 ? 'zes' : ''}`;
    updatePagination(p);

    const tbody = document.getElementById('quizBody');
    if (quizzes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="empty-state"><p>No quizzes found</p></td></tr>';
      return;
    }

    tbody.innerHTML = quizzes.map(q => {
      const avgScore = parseFloat(q.avg_score) || 0;
      const scoreClass = avgScore >= 70 ? 'score-high' : avgScore >= 40 ? 'score-mid' : 'score-low';
      return `
        <tr>
          <td class="text-muted">${q.id}</td>
          <td style="color:var(--text-primary);font-weight:500;">${escapeHtml(truncate(q.title, 40))}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="avatar-cell" style="width:28px;height:28px;border-radius:8px;font-size:11px;">${(q.user_name || '?').charAt(0).toUpperCase()}</div>
              <span>${escapeHtml(q.user_name)}</span>
            </div>
          </td>
          <td><span class="badge badge-accent">${escapeHtml(q.content_type || 'text')}</span></td>
          <td>${q.total_questions}</td>
          <td>${q.attempt_count || 0}</td>
          <td class="${scoreClass}">${avgScore.toFixed(0)}%</td>
          <td class="text-muted">${formatDate(q.created_at)}</td>
          <td>
            <div class="btn-group">
              <button class="btn btn-ghost btn-sm" onclick="showDetail(${q.id})">View</button>
              <button class="btn btn-danger btn-sm" onclick="confirmDelete(${q.id})">Delete</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  } catch (err) {
    console.error('Load quizzes error:', err);
  }
}

function updatePagination(p) {
  document.getElementById('pageInfo').textContent = `Page ${p.page} of ${p.pages || 1}`;
  document.getElementById('prevBtn').disabled = p.page <= 1;
  document.getElementById('nextBtn').disabled = p.page >= (p.pages || 1);
}

function prevPage() { if (currentPage > 1) { currentPage--; loadQuizzes(); } }
function nextPage() { if (currentPage < totalPages) { currentPage++; loadQuizzes(); } }

async function showDetail(quizId) {
  try {
    const res = await getQuiz(quizId);
    const { quiz, questions, attempts } = res.data;

    let html = `
      <div class="detail-section">
        <div class="detail-label">Title</div>
        <div class="detail-value">${escapeHtml(quiz.title)}</div>
      </div>
      <div style="display:flex;gap:16px;margin-bottom:16px;">
        <div class="detail-section" style="flex:1;">
          <div class="detail-label">User</div>
          <div class="detail-value">${escapeHtml(quiz.user_name)} (${escapeHtml(quiz.user_email)})</div>
        </div>
        <div class="detail-section" style="flex:1;">
          <div class="detail-label">Type</div>
          <div class="detail-value">${escapeHtml(quiz.content_type || 'text')}</div>
        </div>
      </div>
      <div style="display:flex;gap:16px;margin-bottom:16px;">
        <div class="detail-section" style="flex:1;">
          <div class="detail-label">Questions</div>
          <div class="detail-value">${quiz.total_questions}</div>
        </div>
        <div class="detail-section" style="flex:1;">
          <div class="detail-label">Created</div>
          <div class="detail-value">${formatDate(quiz.created_at)}</div>
        </div>
      </div>`;

    // Questions
    if (questions.length > 0) {
      html += '<h4 style="color:var(--text-primary);margin:16px 0 10px;font-size:14px;">Questions</h4>';
      questions.forEach((q, i) => {
        const options = [q.option_a, q.option_b, q.option_c, q.option_d];
        const labels = ['A', 'B', 'C', 'D'];
        const diffClass = q.difficulty === 'easy' ? 'badge-easy' : q.difficulty === 'hard' ? 'badge-hard' : 'badge-medium';

        html += `<div class="question-card">
          <div class="q-num">
            <span>Question ${i + 1}</span>
            <span class="badge ${diffClass}">${q.difficulty || 'medium'}</span>
          </div>
          <div class="q-text">${escapeHtml(q.question_text)}</div>`;

        options.forEach((opt, j) => {
          const isCorrect = j === q.correct_option;
          html += `<div class="option ${isCorrect ? 'correct' : ''}">${labels[j]}. ${escapeHtml(opt)}${isCorrect ? ' ✓' : ''}</div>`;
        });

        if (q.explanation) {
          html += `<div class="explanation"><strong>Explanation:</strong> ${escapeHtml(q.explanation)}</div>`;
        }
        html += '</div>';
      });
    }

    // Attempts
    if (attempts.length > 0) {
      html += '<h4 style="color:var(--text-primary);margin:16px 0 10px;font-size:14px;">Attempts</h4>';
      html += '<table style="font-size:13px;"><thead><tr><th>User</th><th>Score</th><th>%</th><th>Time</th><th>Date</th></tr></thead><tbody>';
      attempts.forEach(a => {
        const pctClass = a.percentage >= 70 ? 'score-high' : a.percentage >= 40 ? 'score-mid' : 'score-low';
        html += `<tr>
          <td>${escapeHtml(a.user_name)}</td>
          <td>${a.score}/${a.total_questions}</td>
          <td class="${pctClass}">${parseFloat(a.percentage).toFixed(0)}%</td>
          <td>${a.time_taken_seconds ? Math.round(a.time_taken_seconds / 60) + 'm' : '—'}</td>
          <td class="text-muted">${formatDate(a.created_at)}</td>
        </tr>`;
      });
      html += '</tbody></table>';
    }

    document.getElementById('detailContent').innerHTML = html;
    document.getElementById('detailModal').classList.add('active');
  } catch (err) {
    console.error('Show quiz detail error:', err);
  }
}

function closeDetailModal() {
  document.getElementById('detailModal').classList.remove('active');
}

function confirmDelete(id) {
  deleteId = id;
  document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
  deleteId = null;
  document.getElementById('deleteModal').classList.remove('active');
}

async function doDelete() {
  if (!deleteId) return;
  try {
    await deleteQuiz(deleteId);
    closeDeleteModal();
    loadQuizzes();
  } catch (err) {
    console.error('Delete quiz error:', err);
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

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

loadQuizzes();
