(function () {
  var Site = {};

  Site.initNavigation = function () {
    var toggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  };

  Site.initHero = function () {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  };

  Site.initFilters = function () {
    var panel = document.querySelector('[data-filter-panel]');
    if (!panel) {
      return;
    }
    var input = panel.querySelector('.site-search-input');
    var region = panel.querySelector('.filter-region');
    var type = panel.querySelector('.filter-type');
    var year = panel.querySelector('.filter-year');
    var empty = panel.querySelector('.filter-empty');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';

    if (input && q) {
      input.value = q;
    }

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = card.getAttribute('data-search') || '';
        var matchQuery = !query || searchText.indexOf(query) !== -1;
        var matchRegion = !regionValue || card.getAttribute('data-region') === regionValue;
        var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
        var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var shouldShow = matchQuery && matchRegion && matchType && matchYear;
        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, region, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });

    apply();
  };

  Site.initPlayers = function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('.player-overlay');
      var message = player.querySelector('.player-message');
      var src = player.getAttribute('data-video-src');
      var ready = false;
      var hls = null;

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.hidden = false;
      }

      function prepare() {
        if (ready || !video || !src) {
          return;
        }
        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage('视频加载失败，请稍后重试。');
            }
          });
          return;
        }

        showMessage('当前浏览器暂不支持此视频播放。');
      }

      function play() {
        prepare();
        if (!video) {
          return;
        }
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            showMessage('点击播放器后即可继续播放。');
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', play);
      }

      if (video) {
        video.addEventListener('play', function () {
          player.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          player.classList.remove('is-playing');
        });
        video.addEventListener('ended', function () {
          player.classList.remove('is-playing');
        });
      }

      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    Site.initNavigation();
    Site.initHero();
    Site.initFilters();
    Site.initPlayers();
  });
})();
