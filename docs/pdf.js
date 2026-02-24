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
const debugEl = document.getElementById('debug');
const progressEl = document.getElementById('progress');
const progressBar = document.getElementById('progressBar');
const pagesEl = document.getElementById('pages');
const downloadBtn = document.getElementById('download');

let pdfDoc = null;
const errors = [];
let downloadUrl = null;

function setStatus(msg) {
  statusEl.textContent = msg;
}

function setDebug(msg) {
  debugEl.textContent = msg || '';
}

function setProgress(pct) {
  if (pct == null) {
    progressEl.classList.add('indeterminate');
    progressBar.style.width = '40%';
    return;
  }
  progressEl.classList.remove('indeterminate');
  progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
}

async function renderAllPages() {
  pagesEl.innerHTML = '';
  const total = pdfDoc.numPages;

  for (let i = 1; i <= total; i += 1) {
    setStatus(`Rendering page ${i} / ${total}…`);
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1.2 });
    const wrapper = document.createElement('div');
    wrapper.className = 'page';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    wrapper.appendChild(canvas);
    pagesEl.appendChild(wrapper);
    await page.render({ canvasContext: ctx, viewport }).promise;
  }
  setStatus('');
}

async function fetchWithProgress(url) {
  const res = await fetch(url, { mode: 'cors', cache: 'no-store', redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const type = (res.headers.get('content-type') || '').toLowerCase();
  const length = Number(res.headers.get('content-length') || 0);

  if (!res.body || !res.body.getReader) {
    const buf = await res.arrayBuffer();
    return { buf, type };
  }

  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;

  if (!length) {
    setProgress(null);
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (length) {
      const pct = Math.round((received / length) * 100);
      setProgress(pct);
      setStatus(`Downloading… ${pct}%`);
    }
  }

  const buf = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    buf.set(chunk, offset);
    offset += chunk.length;
  }

  if (length) setProgress(100);
  return { buf: buf.buffer, type };
}

async function loadPdf(urls) {
  const tryUrls = [urls.mediaUrl, urls.rawUrl, urls.pagesUrl];
  for (const url of tryUrls) {
    try {
      setStatus(`Loading PDF from ${url}…`);
      if (!window.pdfjsLib) throw new Error('pdf.js not loaded');

      const { buf, type } = await fetchWithProgress(url);
      if (!buf || buf.byteLength < 1024) throw new Error('Empty response');
      const header = new TextDecoder().decode(buf.slice(0, 5));
      if (type.includes('html') || header !== '%PDF-') {
        throw new Error(`Not a PDF (type=${type || 'unknown'})`);
      }

      downloadUrl = url;
      downloadBtn.disabled = false;

      setStatus('Rendering…');
      const loadingTask = pdfjsLib.getDocument({ data: buf });
      pdfDoc = await loadingTask.promise;
      await renderAllPages();
      setStatus('');
      setDebug('');
      setProgress(100);
      return;
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      errors.push(`${url} → ${msg}`);
      setDebug(errors.join('\n'));
      setStatus(`Failed to load from ${url}`);
    }
  }
  setStatus('All sources failed. Use Download to try again later.');
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

  downloadBtn.disabled = true;
  downloadBtn.addEventListener('click', () => {
    if (downloadUrl) window.open(downloadUrl, '_blank');
  });

  if (!window.pdfjsLib) {
    setStatus('pdf.js failed to load. Check network or CSP.');
    setDebug('pdf.js global not found');
  } else {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    setProgress(0);
    loadPdf({ pagesUrl, mediaUrl, rawUrl });
  }
}
