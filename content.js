// 内容脚本 - 检测 Gemini 的可视化 iframe，注入「放大」按钮

if (window.top === window) {
  initSakuraContentScript();
}

function initSakuraContentScript() {
  const tagged = new WeakSet();

  function findVizFrames() {
    const frames = [...document.querySelectorAll('iframe[sandbox], iframe[srcdoc]')];
    return frames.filter((frame) => {
      const rect = frame.getBoundingClientRect();
      return rect.width > 200 && rect.height > 150;
    });
  }

  function addButton(iframe) {
    if (tagged.has(iframe)) return;

    const parent = iframe.parentElement;
    if (!parent) return;
    tagged.add(iframe);

    const sandbox = iframe.getAttribute('sandbox');
    if (sandbox && !sandbox.includes('allow-fullscreen')) {
      iframe.setAttribute('sandbox', `${sandbox} allow-fullscreen`);
    }
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.classList.add('gemini-viz-enhancer-target');

    if (getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    const button = document.createElement('button');
    button.className = 'gemini-viz-enhancer-btn';
    button.textContent = '🔍 放大';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      zoomIframe(iframe);
    });

    parent.appendChild(button);
  }

  function zoomIframe(iframe) {
    const requestFullscreen = iframe.requestFullscreen
      || iframe.webkitRequestFullscreen
      || iframe.mozRequestFullScreen;

    if (!requestFullscreen) {
      alert('当前浏览器不支持全屏');
      return;
    }

    const result = requestFullscreen.call(iframe);
    if (result?.catch) {
      result.catch((error) => {
        console.error('全屏失败:', error);
        alert(`无法全屏显示：${error.message}`);
      });
    }
  }

  function scan() {
    findVizFrames().forEach(addButton);
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

  [1000, 2500, 5000].forEach((delay) => setTimeout(scheduleScan, delay));

  const observer = new MutationObserver(scheduleScan);
  observer.observe(document.body, { childList: true, subtree: true });
}
