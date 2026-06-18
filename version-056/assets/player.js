(function () {
  var shell = document.querySelector('.player-shell');

  if (!shell) {
    return;
  }

  var video = shell.querySelector('video');
  var button = shell.querySelector('.player-overlay');
  var status = shell.querySelector('.player-status');
  var streamUrl = shell.getAttribute('data-stream-url');
  var hlsInstance = null;

  function showStatus(text) {
    if (!status) {
      return;
    }
    status.textContent = text;
    status.hidden = !text;
  }

  function attachStream() {
    if (!video || !streamUrl) {
      showStatus('播放暂不可用');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            showStatus('播放暂不可用');
          }
        }
      });
    } else {
      video.src = streamUrl;
    }
  }

  function play() {
    if (!video) {
      return;
    }
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        showStatus('请再次点击播放');
      });
    }
  }

  function pause() {
    if (video) {
      video.pause();
    }
  }

  attachStream();

  if (button) {
    button.addEventListener('click', function () {
      play();
    });
  }

  if (video) {
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
      showStatus('');
    });
    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
    });
    video.addEventListener('ended', function () {
      shell.classList.remove('is-playing');
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        pause();
      }
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
