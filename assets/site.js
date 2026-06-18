(function() {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function() {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  if (slides.length > 1) {
    var current = 0;
    setInterval(function() {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
  var activeFilter = 'all';

  function applyFilter() {
    var term = searchInputs.map(function(input) {
      return input.value.trim().toLowerCase();
    }).filter(Boolean).join(' ');

    cards.forEach(function(card) {
      var searchText = (card.getAttribute('data-search') || '').toLowerCase();
      var filterText = card.getAttribute('data-filter') || '';
      var okTerm = !term || searchText.indexOf(term) !== -1;
      var okFilter = activeFilter === 'all' || filterText === activeFilter;
      card.classList.toggle('is-hidden', !(okTerm && okFilter));
    });
  }

  searchInputs.forEach(function(input) {
    input.addEventListener('input', applyFilter);
  });

  chips.forEach(function(chip) {
    chip.addEventListener('click', function() {
      chips.forEach(function(item) {
        item.classList.remove('active');
      });
      chip.classList.add('active');
      activeFilter = chip.getAttribute('data-filter') || 'all';
      applyFilter();
    });
  });
})();
