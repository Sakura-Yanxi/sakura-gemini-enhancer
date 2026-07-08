# Changelog

## v1.0.4 - 2026-07-08

### Added

- Added Windows one-click updater scripts: `update.bat` and `update.ps1`.
- The updater downloads the latest GitHub Release zip and syncs local extension files.
- Stale files from older versions are removed during update while development folders such as `.git` and `dist` are preserved.

## v1.0.3 - 2026-07-08

### Fixed

- Added Youdao `web_trans` parsing for short phrases such as "critical mass".
- Short phrases now try dictionary phrase entries before online machine translation.

## v1.0.2 - 2026-07-07

### Added

- Added GitHub Release update checker.
- Shows an in-page notice when a newer Sakura version is available.

## v1.0.1 - 2026-07-07

### Fixed

- Added Edge/Microsoft translation fallback for selected sentences.
- Normalized selected whitespace before translation requests.
- Reduced "未找到翻译" cases when Google or MyMemory return 429 rate-limit errors.

## v1.0.0 - 2026-06-14

Initial public release of Sakura.

### Added

- Gemini / Google AI Studio visualization iframe fullscreen button.
- English-to-Chinese selection translation popup.
- Dictionary-first lookup for single words.
- Phrase and sentence translation fallback.
- Support for Gemini, AI Studio, DeepSeek, Qianwen / Tongyi, and Doubao pages.
- Detailed README with installation, privacy, permissions, troubleshooting, and technical notes.

### Improved

- Escaped external translation results before rendering.
- Prevented stale translation responses from overwriting newer selections.
- Added defensive selection handling to avoid empty-range errors.
- Throttled iframe scanning during frequent DOM updates.
- Hardened background translation input and dictionary response parsing.
