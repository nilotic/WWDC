function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function getSafeBackHref() {
  const from = getParam('from');
  if (!from) return 'index.html';

  try {
    const url = new URL(from, window.location.href);
    if (url.origin !== window.location.origin) return 'index.html';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch (_) {
    return 'index.html';
  }
}

function canUseHistoryBack(backHref) {
  if (window.history.length <= 1 || !document.referrer) return false;

  try {
    const referrerUrl = new URL(document.referrer, window.location.href);
    const targetUrl = new URL(backHref, window.location.href);

    return referrerUrl.origin === window.location.origin
      && referrerUrl.pathname === targetUrl.pathname
      && referrerUrl.search === targetUrl.search;
  } catch (_) {
    return false;
  }
}

function configureBackLink() {
  const backLink = document.querySelector('.back');
  if (!backLink) return;

  const backHref = getSafeBackHref();
  backLink.href = backHref;
  backLink.addEventListener('click', (event) => {
    if (!canUseHistoryBack(backHref)) return;
    event.preventDefault();
    window.history.back();
  });
}

function niceName(path) {
  if (!path) return '';
  const parts = path.split('/');
  return decodeURIComponent(parts[parts.length - 1] || '').replace(/-Summary\.md$/i, '');
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

async function load() {
  const path = getParam('path');
  const meta = document.getElementById('meta');
  const article = document.getElementById('article');
  const downloadLink = document.getElementById('downloadLink');

  if (!path) {
    article.textContent = 'No file specified.';
    return;
  }

  meta.textContent = niceName(path);
  downloadLink.href = encodePath(path);
  downloadLink.download = decodeURIComponent(path.split('/').pop() || 'summary.md');
  downloadLink.hidden = false;

  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Not found');
    const md = await res.text();
    const html = marked.parse(md);
    article.innerHTML = DOMPurify.sanitize(html);
  } catch (e) {
    article.textContent = 'Failed to load summary.';
  }
}

configureBackLink();
load();
