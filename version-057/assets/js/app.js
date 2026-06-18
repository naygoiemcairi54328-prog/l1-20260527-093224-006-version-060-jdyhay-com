(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      const open = mobileMenu.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", open ? "true" : "false");
      menuButton.textContent = open ? "×" : "☰";
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll(".hero-dot"));
    const prev = hero.querySelector(".hero-prev");
    const next = hero.querySelector(".hero-next");
    let index = 0;
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 6200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restart();
      });
    }

    restart();
  }

  const controls = Array.from(document.querySelectorAll("[data-filter-scope]"));

  controls.forEach(function (control) {
    const scopeId = control.getAttribute("data-filter-scope");
    const scope = document.getElementById(scopeId);
    const searchInput = control.querySelector("[data-search-input]");
    const yearSelect = control.querySelector("[data-filter-year]");
    const regionSelect = control.querySelector("[data-filter-region]");

    if (!scope) {
      return;
    }

    const items = Array.from(scope.querySelectorAll(".movie-card, .rank-row"));
    const empty = scope.querySelector(".empty-state") || scope.parentElement.querySelector(".empty-state");

    function applyFilters() {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      const year = yearSelect ? yearSelect.value : "";
      const region = regionSelect ? regionSelect.value : "";
      let visible = 0;

      items.forEach(function (item) {
        const text = [
          item.getAttribute("data-title"),
          item.getAttribute("data-year"),
          item.getAttribute("data-region"),
          item.getAttribute("data-keywords")
        ].join(" ").toLowerCase();
        const yearOk = !year || item.getAttribute("data-year") === year;
        const regionOk = !region || item.getAttribute("data-region") === region;
        const queryOk = !query || text.indexOf(query) !== -1;
        const show = yearOk && regionOk && queryOk;

        item.classList.toggle("is-hidden", !show);

        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [searchInput, yearSelect, regionSelect].forEach(function (input) {
      if (input) {
        input.addEventListener("input", applyFilters);
        input.addEventListener("change", applyFilters);
      }
    });
  });

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    const existing = document.querySelector("script[data-hls-loader]");

    if (existing) {
      existing.addEventListener("load", callback, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
    script.async = true;
    script.setAttribute("data-hls-loader", "true");
    script.addEventListener("load", callback, { once: true });
    document.head.appendChild(script);
  }

  function attachStream(video, streamUrl, onReady) {
    if (!video || !streamUrl) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      onReady();
      return;
    }

    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        video._hlsInstance = hls;
        onReady();
      } else {
        video.src = streamUrl;
        onReady();
      }
    });
  }

  const playerShells = Array.from(document.querySelectorAll("[data-player-shell]"));

  playerShells.forEach(function (shell) {
    const video = shell.querySelector("video");
    const button = shell.querySelector(".player-start");
    let initialized = false;

    function startPlayback() {
      if (!video) {
        return;
      }

      const streamUrl = video.getAttribute("data-stream");

      function play() {
        const attempt = video.play();

        if (attempt && typeof attempt.then === "function") {
          attempt.then(function () {
            shell.classList.add("is-playing");
          }).catch(function () {
            shell.classList.remove("is-playing");
          });
        } else {
          shell.classList.add("is-playing");
        }
      }

      if (!initialized) {
        initialized = true;
        attachStream(video, streamUrl, play);
      } else {
        play();
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayback();
      });
    }

    shell.addEventListener("click", function (event) {
      if (event.target === video && !video.paused) {
        return;
      }

      if (event.target.closest(".player-start") || event.target.closest("video") || event.target === shell) {
        startPlayback();
      }
    });

    if (video) {
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        shell.classList.remove("is-playing");
      });
    }
  });
})();
