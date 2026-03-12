function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
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

load();
