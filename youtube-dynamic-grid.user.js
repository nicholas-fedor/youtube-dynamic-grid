// ==UserScript==
// @name         YouTube Dynamic Video Grid
// @namespace    https://github.com/nicholas-fedor/youtube-dynamic-grid
// @version      1.0.0
// @description  Dynamically adjusts the YouTube video grid to display an optimal number of videos per row based on window width, overriding the default 3-video grid for a more responsive layout.
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
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  function updateGrid() {
    const grid = document.querySelector('ytd-rich-grid-renderer');
    if (grid) {
      const width = window.innerWidth; // Approximate grid width
      const videoWidth = 340; // Calculated for 6 videos at ~2,150px
      const margin = 32; // Page margins
      const gap = 16; // Gap between videos
      let itemsPerRow = Math.floor((width - margin) / (videoWidth + gap));
      itemsPerRow = Math.max(3, Math.min(12, itemsPerRow)); // Cap between 3 and 12
      grid.style.setProperty(
        '--ytd-rich-grid-items-per-row',
        itemsPerRow,
        'important'
      );
      grid.style.setProperty(
        '--ytd-rich-grid-posts-per-row',
        itemsPerRow,
        'important'
      );
    }
  }

  // Initial update with retry mechanism
  function tryUpdateGrid(attempts = 5, interval = 500) {
    updateGrid();
    if (attempts > 0 && !document.querySelector('ytd-rich-grid-renderer')) {
      setTimeout(() => tryUpdateGrid(attempts - 1, interval), interval);
    }
  }
  tryUpdateGrid();

  // Update on window resize
  window.addEventListener('resize', updateGrid);

  // Update on page load
  window.addEventListener('load', updateGrid);

  // Observe DOM changes for grid updates
  const observer = new MutationObserver(updateGrid);
  function startObserver() {
    const target = document.querySelector('#primary') || document.body;
    if (target) {
      observer.observe(target, {
        childList: true,
        subtree: true,
      });
    } else {
      setTimeout(startObserver, 500); // Retry if target not found
    }
  }
  startObserver();

  // Fallback polling for initial grid load
  const pollingInterval = setInterval(() => {
    if (document.querySelector('ytd-rich-grid-renderer')) {
      updateGrid();
      clearInterval(pollingInterval); // Stop polling once grid is found
    }
  }, 250); // Check every 250ms

  // Stop polling after 10 seconds to reduce overhead
  setTimeout(() => clearInterval(pollingInterval), 10000);
})();
