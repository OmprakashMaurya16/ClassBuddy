/**
 * form.js — ClassEcho Feedback Form Logic
 * Handles: interactive star ratings, form submission via fetch,
 * BERT status polling, and Chart.js donut chart rendering.
 */

/* ─── DOM refs ──────────────────────────────────────────────────────────── */
const form        = document.getElementById('feedback-form');
const resultPanel = document.getElementById('result-panel');
const bertBadge   = document.getElementById('bert-status');
const submitBtn   = document.getElementById('submit-btn');

/* ─── Star rating state ─────────────────────────────────────────────────── */
const ratingState = {};   // { fieldName: currentValue }

function initStars() {
  document.querySelectorAll('.rating-row').forEach(row => {
    const field = row.dataset.field;
    ratingState[field] = 0;
    const stars = row.querySelectorAll('.star');
    const valEl = row.querySelector('.rating-val');

    stars.forEach((star, idx) => {
      const starVal = idx + 1;

      star.addEventListener('mouseenter', () => {
        stars.forEach((s, i) => s.classList.toggle('hover', i <= idx));
      });

      star.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('hover'));
        updateStarDisplay(stars, valEl, ratingState[field]);
      });

      star.addEventListener('click', () => {
        ratingState[field] = starVal;
        updateStarDisplay(stars, valEl, starVal);
      });
    });
  });
}

function updateStarDisplay(stars, valEl, val) {
  stars.forEach((s, i) => s.classList.toggle('active', i < val));
  if (val > 0) {
    valEl.textContent = `${val}/5`;
    valEl.classList.add('filled');
  } else {
    valEl.textContent = '–';
    valEl.classList.remove('filled');
  }
}

/* ─── BERT status polling ────────────────────────────────────────────────── */
function pollBertStatus() {
  fetch('/api/status')
    .then(r => r.json())
    .then(data => {
      if (data.bert_loaded) {
        bertBadge.className = 'ready';
        bertBadge.querySelector('.dot-label').textContent = 'BERT ready';
        bertBadge.classList.add('ready');
      } else if (data.bert_error) {
        bertBadge.classList.add('error');
        bertBadge.querySelector('.dot-label').textContent = 'Rating-based sentiment';
      } else {
        // still loading — poll again
        bertBadge.querySelector('.dot-label').textContent = 'Loading BERT model…';
        setTimeout(pollBertStatus, 5000);
      }
    })
    .catch(() => setTimeout(pollBertStatus, 8000));
}

/* ─── Chart.js donut chart ──────────────────────────────────────────────── */
let chartInstance = null;

function renderChart(pos, neu, neg) {
  const ctx = document.getElementById('sentiment-chart').getContext('2d');

  if (chartInstance) chartInstance.destroy();

  const total = pos + neu + neg || 1;
  const posP = Math.round((pos / total) * 100);
  const neuP = Math.round((neu / total) * 100);
  const negP = 100 - posP - neuP;

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Positive', 'Neutral', 'Negative'],
      datasets: [{
        data: [pos || 0, neu || 0, neg || 0],
        backgroundColor: ['#4caf50', '#ffc107', '#f44336'],
        borderColor: '#1a1d27',
        borderWidth: 4,
        hoverOffset: 8,
      }]
    },
    options: {
      cutout: '72%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const pct = Math.round((ctx.parsed / total) * 100);
              return ` ${ctx.label}: ${pct}%`;
            }
          },
          backgroundColor: '#22263a',
          titleColor: '#e2e8f0',
          bodyColor: '#8892a4',
          padding: 10,
          cornerRadius: 8,
        },
      },
      animation: { animateRotate: true, duration: 900, easing: 'easeInOutCubic' },
    }
  });

  // Determine dominant sentiment for center label
  const max = Math.max(posP, neuP, negP);
  let dominant, dominantPct;
  if (max === posP)      { dominant = 'Positive'; dominantPct = posP; }
  else if (max === neuP) { dominant = 'Neutral';  dominantPct = neuP; }
  else                   { dominant = 'Negative'; dominantPct = negP; }

  document.getElementById('center-pct').textContent = `${dominantPct}%`;
  document.getElementById('center-lbl').textContent = dominant;

  document.getElementById('legend-pos-pct').textContent = `${posP}%`;
  document.getElementById('legend-neu-pct').textContent = `${neuP}%`;
  document.getElementById('legend-neg-pct').textContent = `${negP}%`;
}

/* ─── Form submission ───────────────────────────────────────────────────── */
form.addEventListener('submit', async e => {
  e.preventDefault();

  // Validate all 7 ratings
  const ratingKeys = [
    'conceptClarity','lectureStructure','subjectMastery',
    'practicalUnderstanding','studentEngagement','lecturePace','learningOutcomeImpact'
  ];
  const unrated = ratingKeys.filter(k => !ratingState[k] || ratingState[k] === 0);
  if (unrated.length) {
    showValidationError('Please rate all 7 criteria before submitting.');
    return;
  }

  const studentName = document.getElementById('student-name').value.trim();
  const rollNo      = document.getElementById('roll-no').value.trim();
  if (!studentName || !rollNo) {
    showValidationError('Please enter your name and roll number.');
    return;
  }

  const remark = document.getElementById('remark').value.trim();

  // Build payload
  const payload = {
    studentName,
    rollNo,
    sessionId: document.getElementById('session-id')?.dataset.value || 'demo',
    ratings: Object.fromEntries(ratingKeys.map(k => [k, ratingState[k]])),
    remark,
  };

  // UI — loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span> Analysing…';
  clearValidationError();

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Submission failed');

    // Show result panel
    showResultPanel(data, payload.ratings);
  } catch (err) {
    showValidationError(`Error: ${err.message}`);
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="btn-icon">📨</span> Submit Feedback';
  }
});

function showResultPanel(data, ratings) {
  // Hide form, show panel
  form.closest('.card').style.display = 'none';
  resultPanel.classList.add('visible');

  // Rating display
  document.getElementById('res-avg-rating').textContent = data.averageRating.toFixed(1);
  document.getElementById('res-sentiment').textContent  = data.sentiment;
  document.getElementById('res-source').textContent     = data.sentimentSource === 'bert'
    ? '✨ BERT Analysis' : '⭐ Rating-based';

  // Set colour for sentiment chip
  const sentEl = document.getElementById('res-sentiment');
  if (data.sentiment === 'Positive')     sentEl.style.color = '#4caf50';
  else if (data.sentiment === 'Neutral') sentEl.style.color = '#ffc107';
  else                                   sentEl.style.color = '#f44336';

  // Fetch aggregate stats for pie chart (for this "session")
  const sessionId = document.getElementById('session-id')?.dataset.value || 'demo';
  fetch(`/api/feedback/stats?sessionId=${encodeURIComponent(sessionId)}`)
    .then(r => r.json())
    .then(stats => {
      const c = stats.counts || {};
      renderChart(c.Positive || 0, c.Neutral || 0, c.Negative || 0);
    })
    .catch(() => {
      // Fallback: just show current submission as a single data point
      renderChart(
        data.sentiment === 'Positive' ? 1 : 0,
        data.sentiment === 'Neutral'  ? 1 : 0,
        data.sentiment === 'Negative' ? 1 : 0,
      );
    });
}

/* ─── Validation helpers ────────────────────────────────────────────────── */
function showValidationError(msg) {
  let el = document.getElementById('validation-error');
  if (!el) {
    el = document.createElement('p');
    el.id = 'validation-error';
    el.style.cssText = 'color:#f44336;font-size:0.82rem;margin-top:0.6rem;text-align:center;';
    submitBtn.after(el);
  }
  el.textContent = msg;
}
function clearValidationError() {
  const el = document.getElementById('validation-error');
  if (el) el.textContent = '';
}

/* ─── Init ──────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initStars();
  pollBertStatus();
});
