(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dotsWrap = document.querySelector('.dots');
  var current = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    if (dotsWrap) {
      Array.prototype.slice.call(dotsWrap.querySelectorAll('button')).forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
  }
  if (slides.length && dotsWrap) {
    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.textContent = String(i + 1);
      dot.addEventListener('click', function () {
        showSlide(i);
      });
      dotsWrap.appendChild(dot);
    });
    var prev = document.querySelector('[data-hero="prev"]');
    var next = document.querySelector('[data-hero="next"]');
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var yearSelect = document.querySelector('[data-year-select]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-search]'));
  function filterCards() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    cards.forEach(function (card) {
      var haystack = (card.getAttribute('data-search') || '').toLowerCase();
      var cardYear = card.getAttribute('data-year') || '';
      var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchedYear = !year || cardYear === year;
      card.classList.toggle('hidden-card', !(matchedKeyword && matchedYear));
    });
  }
  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }
  if (yearSelect) {
    yearSelect.addEventListener('change', filterCards);
  }
})();
