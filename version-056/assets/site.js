(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function activate(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function next() {
      activate((current + 1) % slides.length);
    }

    function start() {
      if (slides.length > 1) {
        timer = window.setInterval(next, 5200);
      }
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        stop();
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function createResultItem(item) {
    var anchor = document.createElement('a');
    anchor.className = 'suggest-item';
    anchor.href = item.url;
    anchor.innerHTML = '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
      '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.category) + '</span></span>';
    return anchor;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function findMatches(query, limit) {
    var q = normalize(query);
    if (!q || !Array.isArray(window.SiteSearchIndex)) {
      return [];
    }
    var words = q.split(/\s+/).filter(Boolean);
    var matches = [];
    window.SiteSearchIndex.forEach(function (item) {
      var haystack = normalize([item.title, item.year, item.category, item.genre, item.tags, item.oneLine].join(' '));
      var ok = words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
      if (ok) {
        matches.push(item);
      }
    });
    return matches.slice(0, limit || 10);
  }

  function bindGlobalSearch() {
    var input = document.querySelector('[data-global-search-input]');
    var box = document.querySelector('[data-search-suggest]');

    if (!input || !box) {
      return;
    }

    function render() {
      var results = findMatches(input.value, 6);
      box.innerHTML = '';
      if (!input.value.trim() || !results.length) {
        box.classList.remove('open');
        return;
      }
      results.forEach(function (item) {
        box.appendChild(createResultItem(item));
      });
      box.classList.add('open');
    }

    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    document.addEventListener('click', function (event) {
      if (!box.contains(event.target) && event.target !== input) {
        box.classList.remove('open');
      }
    });
  }

  function bindCategoryFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var year = scope.querySelector('[data-year-filter]');
      var genre = scope.querySelector('[data-genre-filter]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-card]'));

      function apply() {
        var q = normalize(input && input.value);
        var yearValue = normalize(year && year.value);
        var genreValue = normalize(genre && genre.value);
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year')
          ].join(' '));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardGenre = normalize(card.getAttribute('data-genre'));
          var visible = true;
          if (q && text.indexOf(q) === -1) {
            visible = false;
          }
          if (yearValue && cardYear !== yearValue) {
            visible = false;
          }
          if (genreValue && cardGenre.indexOf(genreValue) === -1) {
            visible = false;
          }
          card.hidden = !visible;
        });
      }

      [input, year, genre].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function bindSearchPage() {
    var resultsBox = document.querySelector('[data-search-page-results]');
    var input = document.querySelector('[data-search-page-input]');

    if (!resultsBox) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input) {
      input.value = query;
    }

    var results = query ? findMatches(query, 80) : (Array.isArray(window.SiteSearchIndex) ? window.SiteSearchIndex.slice(0, 24) : []);
    resultsBox.innerHTML = '';

    if (!results.length) {
      var empty = document.createElement('div');
      empty.className = 'search-empty';
      empty.textContent = '没有找到匹配内容，可以尝试更换片名、题材、地区或年份。';
      resultsBox.appendChild(empty);
      return;
    }

    results.forEach(function (item) {
      var article = document.createElement('article');
      article.className = 'movie-card';
      article.innerHTML = '<a class="poster-link" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="poster-shade"></span><span class="play-badge">▶</span><span class="year-badge">' + escapeHtml(item.year) + '</span></a>' +
        '<div class="card-body"><a class="card-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>' +
        '<p>' + escapeHtml(item.oneLine) + '</p><div class="tag-row"><span>' + escapeHtml(item.category) + '</span><span>' + escapeHtml(item.genre) + '</span></div></div>';
      resultsBox.appendChild(article);
    });
  }

  bindGlobalSearch();
  bindCategoryFilters();
  bindSearchPage();
})();
