// 划词翻译：选中英文文本，在后台查询词典/翻译并弹窗显示

let popup = null;
let translationRequestId = 0;
let updateNotice = null;

// 词性英文转缩写
const POS_MAP = {
  noun: 'n.', verb: 'v.', adjective: 'adj.', adverb: 'adv.',
  pronoun: 'pron.', preposition: 'prep.', conjunction: 'conj.',
  interjection: 'int.', determiner: 'det.'
};

function createPopup() {
  if (popup) return popup;
  popup = document.createElement('div');
  popup.className = 'gemini-translation-popup';
  popup.innerHTML = `
    <div class="translation-header">
      <span class="translation-word"></span>
      <button class="translation-close">×</button>
    </div>
    <div class="translation-content"></div>
  `;
  document.body.appendChild(popup);
  popup.querySelector('.translation-close').addEventListener('click', (e) => {
    e.stopPropagation();
    hidePopup();
  });
  return popup;
}

function showPopup(text, x, y) {
  const el = createPopup();
  const requestId = ++translationRequestId;
  el.querySelector('.translation-word').textContent = text;
  el.querySelector('.translation-content').innerHTML =
    '<div class="translation-loading">翻译中...</div>';

  el.style.display = 'flex';
  el.style.left = `${x}px`;
  el.style.top = `${y + 10}px`;

  // 避免超出屏幕
  requestAnimationFrame(() => {
    const r = el.getBoundingClientRect();
    if (r.right > window.innerWidth) el.style.left = `${window.innerWidth - r.width - 10}px`;
    if (r.bottom > window.innerHeight) el.style.top = `${y - r.height - 10}px`;
  });

  // 后台查询（绕过页面 CSP）
  chrome.runtime.sendMessage({ action: 'translate', word: text }, (data) => {
    if (requestId !== translationRequestId) return;

    const content = el.querySelector('.translation-content');
    if (chrome.runtime.lastError) {
      content.innerHTML = '<div class="translation-error">连接后台失败，请重试</div>';
      return;
    }
    content.innerHTML = render(data);
  });
}

function hidePopup() {
  if (popup) popup.style.display = 'none';
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

// 渲染翻译结果
function render(data) {
  if (!data) return '<div class="translation-error">未找到翻译</div>';

  let html = '';

  if (data.source === 'youdao') {
    if (data.usphone || data.ukphone) {
      html += '<div class="translation-phonetic">';
      if (data.usphone) html += `<span>美 [${escapeHTML(data.usphone)}]</span> `;
      if (data.ukphone) html += `<span>英 [${escapeHTML(data.ukphone)}]</span>`;
      html += '</div>';
    }
    html += '<div class="translation-meanings">';
    for (const item of data.trs || []) {
      const { pos, meaning } = splitPos(item);
      html += `<div class="translation-meaning"><span class="pos-tag">${escapeHTML(pos)}</span>${escapeHTML(meaning)}</div>`;
    }
    html += '</div>';
  } else if (data.source === 'freedict') {
    if (data.phonetic) {
      html += `<div class="translation-phonetic"><span>${escapeHTML(data.phonetic)}</span></div>`;
    }
    html += '<div class="translation-meanings">';
    for (const m of data.meanings || []) {
      const pos = POS_MAP[m.pos?.toLowerCase()] || m.pos;
      for (const def of m.definitions || []) {
        const short = def.length > 50 ? def.slice(0, 50) + '...' : def;
        html += `<div class="translation-meaning"><span class="pos-tag">${escapeHTML(pos)}</span>${escapeHTML(short)}</div>`;
      }
    }
    html += '</div>';
  } else if (data.source === 'phrase') {
    // 词组/句子：整段译文
    html += `<div class="translation-meanings"><div class="translation-meaning">${escapeHTML(data.text)}</div></div>`;
  }

  return html || '<div class="translation-error">未找到翻译</div>';
}

// 从有道释义中分离词性缩写
function splitPos(text) {
  const m = text.match(/^(n\.|v\.|adj\.|adv\.|prep\.|conj\.|pron\.|int\.|vi\.|vt\.|aux\.)\s*/);
  if (m) return { pos: m[1], meaning: text.slice(m[0].length).trim() };
  return { pos: '', meaning: text };
}

// 判断是否为「需要翻译的英文」：含字母、不含中文、长度合理
function isEnglishSelection(text) {
  if (!text || text.length > 200) return false;
  if (/[一-鿿]/.test(text)) return false; // 含中文则不翻译
  return /[a-zA-Z]/.test(text);
}

// 选中英文时触发
document.addEventListener('mouseup', (e) => {
  if (popup && popup.contains(e.target)) return;

  setTimeout(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      hidePopup();
      return;
    }

    const text = selection.toString().trim();
    if (isEnglishSelection(text)) {
      const r = selection.getRangeAt(0).getBoundingClientRect();
      showPopup(text, r.left + r.width / 2, r.bottom + window.scrollY);
    } else if (popup) {
      hidePopup();
    }
  }, 10);
});

document.addEventListener('scroll', hidePopup, true);

setTimeout(checkExtensionUpdate, 2500);

function checkExtensionUpdate() {
  if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) return;

  chrome.runtime.sendMessage({ action: 'checkUpdate' }, (update) => {
    if (chrome.runtime.lastError || !update?.hasUpdate) return;
    if (isUpdateDismissed(update.latestVersion)) return;

    showUpdateNotice(update);
  });
}

function isUpdateDismissed(version) {
  try {
    return localStorage.getItem('sakura-update-dismissed-version') === version;
  } catch {
    return false;
  }
}

function dismissUpdateNotice(version) {
  try {
    localStorage.setItem('sakura-update-dismissed-version', version);
  } catch {
    // 忽略站点禁用 localStorage 的情况
  }
}

function showUpdateNotice(update) {
  if (updateNotice) updateNotice.remove();

  updateNotice = document.createElement('div');
  updateNotice.className = 'sakura-update-notice';
  updateNotice.innerHTML = `
    <button class="sakura-update-close" type="button" aria-label="关闭">×</button>
    <div class="sakura-update-title">Sakura 有新版本</div>
    <div class="sakura-update-text">当前 ${escapeHTML(update.currentVersion)}，最新 ${escapeHTML(update.latestVersion)}</div>
    <div class="sakura-update-actions">
      <a class="sakura-update-download" href="${escapeHTML(update.downloadUrl || update.releaseUrl)}" target="_blank" rel="noopener noreferrer">下载更新</a>
      <button class="sakura-update-later" type="button">稍后</button>
    </div>
  `;

  updateNotice.querySelector('.sakura-update-close').addEventListener('click', () => {
    dismissUpdateNotice(update.latestVersion);
    updateNotice.remove();
    updateNotice = null;
  });

  updateNotice.querySelector('.sakura-update-later').addEventListener('click', () => {
    updateNotice.remove();
    updateNotice = null;
  });

  document.body.appendChild(updateNotice);
}
