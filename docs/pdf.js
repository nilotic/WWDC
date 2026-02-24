function getParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function niceName(path) {
  if (!path) return '';
  const parts = path.split('/');
  return decodeURIComponent(parts[parts.length - 1] || '');
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

const path = getParam('path');
const title = document.getElementById('title');
const statusEl = document.getElementById('status');
const canvas = document.getElementById('canvas');
const pageInfo = document.getElementById('pageInfo');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const linksEl = document.getElementById('links');
const debugEl = document.getElementById('debug');

let pdfDoc = null;
let pageNum = 1;
const errors = [];

function setStatus(msg) {
  statusEl.textContent = msg;
}

function setDebug(msg) {
  debugEl.textContent = msg || '';
}

function buildLinks(pagesUrl, mediaUrl, rawUrl) {
  linksEl.innerHTML = `<a href="${pagesUrl}">Pages</a> · <a href="${mediaUrl}">Media</a> · <a href="${rawUrl}">Raw</a>`;
}

async function renderPage(num) {
  const page = await pdfDoc.getPage(num);
  const viewport = page.getViewport({ scale: 1.2 });
  const ctx = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  await page.render({ canvasContext: ctx, viewport }).promise;
  pageInfo.textContent = `Page ${num} / ${pdfDoc.numPages}`;
  prevBtn.disabled = num <= 1;
  nextBtn.disabled = num >= pdfDoc.numPages;
}

async function loadPdf(urls) {
  const tryUrls = [urls.mediaUrl, urls.rawUrl, urls.pagesUrl];
  for (const url of tryUrls) {
    try {
      setStatus(`Loading PDF from ${url}…`);
      if (!window.pdfjsLib) throw new Error('pdf.js not loaded');
      const res = await fetch(url, { mode: 'cors', cache: 'no-store', redirect: 'follow' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const type = (res.headers.get('content-type') || '').toLowerCase();
      const buf = await res.arrayBuffer();
      if (!buf || buf.byteLength < 1024) throw new Error('Empty response');
      const header = new TextDecoder().decode(buf.slice(0, 5));
      if (type.includes('html') || header !== '%PDF-') {
        throw new Error(`Not a PDF (type=${type || 'unknown'})`);
      }
      const loadingTask = pdfjsLib.getDocument({ data: buf });
      pdfDoc = await loadingTask.promise;
      pageNum = 1;
      await renderPage(pageNum);
      setStatus('');
      setDebug('');
      return;
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      errors.push(`${url} → ${msg}`);
      setDebug(errors.join('\n'));
      setStatus(`Failed to load from ${url}`);
    }
  }
  setStatus('All sources failed. Use direct links above to download.');
  if (errors.length) setDebug(errors.join('\n'));
}

if (!path) {
  title.textContent = 'No PDF specified.';
} else {
  title.textContent = niceName(path);
  const encoded = encodePath(path);
  const pagesUrl = path;
  const rawUrl = `https://raw.githubusercontent.com/nilotic/WWDC/master/docs/${encoded}`;
  const mediaUrl = `https://media.githubusercontent.com/media/nilotic/WWDC/master/docs/${encoded}`;

  if (!window.pdfjsLib) {
    setStatus('pdf.js failed to load. Check network or CSP.');
    setDebug('pdf.js global not found');
    buildLinks(pagesUrl, mediaUrl, rawUrl);
  } else {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    buildLinks(pagesUrl, mediaUrl, rawUrl);
    loadPdf({ pagesUrl, mediaUrl, rawUrl });
  }
}

prevBtn.addEventListener('click', async () => {
  if (!pdfDoc || pageNum <= 1) return;
  pageNum -= 1;
  await renderPage(pageNum);
});

nextBtn.addEventListener('click', async () => {
  if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
  pageNum += 1;
  await renderPage(pageNum);
});
