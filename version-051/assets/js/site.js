(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-site-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-movie-list]'));
    if (!lists.length) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var searchInput = document.querySelector('[data-movie-search]');
    var empty = document.querySelector('[data-filter-empty]');
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function fillSelect(select, attr) {
      var values = [];
      cards.forEach(function (card) {
        var value = card.getAttribute('data-' + attr);
        if (value && values.indexOf(value) === -1) {
          values.push(value);
        }
      });
      values.sort(function (a, b) {
        if (attr === 'year') {
          return Number(b) - Number(a);
        }
        return a.localeCompare(b, 'zh-CN');
      });
      values.forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    }

    selects.forEach(function (select) {
      fillSelect(select, select.getAttribute('data-filter'));
    });

    function applyQueryFromUrl() {
      if (!searchInput) {
        return;
      }
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        searchInput.value = query;
      }
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var selected = {};
      selects.forEach(function (select) {
        selected[select.getAttribute('data-filter')] = select.value;
      });

      var visibleCount = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matched = !query || haystack.indexOf(query) !== -1;

        Object.keys(selected).forEach(function (key) {
          if (selected[key] && card.getAttribute('data-' + key) !== selected[key]) {
            matched = false;
          }
        });

        card.classList.toggle('hidden-by-filter', !matched);
        if (matched) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    }

    applyQueryFromUrl();
    applyFilters();

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }
    selects.forEach(function (select) {
      select.addEventListener('change', applyFilters);
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-player-start]');
      var src = player.getAttribute('data-video-src');
      var initialized = false;

      function play() {
        if (!src || !video) {
          return;
        }
        if (!initialized) {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
          } else {
            video.src = src;
          }
          initialized = true;
        }
        if (button) {
          button.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            if (button) {
              button.classList.remove('is-hidden');
            }
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
