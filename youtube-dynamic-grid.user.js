// ==UserScript==
// @name         YouTube Dynamic Video Grid
// @namespace    https://github.com/nicholas-fedor/youtube-dynamic-grid
// @version      1.0.1
// @description  Dynamically adjusts the YouTube video grid to display an optimal number of videos per row based on window width, overriding the default 3-video grid for a more responsive layout
// @author       Nick Fedor
// @match        *://www.youtube.com/*
// @match        *://youtube.com/*
// @icon         https://www.youtube.com/favicon.ico
// @homepageURL  https://github.com/nicholas-fedor/youtube-dynamic-grid
// @supportURL   https://github.com/nicholas-fedor/youtube-dynamic-grid/issues
// @updateURL    https://github.com/nicholas-fedor/youtube-dynamic-grid/raw/main/youtube-dynamic-grid.user.js
// @downloadURL  https://github.com/nicholas-fedor/youtube-dynamic-grid/raw/main/youtube-dynamic-grid.user.js
// @license      MIT
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  /**
   * Logs messages to the console for debugging when enabled via ?debug=1 query parameter
   * @param {string} message - Message to log
   * @param {boolean} [force=false] - Forces logging regardless of debug mode
   */
  function log(message, force = false) {
    if (force || window.location.search.includes('debug=1')) {
      console.log(`[YouTube Dynamic Grid] ${message}`);
    }
  }

  /**
   * Calculates the number of items per row based on the container width
   * @returns {number} Number of items per row, capped between 3 and 12
   */
  function calculateItemsPerRow() {
    // Select the grid container or fallback to document.body
    const container =
      document.querySelector('#contents') ||
      document.querySelector('ytd-two-column-browse-results-renderer') ||
      document.body;
    const width = container.getBoundingClientRect().width || window.innerWidth;
    const videoWidth = 340; // Estimated thumbnail width in pixels
    const margin = 40; // Total left and right margins in pixels
    const gap = 10; // Gap between thumbnails in pixels
    const firstColumnExtraMargin = 0; // Normalized by CSS, no extra margin
    // Round to nearest integer to balance item count and space usage
    let itemsPerRow = Math.round(
      (width - margin - firstColumnExtraMargin) / (videoWidth + gap)
    );
    // Cap items between 3 and 12 for layout consistency
    return Math.max(3, Math.min(12, itemsPerRow));
  }

  /**
   * Updates the grid's elements-per-row attribute and CSS styles with debouncing
   */
  let updateTimeout = null;
  function updateGrid() {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      try {
        const grid = document.querySelector(
          'ytd-rich-grid-renderer:not([hidden])'
        );
        if (grid) {
          const width =
            document.querySelector('#contents')?.getBoundingClientRect()
              .width || window.innerWidth;
          const itemsPerRow = calculateItemsPerRow();
          const currentItems = getComputedStyle(grid)
            .getPropertyValue('--ytd-rich-grid-items-per-row')
            .trim();
          const currentAttr =
            grid.getAttribute('elements-per-row') || 'unknown';
          // Update only if item count or attribute differs
          if (
            currentItems !== String(itemsPerRow) ||
            currentAttr !== String(itemsPerRow)
          ) {
            // Set Polymer attribute to align with CSS
            grid.setAttribute('elements-per-row', itemsPerRow);
            updateCSS(itemsPerRow);
            log(
              `Updated items per row to ${itemsPerRow} (was ${currentItems}, attr ${currentAttr}) for width ${width}px`,
              true
            );
          }
        } else {
          log('No visible grid found');
        }
      } catch (error) {
        log(`Error updating grid: ${error.message}`);
      }
    }, 50); // Debounce updates by 50ms to prevent rapid calls
  }

  /**
   * Injects a dynamic CSS style element to override grid layout
   */
  function injectCSS() {
    let style = document.getElementById('dynamic-grid-style');
    if (!style) {
      style = document.createElement('style');
      style.id = 'dynamic-grid-style';
      // Apply CSP nonce if available to comply with YouTube's security policy
      const nonce = document.querySelector('meta[name="csp-nonce"]')?.content;
      if (nonce) style.nonce = nonce;
      document.head.appendChild(style);
      log('Injected dynamic CSS rule with nonce', true);
      const itemsPerRow = calculateItemsPerRow();
      style.textContent = `
        #contents, ytd-two-column-browse-results-renderer {
          max-width: 100% !important;
          width: 100% !important;
          padding: 0 !important;
        }
        ytd-rich-grid-renderer {
          --ytd-rich-grid-items-per-row: ${itemsPerRow} !important;
          --ytd-rich-grid-posts-per-row: ${itemsPerRow} !important;
          max-width: 100% !important;
          padding: 0 !important;
          gap: 10px !important; /* Consistent horizontal and vertical spacing */
        }
        ytd-rich-grid-renderer [is-in-first-column] {
          margin-left: 8px !important;
          margin-right: 8px !important;
          margin-bottom: 16px !important; /* Vertical spacing for first-column items */
        }
        ytd-rich-item-renderer {
          margin: 0 8px 16px 8px !important; /* Uniform margins with vertical spacing */
        }
      `;
    }
  }

  /**
   * Updates the dynamic CSS rule with the specified number of items per row
   * @param {number} itemsPerRow - Number of items per row
   */
  function updateCSS(itemsPerRow) {
    const style = document.getElementById('dynamic-grid-style');
    style.textContent = `
      #contents, ytd-two-column-browse-results-renderer {
        max-width: 100% !important;
        width: 100% !important;
        padding: 0 !important;
      }
      ytd-rich-grid-renderer:not([hidden]) {
        --ytd-rich-grid-items-per-row: ${itemsPerRow} !important;
        --ytd-rich-grid-posts-per-row: ${itemsPerRow} !important;
        max-width: 100% !important;
        padding: 0 !important;
        gap: 10px !important;
      }
      ytd-rich-grid-renderer:not([hidden]) [is-in-first-column] {
        margin-left: 8px !important;
        margin-right: 8px !important;
        margin-bottom: 16px !important;
      }
      ytd-rich-grid-renderer:not([hidden]) ytd-rich-item-renderer {
        margin: 0 8px 16px 8px !important;
      }
    `;
  }

  /**
   * Attempts to update the grid with retries until the grid is visible
   * @param {number} [attempts=20] - Number of retry attempts
   * @param {number} [interval=100] - Retry interval in milliseconds
   */
  function tryUpdateGrid(attempts = 20, interval = 100) {
    updateGrid();
    if (
      attempts > 0 &&
      !document.querySelector('ytd-rich-grid-renderer:not([hidden])')
    ) {
      log(`Retrying grid update (${attempts} attempts left)`);
      setTimeout(() => tryUpdateGrid(attempts - 1, interval), interval);
    }
  }

  /**
   * Initializes or reinitializes the MutationObserver to monitor grid changes
   */
  let observer = null;
  function startObserver() {
    if (observer) {
      observer.disconnect();
      log('Disconnected previous observer');
    }
    observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (
          mutation.target.matches('ytd-rich-grid-renderer') ||
          mutation.target.closest('ytd-rich-grid-renderer') ||
          mutation.target.querySelector('ytd-rich-grid-renderer') ||
          mutation.attributeName === 'style' ||
          mutation.attributeName === 'hidden' ||
          mutation.attributeName === 'class' ||
          mutation.attributeName === 'elements-per-row' ||
          mutation.addedNodes.length > 0
        ) {
          updateGrid();
          break; // Exit after first relevant mutation to avoid redundant updates
        }
      }
    });
    const target =
      document.querySelector('#contents') ||
      document.querySelector('ytd-two-column-browse-results-renderer') ||
      document.querySelector('ytd-app');
    if (target) {
      observer.observe(target, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'hidden', 'elements-per-row'],
      });
      log('Started observer on target');
    } else {
      log('Target not found, retrying observer');
      setTimeout(startObserver, 100); // Retry after 100ms if target is missing
    }
  }

  /**
   * Handles navigation events by reinitializing the grid update and observer
   */
  let navigationTimeouts = [];
  function handleNavigation() {
    navigationTimeouts.forEach(clearTimeout);
    navigationTimeouts = [];
    tryUpdateGrid();
    startObserver();
    // Schedule delayed updates to catch late renders
    navigationTimeouts.push(setTimeout(updateGrid, 1000));
    navigationTimeouts.push(setTimeout(updateGrid, 5000));
    navigationTimeouts.push(setTimeout(updateGrid, 10000));
  }

  /**
   * Monitors SPA navigation via URL changes
   */
  let lastUrl = location.href;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      log(`Detected navigation to ${currentUrl}`);
      handleNavigation();
    }
  }).observe(document, { subtree: true, childList: true });

  // Event handlers for cleanup
  let resizeTimeout = null;
  const resizeHandler = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      log('Window resized');
      updateGrid();
    }, 100); // Throttle resize events by 100ms
  };
  const loadHandler = () => {
    log('Page loaded');
    handleNavigation();
  };
  const popstateHandler = () => {
    log('Detected popstate navigation');
    handleNavigation();
  };

  /**
   * Polls for grid changes with aggressive early polling to counter style overrides
   */
  let pollingInterval = null;
  let stableCount = 0;
  function startPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    pollingInterval = setInterval(() => {
      const grid = document.querySelector(
        'ytd-rich-grid-renderer:not([hidden])'
      );
      if (grid) {
        const currentItems = getComputedStyle(grid)
          .getPropertyValue('--ytd-rich-grid-items-per-row')
          .trim();
        const currentAttr = grid.getAttribute('elements-per-row') || 'unknown';
        const itemsPerRow = calculateItemsPerRow();
        if (
          currentItems !== String(itemsPerRow) ||
          currentAttr !== String(itemsPerRow)
        ) {
          updateGrid();
          stableCount = 0;
        } else {
          stableCount++;
          if (stableCount >= 5) {
            clearInterval(pollingInterval);
            log('Stopped early polling: grid stable');
            startRegularPolling();
          }
        }
      }
    }, 200); // Poll every 200ms for first 5 seconds
    setTimeout(() => {
      clearInterval(pollingInterval);
      log('Stopped early polling');
      startRegularPolling();
    }, 5000);
  }

  /**
   * Continues polling at a slower rate for additional stability
   */
  function startRegularPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    stableCount = 0;
    pollingInterval = setInterval(() => {
      const grid = document.querySelector(
        'ytd-rich-grid-renderer:not([hidden])'
      );
      if (grid) {
        const currentItems = getComputedStyle(grid)
          .getPropertyValue('--ytd-rich-grid-items-per-row')
          .trim();
        const currentAttr = grid.getAttribute('elements-per-row') || 'unknown';
        const itemsPerRow = calculateItemsPerRow();
        if (
          currentItems !== String(itemsPerRow) ||
          currentAttr !== String(itemsPerRow)
        ) {
          updateGrid();
          stableCount = 0;
        } else {
          stableCount++;
          if (stableCount >= 5) {
            clearInterval(pollingInterval);
            log('Stopped regular polling: grid stable');
            updateGrid();
          }
        }
      }
    }, 1000); // Poll every 1000ms for 25 seconds
    setTimeout(() => {
      clearInterval(pollingInterval);
      log('Stopped regular polling');
      updateGrid();
    }, 25000);
  }

  /**
   * Cleans up event listeners and intervals on page unload
   */
  function cleanup() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    navigationTimeouts.forEach(clearTimeout);
    clearTimeout(resizeTimeout);
    clearTimeout(updateTimeout);
    window.removeEventListener('resize', resizeHandler);
    window.removeEventListener('load', loadHandler);
    window.removeEventListener('popstate', popstateHandler);
    log('Cleaned up listeners');
  }

  // Initialize the script
  injectCSS();
  tryUpdateGrid();
  startObserver();
  startPolling();
  window.addEventListener('resize', resizeHandler);
  window.addEventListener('load', loadHandler);
  window.addEventListener('popstate', popstateHandler);
  window.addEventListener('unload', cleanup);
})();
