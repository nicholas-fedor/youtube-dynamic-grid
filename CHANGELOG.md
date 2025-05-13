# Changelog

All notable changes to the YouTube Dynamic Video Grid project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-05-13

### Added

- Handling for `elements-per-row` attribute to align with YouTube's Polymer bindings
- Normalized margins for first-column items (`[is-in-first-column]`) to 8px
- Vertical spacing with 16px bottom margin and 10px gap
- Content Security Policy (CSP) compliance using `<style>` element with nonce
- Single-page application (SPA) navigation support via URL monitoring and `popstate` events
- Production-ready comments for maintainability

### Changed

- Updated grid calculation parameters: `videoWidth=340px`, `margin=40px`, `gap=10px`
- Switched to `Math.round` for item calculation to balance item count and space usage
- Optimized polling: 200ms for 5 seconds (early), 1000ms for 25 seconds (regular), with early termination after 5 stable checks
- Increased initial retries to 20 at 100ms intervals for faster grid detection
- Added debouncing (50ms) for grid updates and throttling (100ms) for resize events
- Changed execution timing to `document-end` for earlier grid styling
- Improved observer to monitor `#contents`, `ytd-two-column-browse-results-renderer`, or `ytd-app` with specific attributes (`style`, `class`, `hidden`, `elements-per-row`)

### Fixed

- Grid reverting to 3 items on Subscriptions tab
- Flicker during initial grid load
- Uneven first-column margins causing layout inconsistencies

## [1.0.0] - 2024-04-25

### Added

- Initial release of YouTube Dynamic Video Grid
- Dynamic adjustment of `ytd-rich-grid-renderer` to set `--ytd-rich-grid-items-per-row` and `--ytd-rich-grid-posts-per-row` based on window width
- Support for 3 to 12 items per row, calculated using `videoWidth=340px`, `margin=32px`, `gap=16px`
- MutationObserver on `#primary` or `document.body` to detect grid changes
- Polling every 250ms for 10 seconds to ensure initial grid load
- Event listeners for window `resize` and `load` events
