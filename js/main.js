/* Lau Lau homepage behavior: announcement bar, hero video, mobile nav, marquee fill, open/closed status */

// Mobile nav toggle
(function () {
  var btn = document.querySelector('.nav-toggle');
  var list = document.getElementById('nav-list');
  btn.addEventListener('click', function () {
    var open = list.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    btn.textContent = open ? 'close' : 'menu';
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && list.classList.contains('open')) {
      list.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = 'menu';
      btn.focus();
    }
  });
})();

// Fill the marquee so it loops seamlessly
(function () {
  var track = document.getElementById('marquee');
  var item = track.firstElementChild;
  for (var i = 0; i < 11; i++) track.appendChild(item.cloneNode(true));
})();

// Open/closed status in Austin time
(function () {
  var OPEN = 8 * 60, CLOSE = 16 * 60, CLOSED_DAY = 2; // Tuesday
  var parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
  }).formatToParts(new Date());
  var get = function (t) { return (parts.find(function (p) { return p.type === t; }) || {}).value; };
  var dayIndex = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(get('weekday'));
  var mins = (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10);

  var row = document.querySelector('#hours tr[data-day="' + dayIndex + '"]');
  if (row) row.classList.add('today');

  var status = document.getElementById('status');
  var text = document.getElementById('status-text');
  var isOpen = dayIndex !== CLOSED_DAY && mins >= OPEN && mins < CLOSE;
  status.dataset.open = String(isOpen);

  if (isOpen) {
    text.textContent = 'open now, until 4pm';
  } else if (dayIndex === CLOSED_DAY) {
    text.textContent = 'closed today, back wednesday at 8am';
  } else if (mins < OPEN) {
    text.textContent = 'opens today at 8am';
  } else {
    var tomorrow = (dayIndex + 1) % 7;
    text.textContent = tomorrow === CLOSED_DAY
      ? 'closed now, back wednesday at 8am'
      : 'closed now, opens tomorrow at 8am';
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();

// Announcement bar: dismissible, remembers the choice
(function () {
  var bar = document.getElementById('announce');
  if (!bar) return;
  try {
    if (localStorage.getItem('ll-announce') === 'closed') { bar.hidden = true; return; }
  } catch (e) {}
  bar.querySelector('button').addEventListener('click', function () {
    bar.hidden = true;
    try { localStorage.setItem('ll-announce', 'closed'); } catch (e) {}
  });
})();

// Hero video: respects reduced-motion and data-saver, and gives a pause control
(function () {
  var video = document.getElementById('hero-video');
  var btn = document.getElementById('video-toggle');
  if (!video || !btn) return;

  // Make a wrong file path obvious in the browser console (DevTools > Console)
  Array.prototype.forEach.call(video.querySelectorAll('source'), function (s) {
    s.addEventListener('error', function () {
      console.warn('Hero video could not load: ' + s.getAttribute('src') +
        ' (check that the file exists at this path, relative to index.html)');
    });
  });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var conn = navigator.connection || {};

  function label() { btn.textContent = video.paused ? 'play video' : 'pause video'; }
  function reveal() { btn.hidden = false; label(); }

  if (conn.saveData) {
    video.removeAttribute('autoplay');
    video.preload = 'none';
    video.pause();
  } else if (reduce.matches) {
    video.pause();
  }

  // Only show the control once a video has actually loaded
  if (video.readyState >= 2) reveal();
  video.addEventListener('loadeddata', reveal);
  video.addEventListener('play', label);
  video.addEventListener('pause', label);

  btn.addEventListener('click', function () {
    if (video.paused) {
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    } else {
      video.pause();
    }
  });

  var onChange = function (e) { if (e.matches) video.pause(); };
  if (reduce.addEventListener) reduce.addEventListener('change', onChange);
})();