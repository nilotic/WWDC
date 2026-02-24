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
  const mediaBase = 'https://media.githubusercontent.com/media/nilotic/WWDC/master/docs/';
  const pdfjsBase = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/web/viewer.html?file=';
  const encoded = encodeURI(path);
  const rawUrl = rawBase + encoded;
  const mediaUrl = mediaBase + encoded;
  const pagesUrl = path;

  const viewerUrl = (fileUrl) => `${pdfjsBase}${encodeURIComponent(fileUrl)}`;

  // Prefer media URL for LFS compatibility, but allow Pages if it serves real PDFs.
  fetch(pagesUrl, { method: 'HEAD' })
    .then((res) => {
      const type = (res.headers.get('content-type') || '').toLowerCase();
      if (res.ok && type.includes('pdf')) {
        viewer.src = viewerUrl(pagesUrl);
        fallback.innerHTML = `Open directly: <a href="${pagesUrl}">Pages</a> · <a href="${mediaUrl}">Media</a> · <a href="${rawUrl}">Raw</a>`;
      } else {
        viewer.src = viewerUrl(mediaUrl);
        fallback.innerHTML = `If the PDF doesn't render here, open it directly: <a href="${mediaUrl}">Media</a> · <a href="${rawUrl}">Raw</a>`;
      }
    })
    .catch(() => {
      viewer.src = viewerUrl(mediaUrl);
      fallback.innerHTML = `If the PDF doesn't render here, open it directly: <a href="${mediaUrl}">Media</a> · <a href="${rawUrl}">Raw</a>`;
    });
}
