# Sakura 保姆级安装与使用教程

这份教程写给第一次安装 Chrome 扩展、第一次从 GitHub 下载项目的用户。照着做就行，不需要会写代码。

## 你需要准备什么

你只需要：

- 一台能打开 Chrome 或 Microsoft Edge 的电脑；
- 能访问 GitHub；
- 能打开 Gemini、Google AI Studio 或其他支持的网站。

不需要安装 Node.js，不需要安装 Git，不需要运行命令。

## 第一步：打开项目页面

项目地址：

```text
https://github.com/Sakura-Yanxi/sakura-gemini-enhancer
```

打开后，你会看到 Sakura 的 GitHub 项目主页。

如果你想支持一下项目，可以点击页面右上角的 `Star`。这一步不是安装必需的，只是收藏和支持项目。

## 第二步：下载扩展压缩包

推荐从 Release 下载已经打包好的版本。

1. 打开项目页面。
2. 找到右侧或页面中的 `Releases`。
3. 点击最新版本，例如 `Sakura v1.0.0`。
4. 在 `Assets` 下面找到这个文件：

```text
sakura-gemini-enhancer-v1.0.0.zip
```

5. 点击下载。

下载后，你会得到一个 `.zip` 压缩包。

## 第三步：解压压缩包

Chrome 不能直接加载 `.zip` 文件，必须先解压。

推荐这样做：

1. 在下载目录找到 `sakura-gemini-enhancer-v1.0.0.zip`。
2. 右键这个文件。
3. 选择「全部解压」或「解压到当前文件夹」。
4. 解压后得到一个文件夹。

接下来要记住这个原则：

你要加载的是包含 `manifest.json` 的那个文件夹。

打开解压后的文件夹，正常应该能看到这些文件：

```text
manifest.json
background.js
content.js
content.css
translation.js
translation.css
icons
README.md
CHANGELOG.md
LICENSE
```

如果你没看到 `manifest.json`，说明你选错了文件夹，需要再往里面打开一层，直到看到 `manifest.json`。

不要只选择 `icons` 文件夹，也不要选择还没解压的 `.zip` 文件。

## 第四步：打开 Chrome 扩展管理页

打开 Chrome，在地址栏输入：

```text
chrome://extensions/
```

然后按回车。

如果你用的是 Microsoft Edge，可以输入：

```text
edge://extensions/
```

## 第五步：开启开发者模式

进入扩展管理页后，看页面右上角。

找到「开发者模式」，把它打开。

打开后，页面上会出现一些按钮，比如：

- 加载已解压的扩展程序；
- 打包扩展程序；
- 更新。

你只需要用第一个。

## 第六步：加载 Sakura 扩展

1. 点击「加载已解压的扩展程序」。
2. 在弹出的文件夹选择窗口里，找到刚才解压出来的文件夹。
3. 选择包含 `manifest.json` 的那个文件夹。
4. 点击「选择文件夹」。

如果成功，你会在扩展列表里看到：

```text
Sakura
```

如果失败，请看下面的排错：

### 报错：Manifest file is missing or unreadable

意思是 Chrome 没找到 `manifest.json`。

解决方法：

1. 不要选择 `.zip` 文件。
2. 不要选择 `icons` 文件夹。
3. 选择能直接看到 `manifest.json` 的文件夹。

### 报错：无法加载扩展

先确认：

- 文件有没有完整解压；
- 文件夹里有没有 `manifest.json`；
- Chrome 是否开启了开发者模式；
- 下载的是否是 Release 里的 `sakura-gemini-enhancer-v1.0.0.zip`。

## 第七步：固定扩展图标

这一步不是必须，但方便确认扩展已经安装。

1. 点击 Chrome 地址栏右侧的拼图图标。
2. 找到 `Sakura`。
3. 点击旁边的图钉按钮。

固定后，浏览器右上角会出现 Sakura 的扩展图标。

## 第八步：测试可视化放大功能

可视化放大功能只在这些网站生效：

```text
https://gemini.google.com/
https://aistudio.google.com/
```

测试方法：

1. 打开 Gemini 或 Google AI Studio。
2. 让它生成一个可视化内容，比如图表、HTML 页面、Canvas demo 或交互小游戏。
3. 等内容加载出来。
4. 如果页面里出现较大的 iframe，右上角会出现「放大」按钮。
5. 点击「放大」。
6. 内容会进入全屏。
7. 按 `Esc` 退出全屏。

如果没有看到「放大」按钮：

- 等几秒，内容可能还没加载完；
- 确认是在 Gemini 或 AI Studio；
- 确认页面里真的有可视化 iframe；
- 回到 `chrome://extensions/`，点击 Sakura 的刷新按钮；
- 刷新 Gemini / AI Studio 页面。

## 第九步：测试划词翻译功能

划词翻译支持这些网站：

```text
https://gemini.google.com/
https://aistudio.google.com/
https://chat.deepseek.com/
https://*.qianwen.com/
https://tongyi.aliyun.com/
https://*.tongyi.ai/
https://*.tongyi.com/
https://*.doubao.com/
```

测试方法：

1. 打开支持的网站。
2. 找一段英文文本。
3. 用鼠标选中一个英文单词，例如 `example`。
4. 松开鼠标。
5. 页面上会弹出翻译卡片。

如果选中的是单词，通常会看到：

- 音标；
- 词性；
- 释义。

如果选中的是句子，通常会看到整句中文翻译。

如果不想看弹窗：

- 点击弹窗右上角关闭按钮；
- 或者滚动页面，弹窗会自动隐藏。

## 第十步：以后怎么更新

如果项目发布了新版本，你需要重新下载新的 Release zip。

从 `v1.0.2` 开始，Sakura 会在支持的网站中检查 GitHub 最新 Release。如果发现你本地版本落后，会在页面右下角提示「Sakura 有新版本」，点击「下载更新」就会打开新版下载地址。

这个提示不是自动安装。Chrome 开发者模式扩展不能自己替换本地文件，所以下载后仍然需要手动解压、覆盖文件夹、刷新扩展。

更新流程：

1. 打开项目 Release 页面。
2. 下载最新的 `.zip` 文件。
3. 解压到一个固定文件夹。
4. 如果你想覆盖旧版本，可以先删除旧文件夹内容，再放入新文件。
5. 打开 `chrome://extensions/`。
6. 找到 Sakura。
7. 点击刷新按钮。
8. 刷新正在使用的网站。

注意：

Chrome 加载的是你电脑上的文件夹。安装后不要随手删除这个文件夹，否则扩展下次可能无法正常加载。

建议把扩展放在一个固定位置，例如：

```text
D:\ChromeExtensions\sakura-gemini-enhancer
```

或者：

```text
C:\Users\你的用户名\Documents\ChromeExtensions\sakura-gemini-enhancer
```

## 第十一步：怎么暂时关闭或卸载

打开：

```text
chrome://extensions/
```

找到 Sakura。

如果只是暂时不用：

1. 关闭 Sakura 卡片右下角的开关。

如果想完全卸载：

1. 点击「移除」。
2. 确认移除。

卸载后，如果你不再需要本地文件夹，也可以删除解压出来的文件夹。

## 常见问题速查

### 我下载了源码 zip，可以安装吗？

可以，但更推荐下载 Release 里的 `sakura-gemini-enhancer-v1.0.0.zip`。

GitHub 页面绿色 `Code` 按钮下载的是源码压缩包，也能用，但里面可能会多一层文件夹。你仍然要选择包含 `manifest.json` 的那一层。

### 为什么 Chrome 提示开发者模式扩展？

因为 Sakura 还没有上架 Chrome 网上应用店，是手动加载的扩展。Chrome 对所有手动加载的扩展都会这样提示，这是正常现象。

### 为什么划词翻译有时候没反应？

常见原因：

- 选中的不是英文；
- 选中文本里包含中文；
- 选中文本太长；
- 当前网站不在支持列表；
- 翻译接口临时不可用；
- 网络访问不到某个翻译接口。

可以换一个短英文单词再试，比如：

```text
visualization
```

### 为什么翻译结果有时候一般？

Sakura 使用公开词典和翻译接口，不是付费官方翻译服务。单词释义通常比较稳定，长句翻译会受到接口质量和网络状态影响。

### 为什么 Gemini 里没有放大按钮？

放大按钮只会出现在比较大的 iframe 上。

如果 Gemini 回复的是普通文字、Markdown、代码块，扩展不会添加放大按钮。只有当 Gemini 生成了可视化页面、图表、Canvas、HTML demo 等 iframe 内容时，按钮才有机会出现。

### 我可以把扩展文件夹移动到别处吗？

可以，但移动后需要重新加载：

1. 打开 `chrome://extensions/`。
2. 移除旧的 Sakura。
3. 点击「加载已解压的扩展程序」。
4. 选择移动后的新文件夹。

### 安装后需要登录 Sakura 吗？

不需要。Sakura 没有账户系统。

### Sakura 会收集我的数据吗？

不会。Sakura 不保存历史记录，不写入本地存储，不上传页面内容。

只有当你主动选中英文文本时，这段文本才会被发送到公开翻译或词典接口，用来返回翻译结果。

## 一句话总结

普通用户安装 Sakura，只要记住这条线：

```text
下载 Release zip -> 解压 -> Chrome 扩展页开启开发者模式 -> 加载包含 manifest.json 的文件夹 -> 刷新目标网站
```

能看到 `Sakura` 扩展卡片，就说明安装成功了。
