# Sakura - Gemini 增强工具

Sakura 是一个轻量级 Chrome 扩展，用来增强 Gemini、Google AI Studio 以及部分 AI 对话网站的日常使用体验。

它目前提供两个核心能力：

- **可视化 iframe 全屏放大**：在 Gemini / AI Studio 生成的可交互可视化内容右上角注入「放大」按钮，点击后进入浏览器原生全屏。
- **划词翻译**：选中英文单词、词组或句子后，自动弹出翻译卡片。单词优先查词典，短语和句子走整段翻译。

项目使用 Manifest V3，纯原生 JavaScript / CSS 实现，无构建步骤，无第三方运行依赖。

如果你只是想安装使用，可以直接看：[保姆级安装与使用教程](TUTORIAL.md)。

## 功能概览

### 1. 可视化放大

适用页面：

- `https://gemini.google.com/*`
- `https://aistudio.google.com/*`

当页面中出现足够大的沙箱 `iframe` 或 `srcdoc iframe` 时，扩展会自动在 iframe 的父容器右上角添加「🔍 放大」按钮。

点击后：

- iframe 进入浏览器原生全屏；
- 原有交互状态保留；
- 不克隆、不移动 iframe；
- 不触发 iframe 重新加载；
- 按 `Esc` 可退出全屏。

这个功能主要用于查看 Gemini 生成的图表、Canvas、小游戏、HTML demo、可交互页面等内容。

### 2. 划词翻译

适用页面：

- `https://gemini.google.com/*`
- `https://aistudio.google.com/*`
- `https://chat.deepseek.com/*`
- `https://*.qianwen.com/*`
- `https://tongyi.aliyun.com/*`
- `https://*.tongyi.ai/*`
- `https://*.tongyi.com/*`
- `https://*.doubao.com/*`

使用方式：

1. 在支持的网站中选中英文文本。
2. 松开鼠标后会出现翻译弹窗。
3. 点击弹窗右上角关闭按钮，或滚动页面，弹窗会隐藏。

识别规则：

- 选中文本必须包含英文字母；
- 选中文本不能包含中文；
- 选中文本长度不能超过 200 个字符；
- 单个英文单词优先查词典；
- 词组、句子或词典查不到的单词会走整段翻译。

单词结果会尽量显示：

- 美式音标；
- 英式音标；
- 词性；
- 中文释义；
- 兜底英文释义。

词组和句子结果会显示整段中文译文。

## 安装方法

当前扩展未上架 Chrome 网上应用店，需要通过开发者模式手动加载。

1. 下载或克隆本项目到本地。
2. 打开 Chrome。
3. 进入 `chrome://extensions/`。
4. 打开右上角「开发者模式」。
5. 点击「加载已解压的扩展程序」。
6. 选择本项目所在文件夹。
7. 打开 Gemini、AI Studio 或其他支持的网站即可使用。

更新代码后，需要：

1. 回到 `chrome://extensions/`。
2. 找到 Sakura 扩展。
3. 点击刷新按钮。
4. 刷新目标网页。

## 项目结构

| 文件 | 说明 |
| --- | --- |
| `manifest.json` | Chrome 扩展配置，声明 content scripts、background service worker、图标和接口权限 |
| `background.js` | 后台 service worker，负责请求翻译和词典接口 |
| `content.js` | Gemini / AI Studio 可视化 iframe 检测与放大按钮注入 |
| `content.css` | iframe 放大按钮和全屏背景样式 |
| `translation.js` | 划词翻译弹窗逻辑、选区判断、结果渲染 |
| `translation.css` | 翻译弹窗样式 |
| `icons/` | 扩展图标 |
| `LICENSE` | MIT License |

## 权限说明

`manifest.json` 中声明了以下接口访问权限：

| 权限 | 用途 |
| --- | --- |
| `https://dict.youdao.com/*` | 查询有道词典和有道翻译兜底结果 |
| `https://api.dictionaryapi.dev/*` | 查询 Free Dictionary 英文释义 |
| `https://translate.googleapis.com/*` | 查询 Google Translate 非官方公开端点 |
| `https://api.mymemory.translated.net/*` | 查询 MyMemory 翻译结果 |
| `https://edge.microsoft.com/*` | 获取 Edge/Microsoft 翻译临时认证 |
| `https://api-edge.cognitive.microsofttranslator.com/*` | 查询 Edge/Microsoft 翻译结果 |
| `https://api.github.com/*` | 检查 GitHub Release 是否有新版本 |

扩展没有声明 `storage`、`cookies`、`tabs` 等权限。

Sakura 不保存用户选中文本，不收集用户数据，不向自建服务器上传内容。划词文本只会被发送到上述公开翻译或词典接口，用于返回翻译结果。

## 翻译策略

扩展会根据选中文本自动选择查询链路。

### 单个英文单词

单词正则：

```js
/^[a-zA-Z]+(?:[-'][a-zA-Z]+)*$/
```

查询顺序：

1. 有道词典：优先返回中文释义和音标。
2. Free Dictionary：有道无结果时，返回英文释义。
3. 整段翻译：词典都查不到时，按短语或句子处理。

如果单词包含连字符，例如 `over-invest`，并且完整单词查不到，扩展会尝试查询最后一段词根，例如 `invest`。

### 词组和句子

查询顺序：

1. 短词组优先查有道词组释义。
2. Edge/Microsoft 翻译。
3. Google Translate 公开端点。
4. MyMemory。
5. 有道词组释义 / `fanyi` 字段兜底。

每个接口请求都有 6 秒超时。某个接口失败、超时或返回无效内容时，会自动尝试下一个接口。

## 技术原理

### 为什么可视化放大使用原生全屏

Gemini 生成的可视化内容通常运行在跨域沙箱 iframe 中，例如 Google 用户内容域名下的 iframe。由于浏览器同源策略限制，content script 无法读取 iframe 内部 DOM，也无法可靠地把内部 HTML 提取出来重新渲染。

如果强行移动、克隆或重建 iframe，容易导致：

- iframe 内容空白；
- 交互状态丢失；
- 内部脚本重新加载；
- 跨域校验失败；
- 原页面样式层级遮挡。

因此 Sakura 使用 `requestFullscreen()` 让原 iframe 直接进入浏览器 top layer。这样既绕开页面层级问题，又能保留 iframe 内部完整状态。

### 为什么翻译请求走 background

Gemini 等页面通常设置了严格的 CSP。content script 虽然可以读取用户选区和渲染弹窗，但直接从页面上下文请求外部翻译接口容易被 CSP 拦截。

Sakura 的做法是：

1. `translation.js` 读取选中文本。
2. 通过 `chrome.runtime.sendMessage()` 发给 `background.js`。
3. `background.js` 作为 service worker 请求外部接口。
4. 查询结果回传给 content script。
5. `translation.js` 渲染弹窗。

### 渲染安全

翻译结果来自外部公开接口。为了避免接口返回的特殊字符或 HTML 片段被直接执行，弹窗渲染时会对外部文本做 HTML 转义。

此外，划词请求带有序号保护：如果用户快速连续选中多个文本，较早请求即使更晚返回，也不会覆盖最新弹窗。

## 开发与调试

本项目没有打包流程，修改源码后直接刷新扩展即可。

未上架 Chrome Web Store 时，扩展不能真正自动替换本地文件。Sakura 会在支持的网站上检查 GitHub 最新 Release；如果发现新版本，会在页面右下角提示并提供下载链接。

建议的调试流程：

1. 修改 `.js` 或 `.css` 文件。
2. 打开 `chrome://extensions/`。
3. 点击 Sakura 扩展卡片上的刷新按钮。
4. 刷新目标网站。
5. 打开页面 DevTools 查看 content script 日志。
6. 在扩展详情页进入 service worker 控制台查看 background 日志。

可以用 Node 做基础语法检查：

```powershell
node --check background.js
node --check content.js
node --check translation.js
```

## 常见问题

### 为什么没有出现「放大」按钮？

可能原因：

- 当前页面不是 Gemini 或 AI Studio；
- 页面中还没有生成可视化 iframe；
- iframe 尺寸太小，未达到检测阈值；
- 页面内容尚未加载完成，可以稍等几秒；
- 扩展修改后没有在 `chrome://extensions/` 中刷新。

### 为什么点击放大后失败？

可能原因：

- 浏览器不支持当前元素的全屏 API；
- 页面或 iframe 限制了全屏权限；
- 点击动作没有被浏览器识别为用户手势；
- Chrome 扩展未刷新到最新版本。

### 为什么划词没有翻译？

可能原因：

- 选中文本包含中文；
- 选中文本超过 200 个字符；
- 当前网站不在支持列表中；
- 翻译接口不可用、被限流或网络无法访问；
- background service worker 尚未唤醒，可以重新划词尝试。

### 为什么翻译偶尔不准确？

扩展使用的是公开翻译和词典接口，未接入付费官方翻译服务。不同接口质量、可用性和限流策略都可能变化。单词释义通常更稳定，长句翻译可能受接口状态影响。

### 是否支持 Firefox / Edge？

当前主要面向 Chrome Manifest V3。Microsoft Edge 通常可以加载 Chrome 扩展源码。Firefox 的 MV3 实现和 API 细节不同，未做兼容测试。

## 隐私说明

Sakura 不包含账户系统，不写入本地存储，不追踪访问记录，不上传页面内容。

只有当你主动选中英文文本时，该文本才会被发送到公开词典或翻译接口用于查询。可视化放大功能不会发送任何网络请求。

## 已知限制

- 翻译接口均为公开接口，可能被限流、变更或失效。
- Google Translate 公开端点在部分网络环境下可能不可访问。
- 可视化放大依赖页面中存在可全屏的 iframe。
- 划词翻译只处理英文到中文。
- 暂无配置页，暂不支持自定义目标语言、快捷键或接口顺序。

## License

[MIT](LICENSE) © Sakura
