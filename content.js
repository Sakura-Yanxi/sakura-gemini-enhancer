// 内容脚本 - 检测 Gemini 的可视化 iframe，注入「放大」按钮

if (window.top === window) {
  initSakuraContentScript();
}

function initSakuraContentScript() {
// 已处理过的 iframe（用元素本身标记，避免尺寸变化导致重复）
const tagged = new WeakSet();
const htmlPreviewTagged = new WeakSet();

let htmlPreviewOverlay = null;

// 找到值得放大的 iframe：sandbox 沙箱 iframe 或 srcdoc，且足够大
function findVizFrames() {
  const frames = [...document.querySelectorAll('iframe[sandbox], iframe[srcdoc]')];
  return frames.filter((f) => {
    const r = f.getBoundingClientRect();
    return r.width > 200 && r.height > 150;
  });
}

// 给一个 iframe 注入放大按钮（放在其父元素里，跟随 iframe 位置）
function addButton(iframe) {
  if (tagged.has(iframe)) return;

  const parent = iframe.parentElement;
  if (!parent) return;
  tagged.add(iframe);

  // 补上全屏权限（改属性不会触发 reload）
  const sandbox = iframe.getAttribute('sandbox');
  if (sandbox && !sandbox.includes('allow-fullscreen')) {
    iframe.setAttribute('sandbox', sandbox + ' allow-fullscreen');
  }
  iframe.setAttribute('allowfullscreen', 'true');
  iframe.classList.add('gemini-viz-enhancer-target');

  // 确保父元素能作为定位上下文
  const pos = getComputedStyle(parent).position;
  if (pos === 'static') parent.style.position = 'relative';

  const btn = document.createElement('button');
  btn.className = 'gemini-viz-enhancer-btn';
  btn.textContent = '🔍 放大';
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    zoomIframe(iframe);
  });

  parent.appendChild(btn);
}

// 放大：让 iframe 进入浏览器原生全屏
// 不移动节点、不克隆 → 不 reload、不丢握手状态、自动绕过 stacking context
function zoomIframe(iframe) {
  const req = iframe.requestFullscreen
    || iframe.webkitRequestFullscreen
    || iframe.mozRequestFullScreen;

  if (!req) {
    alert('当前浏览器不支持全屏');
    return;
  }

  req.call(iframe).catch((err) => {
    console.error('全屏失败:', err);
    alert('无法全屏显示：' + err.message);
  });
}

// 扫描并注入
function scan() {
  findVizFrames().forEach(addButton);
  findHTMLCodeBlocks().forEach(addHTMLPreviewButton);
}

let scanScheduled = false;

function scheduleScan() {
  if (scanScheduled) return;
  scanScheduled = true;
  requestAnimationFrame(() => {
    scanScheduled = false;
    scan();
  });
}

// 初始多次扫描（内容加载有延迟）
[1000, 2500, 5000].forEach((t) => setTimeout(scheduleScan, t));

// 持续监听 DOM 变化
const observer = new MutationObserver(() => scheduleScan());
observer.observe(document.body, { childList: true, subtree: true });

function findHTMLCodeBlocks() {
  if (document.documentElement?.dataset?.sakuraHtmlPreview === 'true') return [];

  const selectors = [
    'pre',
    'code',
    'textarea',
    '[contenteditable="true"]',
    '[role="textbox"]',
    '[class*="code" i]',
    '[class*="editor" i]',
    '[class*="monaco" i]',
    '[class*="cm-" i]',
  ].join(',');

  const blocks = [];
  const seenHosts = new WeakSet();

  for (const el of document.querySelectorAll(selectors)) {
    if (el.closest('.gemini-html-preview-overlay')) continue;

    const text = getCodeText(el);
    if (!looksLikeRenderableHTML(text)) continue;

    const host = findPreviewHost(el);
    if (!host || seenHosts.has(host)) continue;

    const r = host.getBoundingClientRect();
    if (r.width < 260 || r.height < 160) continue;

    seenHosts.add(host);
    blocks.push({ host, text });
  }

  return blocks;
}

function getCodeText(el) {
  const value = 'value' in el ? el.value : el.innerText || el.textContent || '';
  return value.replace(/\u00a0/g, ' ').trim();
}

function looksLikeRenderableHTML(text) {
  if (!text || text.length < 80 || text.length > 250000) return false;

  const lower = text.toLowerCase();
  const hasDocument = lower.includes('<!doctype html') || lower.includes('<html');
  const hasBody = lower.includes('<body') || lower.includes('<canvas') || lower.includes('<svg');
  const hasClosing = lower.includes('</html>') || lower.includes('</body>') || lower.includes('</script>');

  return hasDocument && hasBody && hasClosing;
}

function findPreviewHost(el) {
  let node = el;
  if (node instanceof HTMLTextAreaElement) {
    node = node.parentElement;
  }

  for (let i = 0; i < 6 && node?.parentElement; i += 1) {
    const r = node.getBoundingClientRect();
    const parent = node.parentElement;
    const pr = parent.getBoundingClientRect();

    if (pr.width >= r.width && pr.height >= r.height && pr.height < window.innerHeight * 0.95) {
      node = parent;
      continue;
    }

    break;
  }

  return node;
}

function addHTMLPreviewButton({ host, text }) {
  if (htmlPreviewTagged.has(host)) return;
  htmlPreviewTagged.add(host);

  const pos = getComputedStyle(host).position;
  if (pos === 'static') host.style.position = 'relative';

  const btn = document.createElement('button');
  btn.className = 'gemini-html-preview-btn';
  btn.type = 'button';
  btn.textContent = '预览 HTML';
  btn.title = '把当前 HTML 代码渲染成可交互页面';
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const latestText = findLatestHTMLText(host) || text;
    showHTMLPreview(latestText);
  });

  host.appendChild(btn);
}

function findLatestHTMLText(host) {
  if (looksLikeRenderableHTML(getCodeText(host))) {
    return getCodeText(host);
  }

  for (const el of host.querySelectorAll('pre, code, textarea, [contenteditable="true"], [role="textbox"]')) {
    const text = getCodeText(el);
    if (looksLikeRenderableHTML(text)) return text;
  }

  return '';
}

function showHTMLPreview(html) {
  closeHTMLPreview();

  htmlPreviewOverlay = document.createElement('div');
  htmlPreviewOverlay.className = 'gemini-html-preview-overlay';
  htmlPreviewOverlay.innerHTML = `
    <div class="gemini-html-preview-shell" role="dialog" aria-label="HTML 预览">
      <div class="gemini-html-preview-toolbar">
        <span class="gemini-html-preview-title">HTML 预览</span>
        <div class="gemini-html-preview-actions">
          <button class="gemini-html-preview-action" type="button" data-action="fullscreen">全屏</button>
          <button class="gemini-html-preview-close" type="button" aria-label="关闭">×</button>
        </div>
      </div>
      <iframe class="gemini-html-preview-frame" data-sakura-html-preview-frame="true" sandbox="allow-scripts allow-forms allow-modals allow-popups allow-downloads"></iframe>
    </div>
  `;

  document.body.appendChild(htmlPreviewOverlay);

  const frame = htmlPreviewOverlay.querySelector('.gemini-html-preview-frame');
  frame.referrerPolicy = 'no-referrer';
  frame.srcdoc = injectPreviewMarker(html);

  htmlPreviewOverlay.querySelector('.gemini-html-preview-close').addEventListener('click', closeHTMLPreview);
  htmlPreviewOverlay.addEventListener('click', (e) => {
    if (e.target === htmlPreviewOverlay) closeHTMLPreview();
  });

  htmlPreviewOverlay.querySelector('[data-action="fullscreen"]').addEventListener('click', () => {
    const req = frame.requestFullscreen
      || frame.webkitRequestFullscreen
      || frame.mozRequestFullScreen;
    if (req) req.call(frame);
  });
}

function closeHTMLPreview() {
  if (!htmlPreviewOverlay) return;
  htmlPreviewOverlay.remove();
  htmlPreviewOverlay = null;
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeHTMLPreview();
});
}

function injectPreviewMarker(html) {
  const marker = '<script>document.documentElement.dataset.sakuraHtmlPreview="true";</script>';
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${marker}`);
  }
  return `${marker}${html}`;
}
