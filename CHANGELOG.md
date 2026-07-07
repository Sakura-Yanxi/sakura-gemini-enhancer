# Changelog

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
