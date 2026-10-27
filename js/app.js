/* Blue Crescent — lessons > subjects > chapters > subchapters, plus optional sub-subjects */
(function () {
  'use strict';
  if (window.__bcApp) return;
  window.__bcApp = true;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;' }[c];
    });
  };
  // ... rest of the file would go here, but for this call we use the full from local
