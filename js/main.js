/* Lau Lau homepage behavior: announcement bar, mobile nav, marquee fill, open/closed status */

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