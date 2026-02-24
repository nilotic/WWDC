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
const fallback = document.getElementById('fallback');

if (!path) {
  title.textContent = 'No PDF specified.';
} else {
  title.textContent = niceName(path);
  const rawBase = 'https://raw.githubusercontent.com/nilotic/WWDC/master/docs/';
  const rawUrl = rawBase + encodeURI(path);

  // Try Pages-served file first; fallback to raw if it isn't a PDF.
  fetch(path, { method: 'HEAD' })
    .then((res) => {
      const type = (res.headers.get('content-type') || '').toLowerCase();
      if (res.ok && type.includes('pdf')) {
        viewer.src = path;
      } else {
        viewer.src = rawUrl;
        fallback.innerHTML = `If the PDF doesn't render here, open it directly: <a href=\"${rawUrl}\">Open PDF</a>`;
      }
    })
    .catch(() => {
      viewer.src = rawUrl;
      fallback.innerHTML = `If the PDF doesn't render here, open it directly: <a href=\"${rawUrl}\">Open PDF</a>`;
    });
}
