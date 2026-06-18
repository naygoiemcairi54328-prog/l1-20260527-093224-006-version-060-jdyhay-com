(function () {
  function startPlayer(box) {
    if (!box || box.classList.contains('is-playing')) {
      return;
    }
    var video = box.querySelector('video');
    var url = box.getAttribute('data-play');
    if (!video || !url) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      box._hls = hls;
    } else {
      video.src = url;
    }
    box.classList.add('is-playing');
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (box) {
    var button = box.querySelector('.play-button');
    var poster = box.querySelector('.player-poster');
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayer(box);
      });
    }
    if (poster) {
      poster.addEventListener('click', function () {
        startPlayer(box);
      });
    }
  });
})();
