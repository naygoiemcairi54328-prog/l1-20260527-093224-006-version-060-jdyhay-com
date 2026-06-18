(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function setHero(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            setHero(current + 1);
        }, 5200);
    }

    function resetHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        startHero();
    }

    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (prev) {
        prev.addEventListener('click', function () {
            setHero(current - 1);
            resetHero();
        });
    }
    if (next) {
        next.addEventListener('click', function () {
            setHero(current + 1);
            resetHero();
        });
    }
    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            setHero(index);
            resetHero();
        });
    });
    startHero();

    var cardSearch = document.querySelector('[data-card-search]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card'));
    var activeFilter = '';

    function filterCards() {
        var term = cardSearch ? cardSearch.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region')
            ].join(' ').toLowerCase();
            var keywordMatch = !term || text.indexOf(term) !== -1;
            var filterMatch = !activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
            card.style.display = keywordMatch && filterMatch ? '' : 'none';
        });
    }

    if (cardSearch) {
        cardSearch.addEventListener('input', filterCards);
    }
    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter-value') || '';
            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            filterCards();
        });
    });

    var searchInput = document.querySelector('[data-global-search]');
    var searchButton = document.querySelector('[data-global-search-button]');
    var searchResults = document.querySelector('[data-search-results]');

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function renderResults(items) {
        if (!searchResults) {
            return;
        }
        if (!items.length) {
            searchResults.innerHTML = '<p class="empty-result">没有找到匹配内容</p>';
            return;
        }
        searchResults.innerHTML = items.slice(0, 96).map(function (item) {
            return '<a class="search-result-card" href="./' + escapeHtml(item.page) + '">' +
                '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
                '<span><h2>' + escapeHtml(item.title) + '</h2>' +
                '<p>' + escapeHtml(item.line) + '</p>' +
                '<span>' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.genre) + '</span></span>' +
                '</a>';
        }).join('');
    }

    function runGlobalSearch() {
        if (!searchInput || !searchResults || !window.SEARCH_MOVIES) {
            return;
        }
        var term = searchInput.value.trim().toLowerCase();
        var items = window.SEARCH_MOVIES;
        if (term) {
            items = items.filter(function (item) {
                return [item.title, item.genre, item.year, item.region, item.tags].join(' ').toLowerCase().indexOf(term) !== -1;
            });
        }
        renderResults(items);
    }

    if (searchInput && searchResults) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        if (q) {
            searchInput.value = q;
        }
        runGlobalSearch();
        searchInput.addEventListener('input', runGlobalSearch);
    }
    if (searchButton) {
        searchButton.addEventListener('click', runGlobalSearch);
    }
})();
