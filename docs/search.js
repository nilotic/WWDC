const state = {
  data: [],
  idx: null,
};

const queryEl = document.getElementById('query');
const yearEl = document.getElementById('yearFilter');
const resultsEl = document.getElementById('results');
const countEl = document.getElementById('count');
const statsEl = document.getElementById('stats');
const YEAR_QUERY_RE = /\bwwdc[\s-]*(\d{2}|\d{4})\b/ig;

function escapeHtml(str) {
  return str.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function render(results) {
  resultsEl.innerHTML = '';
  resultsEl.classList.add('results-grid');
  resultsEl.classList.remove('results-sections');
  countEl.textContent = results.length ? `${results.length} results` : 'No results';

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

function pickFeaturedByYear(items, limitPerYear = 25) {
  const keywords = [
    'Keynote',
    'Platforms State of the Union',
    'State of the Union',
    'What\'s new',
    'Swift',
    'SwiftUI',
    'UIKit',
    'iOS',
  ];
  const groups = groupByYear(items);
  const result = [];

  groups.forEach((group) => {
    const featured = group.items.filter((item) => keywords.some((k) => item.title.includes(k)));
    const unique = Array.from(new Map(featured.map((i) => [i.id, i])).values());
    const filled = unique.concat(
      group.items.filter((i) => !unique.find((u) => u.id === i.id))
    ).slice(0, limitPerYear);
    result.push({ year: group.year, items: filled });
  });

  return result;
}

function groupByYear(items) {
  const groups = new Map();
  items.forEach((item) => {
    if (!groups.has(item.year)) groups.set(item.year, []);
    groups.get(item.year).push(item);
  });
  const years = Array.from(groups.keys()).sort().reverse();
  return years.map((year) => ({ year, items: groups.get(year) }));
}

function renderSectionedByYear(groups) {
  resultsEl.innerHTML = '';
  resultsEl.classList.remove('results-grid');
  resultsEl.classList.add('results-sections');
  groups.forEach((group) => {
    const section = document.createElement('section');
    section.className = 'year-section';
    const shortYear = String(group.year).slice(-2);
    section.innerHTML = `<div class="year-title">WWDC ${shortYear}</div><div class="results-grid"></div>`;
    const grid = section.querySelector('.results-grid');
    group.items.forEach((item) => {
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
      grid.appendChild(div);
    });
  resultsEl.appendChild(section);
  });
}

function parseSearchQuery(rawQuery) {
  const years = new Set();
  const query = rawQuery
    .replace(YEAR_QUERY_RE, (_, yearToken) => {
      const normalizedYear = yearToken.length === 2 ? `20${yearToken}` : yearToken;
      years.add(normalizedYear);
      return ' ';
    })
    .replace(/\s+/g, ' ')
    .trim();

  return {
    query,
    year: years.size === 1 ? Array.from(years)[0] : '',
  };
}

function effectiveYearFilter(parsedQuery) {
  return yearEl.value || parsedQuery.year;
}

function filterYear(items, parsedQuery = { year: '' }) {
  const y = effectiveYearFilter(parsedQuery);
  if (!y) return items;
  return items.filter((it) => it.year === y);
}

function search() {
  const rawQuery = queryEl.value.trim();
  const parsedQuery = parseSearchQuery(rawQuery);
  const q = parsedQuery.query;

  if (!rawQuery) {
    const featured = pickFeaturedByYear(filterYear(state.data, parsedQuery));
    countEl.textContent = 'Featured sessions';
    renderSectionedByYear(featured);
    return;
  }

  if (!q) {
    render(filterYear(state.data, parsedQuery));
    return;
  }

  if (state.idx) {
    let hits = [];
    try {
      hits = state.idx.search(q).map((r) => state.dataById.get(r.ref));
    } catch (e) {
      hits = [];
    }
    const filtered = filterYear(hits, parsedQuery);
    if (filtered.length === 0) {
      countEl.textContent = 'No results — showing featured sessions';
      renderSectionedByYear(pickFeaturedByYear(filterYear(state.data, parsedQuery)));
    } else {
      render(filtered);
    }
  } else {
    const lower = q.toLowerCase();
    const hits = state.data.filter((d) =>
      d.title.toLowerCase().includes(lower) || d.text.toLowerCase().includes(lower)
    );
    const filtered = filterYear(hits, parsedQuery);
    if (filtered.length === 0) {
      countEl.textContent = 'No results — showing featured sessions';
      renderSectionedByYear(pickFeaturedByYear(filterYear(state.data, parsedQuery)));
    } else {
      render(filtered);
    }
  }
}

async function init() {
  const res = await fetch('search.json');
  state.data = await res.json();
  state.dataById = new Map(state.data.map((d) => [d.id, d]));
  state.idx = buildIndex();
  statsEl.textContent = `${state.data.length} sessions indexed`;
  countEl.textContent = 'Featured sessions';
  renderSectionedByYear(pickFeaturedByYear(state.data));
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
