function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function niceName(path) {
  if (!path) return '';
  const parts = path.split('/');
  return decodeURIComponent(parts[parts.length - 1] || '');
}

const path = getParam('path');
const title = document.getElementById('title');
const viewer = document.getElementById('viewer');

if (!path) {
  title.textContent = 'No PDF specified.';
} else {
  title.textContent = niceName(path);
  viewer.src = path;
}
