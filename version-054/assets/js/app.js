(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function togglePanel(buttonSelector, panelSelector) {
    var button = $(buttonSelector);
    var panel = $(panelSelector);
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var root = $('[data-hero]');
    if (!root) {
      return;
    }
    var slides = $all('.hero-slide', root);
    var dots = $all('.hero-dot', root);
    var prev = $('[data-hero-prev]', root);
    var next = $('[data-hero-next]', root);
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    if (slides.length > 1) {
      start();
    }
  }

  function setupFilters() {
    var list = $('[data-filter-list]');
    if (!list) {
      return;
    }
    var input = $('.inline-filter-input');
    var searchInput = $('.search-page-input');
    var cards = $all('.movie-card', list);
    var chips = $all('.filter-chip');
    var currentChip = '';
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';

    if (searchInput) {
      searchInput.value = q;
    }

    if (input && !input.value && q) {
      input.value = q;
    }

    function collect(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type')
      ].join(' '));
    }

    function apply() {
      var query = normalize((input && input.value) || (searchInput && searchInput.value) || q);
      var chip = normalize(currentChip);
      cards.forEach(function (card) {
        var haystack = collect(card);
        var matchedQuery = !query || haystack.indexOf(query) !== -1;
        var matchedChip = !chip || haystack.indexOf(chip) !== -1;
        card.classList.toggle('is-hidden-by-filter', !(matchedQuery && matchedChip));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    if (searchInput) {
      searchInput.addEventListener('input', apply);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        currentChip = chip.getAttribute('data-filter') || '';
        apply();
      });
    });

    apply();
  }

  function syncHeaderSearch() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (!q) {
      return;
    }
    $all('.site-search-input').forEach(function (input) {
      input.value = q;
    });
  }

  function attachSource(video, source, onError) {
    if (video.getAttribute('data-ready') === '1') {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal && onError) {
          onError();
        }
      });
      video.hlsInstance = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      video.src = source;
    }
    video.setAttribute('data-ready', '1');
  }

  window.initMoviePlayer = function (source) {
    var video = $('#movie-player');
    var overlay = $('.player-overlay');
    var error = $('.player-error');

    if (!video || !overlay || !source) {
      return;
    }

    function showError() {
      if (error) {
        error.hidden = false;
      }
    }

    function start() {
      attachSource(video, source, showError);
      var playPromise = video.play();
      overlay.classList.add('is-hidden');
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(showError);
      }
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('error', showError);
  };

  document.addEventListener('DOMContentLoaded', function () {
    togglePanel('.search-toggle', '.site-search-panel');
    togglePanel('.nav-toggle', '.mobile-nav');
    setupHero();
    setupFilters();
    syncHeaderSearch();
  });
})();
