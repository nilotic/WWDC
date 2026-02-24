const state = {
  data: [],
  idx: null,
};

const queryEl = document.getElementById('query');
const yearEl = document.getElementById('yearFilter');
const resultsEl = document.getElementById('results');
const countEl = document.getElementById('count');
const statsEl = document.getElementById('stats');

function escapeHtml(str) {
  return str.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function render(results) {
  resultsEl.innerHTML = '';
  countEl.textContent = results.length ? `${results.length} results` : 'No results yet';

  results.forEach((item) => {
    const div = document.createElement('div');
    div.className = 'card';
    const excerpt = item.text ? item.text.slice(0, 220) + (item.text.length > 220 ? '…' : '') : 'No summary text available.';
    const summaryLink = item.summary_url ? `<a href="${item.summary_url}">Summary</a>` : '';
    const pdfLink = item.pdf_url ? `<a href="${item.pdf_url}">PDF</a>` : '';

    div.innerHTML = `
      <div class="year">WWDC ${item.year}</div>
      <h4>${escapeHtml(item.title)}</h4>
      <div class="excerpt">${escapeHtml(excerpt)}</div>
      <div class="links">${summaryLink} ${pdfLink}</div>
    `;
    resultsEl.appendChild(div);
  });
}

function buildIndex() {
  if (!window.lunr) return null;
  return lunr(function () {
    this.ref('id');
    this.field('title');
    this.field('text');
    this.field('year');
    state.data.forEach((doc) => this.add(doc));
  });
}

function filterYear(items) {
  const y = yearEl.value;
  if (!y) return items;
  return items.filter((it) => it.year === y);
}

function search() {
  const q = queryEl.value.trim();
  if (!q) {
    render(filterYear(state.data).slice(0, 60));
    return;
  }

  if (state.idx) {
    let hits = [];
    try {
      hits = state.idx.search(q).map((r) => state.dataById.get(r.ref));
    } catch (e) {
      hits = [];
    }
    render(filterYear(hits));
  } else {
    const lower = q.toLowerCase();
    const hits = state.data.filter((d) =>
      d.title.toLowerCase().includes(lower) || d.text.toLowerCase().includes(lower)
    );
    render(filterYear(hits));
  }
}

async function init() {
  const res = await fetch('search.json');
  state.data = await res.json();
  state.dataById = new Map(state.data.map((d) => [d.id, d]));
  state.idx = buildIndex();
  statsEl.textContent = `${state.data.length} sessions indexed`;
  render(state.data.slice(0, 60));
}

queryEl.addEventListener('input', () => search());
yearEl.addEventListener('change', () => search());

document.getElementById('searchBtn').addEventListener('click', () => search());

document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    queryEl.value = chip.dataset.q;
    search();
  });
});

init().catch(() => {
  statsEl.textContent = 'Failed to load search data.';
});
