let zTop = 100;

const starsEl = document.getElementById('stars');
for (let i = 0; i < 120; i++) {
  const s = document.createElement('div');
  s.className = 'star';
  const size = Math.random() * 2.5 + 0.5;
  s.style.cssText = `width:${size}px;height:${size}px;top:${Math.random()*100}%;left:${Math.random()*100}%;--d:${2+Math.random()*4}s;--op:${0.3+Math.random()*0.7};animation-delay:${Math.random()*4}s`;
  starsEl.appendChild(s);
}

function closeWin(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
  updateDock();
}

function minWin(id) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = 'none';
    el.dataset.minimized = 'true';
  }
  updateDock();
}

function openApp(name) {
  const map = {
    notepad: 'win-notepad',
    calc: 'win-calc',
    clock: 'win-clock',
    todo: 'win-todo',
    weather: 'win-weather',
    colors: 'win-colors'
  };
  const id = map[name];
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'block';
  delete el.dataset.minimized;
  el.style.zIndex = ++zTop;
  hideCtx();
  updateDock();
  if (name === 'clock') drawClock();
  if (name === 'colors') setupColor();
}

function updateDock() {
  const dock = document.getElementById('dock');
  dock.innerHTML = '';
  document.querySelectorAll('.win').forEach(w => {
    if (w.dataset.minimized === 'true') {
      const label = w.querySelector('.win-bar span') ? w.querySelector('.win-bar span').textContent : w.id;
      const item = document.createElement('div');
      item.className = 'dock-item';
      item.textContent = label;
      item.onclick = () => {
        w.style.display = 'block';
        delete w.dataset.minimized;
        w.style.zIndex = ++zTop;
        updateDock();
      };
      dock.appendChild(item);
    }
  });
}

document.querySelectorAll('.win').forEach(win => {
  const bar = win.querySelector('.win-bar');
  if (!bar) return;
  let dragging = false, ox = 0, oy = 0;

  bar.addEventListener('mousedown', function(e) {
    if (e.target.classList.contains('wbtn')) return;
    dragging = true;
    ox = e.clientX - win.offsetLeft;
    oy = e.clientY - win.offsetTop;
    win.style.zIndex = ++zTop;
    e.preventDefault();
  });

  document.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    let nx = e.clientX - ox;
    let ny = e.clientY - oy;
    nx = Math.max(0, Math.min(nx, window.innerWidth - win.offsetWidth));
    ny = Math.max(44, Math.min(ny, window.innerHeight - 40));
    win.style.left = nx + 'px';
    win.style.top = ny + 'px';
  });

  document.addEventListener('mouseup', function() {
    dragging = false;
  });

  win.addEventListener('mousedown', function() {
    win.style.zIndex = ++zTop;
  });
});

const startTime = Date.now();

function updateClock() {
  const now = new Date();
  const t = now.toLocaleTimeString();
  const d = now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  const tbClock = document.getElementById('tb-clock');
  if (tbClock) tbClock.textContent = t;

  const digTime = document.getElementById('dig-time');
  if (digTime) digTime.textContent = t;

  const digDate = document.getElementById('dig-date');
  if (digDate) digDate.textContent = d;

  const upEl = document.getElementById('uptime-display');
  if (upEl) {
    const sec = Math.floor((Date.now() - startTime) / 1000);
    upEl.textContent = 'up ' + sec + 's — all systems go';
  }

  const clockWin = document.getElementById('win-clock');
  if (clockWin && clockWin.style.display !== 'none') drawClock();
}
setInterval(updateClock, 1000);
updateClock();

function drawClock() {
  const canvas = document.getElementById('clock-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = 100, cy = 100, r = 90;
  const now = new Date();

  ctx.clearRect(0, 0, 200, 200);

  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const big = i % 3 === 0;
    ctx.strokeStyle = big ? '#00ff88' : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = big ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (r - (big ? 14 : 8)), cy + Math.sin(a) * (r - (big ? 14 : 8)));
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.stroke();
  }

  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();

  const hands = [
    { angle: (h / 12 + m / 720) * Math.PI * 2 - Math.PI / 2, len: 55, w: 3, color: '#ffffff' },
    { angle: (m / 60) * Math.PI * 2 - Math.PI / 2, len: 72, w: 2, color: '#dddddd' },
    { angle: (s / 60) * Math.PI * 2 - Math.PI / 2, len: 80, w: 1, color: '#00ff88' }
  ];

  hands.forEach(function(hand) {
    ctx.strokeStyle = hand.color;
    ctx.lineWidth = hand.w;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(hand.angle) * hand.len, cy + Math.sin(hand.angle) * hand.len);
    ctx.stroke();
  });

  ctx.fillStyle = '#00ff88';
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
}

let calcExpr = '';
function calcIn(v) {
  calcExpr += v;
  document.getElementById('calc-disp').textContent = calcExpr;
  document.getElementById('calc-expr').textContent = '';
}
function calcEq() {
  try {
    const res = eval(calcExpr);
    const rounded = parseFloat(res.toFixed(10));
    document.getElementById('calc-expr').textContent = calcExpr + ' =';
    document.getElementById('calc-disp').textContent = rounded;
    calcExpr = String(rounded);
  } catch(e) {
    document.getElementById('calc-disp').textContent = 'Error';
    calcExpr = '';
  }
}
function calcClear() {
  calcExpr = '';
  document.getElementById('calc-disp').textContent = '0';
  document.getElementById('calc-expr').textContent = '';
}

function addTodo() {
  const input = document.getElementById('todo-in');
  const text = input.value.trim();
  if (!text) return;
  const li = document.createElement('li');
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.onchange = function() {
    li.classList.toggle('done', cb.checked);
    updateStats();
  };
  const sp = document.createElement('span');
  sp.textContent = text;
  const del = document.createElement('button');
  del.className = 'del';
  del.textContent = 'x';
  del.onclick = function() {
    li.remove();
    updateStats();
  };
  li.appendChild(cb);
  li.appendChild(sp);
  li.appendChild(del);
  document.getElementById('todo-list').appendChild(li);
  input.value = '';
  updateStats();
}

const todoInput = document.getElementById('todo-in');
if (todoInput) {
  todoInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addTodo();
  });
}

function updateStats() {
  const all = document.querySelectorAll('#todo-list li').length;
  const done = document.querySelectorAll('#todo-list li.done').length;
  const el = document.getElementById('todo-stats');
  if (el) el.textContent = done + '/' + all + ' complete';
}

const weathers = [
  { icon: 'sunny', temp: '82F', desc: 'Sunny' },
  { icon: 'cloudy', temp: '72F', desc: 'Partly Cloudy' },
  { icon: 'rainy', temp: '61F', desc: 'Rainy' },
  { icon: 'stormy', temp: '65F', desc: 'Thunderstorm' },
];
const weatherIcons = { sunny: 'sun', cloudy: 'cloud', rainy: 'cloud-rain', stormy: 'bolt' };

function refreshWeather() {
  const w = weathers[Math.floor(Math.random() * weathers.length)];
  const icons = { sunny: '☀️', cloudy: '⛅', rainy: '🌧️', stormy: '⛈️' };
  const iconEl = document.getElementById('weather-icon');
  const tempEl = document.getElementById('weather-temp');
  const descEl = document.getElementById('weather-desc');
  if (iconEl) iconEl.textContent = icons[w.icon];
  if (tempEl) tempEl.textContent = w.temp;
  if (descEl) descEl.textContent = w.desc;
}

let colorSetup = false;
function setupColor() {
  if (colorSetup) return;
  colorSetup = true;
  const pick = document.getElementById('color-pick');
  if (!pick) return;
  function updateColor() {
    const hex = pick.value;
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    const valsEl = document.getElementById('color-vals');
    const prevEl = document.getElementById('color-preview');
    if (valsEl) valsEl.innerHTML = 'HEX: ' + hex.toUpperCase() + 'RGB: rgb(' + r + ', ' + g + ', ' + b + ')HSL: ' + hexToHSL(hex);
    if (prevEl) prevEl.style.background = hex;
  }
  pick.addEventListener('input', updateColor);
  updateColor();
}

function hexToHSL(hex) {
  let r = parseInt(hex.slice(1,3),16)/255;
  let g = parseInt(hex.slice(3,5),16)/255;
  let b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0, l = (max+min)/2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    if (max === r) h = ((g-b)/d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b-r)/d + 2) / 6;
    else h = ((r-g)/d + 4) / 6;
  }
  return 'hsl(' + Math.round(h*360) + ', ' + Math.round(s*100) + '%, ' + Math.round(l*100) + '%)';
}

const wallpapers = ['#080810','#0a0005','#000a08','#05000a','#080500','#000510'];
let wpIdx = 0;
function changeWallpaper() {
  wpIdx = (wpIdx + 1) % wallpapers.length;
  document.getElementById('desktop').style.background = wallpapers[wpIdx];
  hideCtx();
}

const ctxMenu = document.getElementById('ctx-menu');
const desktop = document.getElementById('desktop');

desktop.addEventListener('contextmenu', function(e) {
  e.preventDefault();
  const x = Math.min(e.clientX, window.innerWidth - 200);
  const y = Math.min(e.clientY, window.innerHeight - 280);
  ctxMenu.style.left = x + 'px';
  ctxMenu.style.top = y + 'px';
  ctxMenu.style.display = 'block';
});

document.addEventListener('click', function(e) {
  if (!ctxMenu.contains(e.target)) hideCtx();
});

function hideCtx() {
  ctxMenu.style.display = 'none';
}

function formatText(cmd) {
  document.execCommand(cmd, false, null);
}
function clearNote() {
  const el = document.getElementById('notepad-area');
  if (el) el.innerHTML = '';
}
function copyNote() {
  const el = document.getElementById('notepad-area');
  if (el) navigator.clipboard.writeText(el.innerText);
}

if (navigator.getBattery) {
  navigator.getBattery().then(function(b) {
    const el = document.getElementById('battery');
    function update() {
      if (el) el.textContent = Math.round(b.level * 100) + '%';
    }
    update();
    b.addEventListener('levelchange', update);
  });
}
