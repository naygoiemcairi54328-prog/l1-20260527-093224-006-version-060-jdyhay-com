(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-nav');
    if (!button || !menu) return;
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function setupHero() {
    var slides = selectAll('.hero-slide');
    var dots = selectAll('.hero-dot');
    if (!slides.length) return;
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function setupFilters() {
    var panel = document.querySelector('.filter-panel');
    var cards = selectAll('.movie-card');
    if (!panel || !cards.length) return;
    var search = panel.querySelector('.movie-search');
    var year = panel.querySelector('.year-filter');
    var type = panel.querySelector('.type-filter');
    var years = [];
    var types = [];
    cards.forEach(function (card) {
      var y = card.getAttribute('data-year') || '';
      var t = card.getAttribute('data-genre') || '';
      if (y && years.indexOf(y) === -1) years.push(y);
      t.split(/[、,，/／\s]+/).forEach(function (part) {
        if (part && types.indexOf(part) === -1) types.push(part);
      });
    });
    years.sort(function (a, b) { return Number(b) - Number(a); });
    types.sort();
    years.forEach(function (item) {
      var option = document.createElement('option');
      option.value = item;
      option.textContent = item + '年';
      year.appendChild(option);
    });
    types.slice(0, 80).forEach(function (item) {
      var option = document.createElement('option');
      option.value = item;
      option.textContent = item;
      type.appendChild(option);
    });
    function apply() {
      var q = (search.value || '').trim().toLowerCase();
      var selectedYear = year.value;
      var selectedType = type.value;
      cards.forEach(function (card) {
        var hay = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var ok = true;
        if (q && hay.indexOf(q) === -1) ok = false;
        if (selectedYear && card.getAttribute('data-year') !== selectedYear) ok = false;
        if (selectedType && (card.getAttribute('data-genre') || '').indexOf(selectedType) === -1 && (card.getAttribute('data-tags') || '').indexOf(selectedType) === -1) ok = false;
        card.classList.toggle('hidden-card', !ok);
      });
    }
    [search, year, type].forEach(function (el) {
      if (el) el.addEventListener('input', apply);
      if (el) el.addEventListener('change', apply);
    });
  }

  window.initPlayer = function (streamUrl) {
    var video = document.getElementById('movie-player');
    var cover = document.getElementById('play-cover');
    var started = false;
    if (!video || !streamUrl) return;
    function load() {
      if (started) return;
      started = true;
      if (cover) cover.classList.add('hidden');
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
      } else {
        video.src = streamUrl;
        video.play().catch(function () {});
      }
    }
    if (cover) cover.addEventListener('click', load);
    video.addEventListener('click', function () {
      if (!started || video.paused) load();
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
