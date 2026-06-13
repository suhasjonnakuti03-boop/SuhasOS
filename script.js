document.querySelectorAll('.window').forEach(win => {
  const bar = win.querySelector('.title-bar');
  let dragging = false, ox, oy;

  bar.addEventListener('mousedown', e => {
    dragging = true;
    ox = e.clientX - win.offsetLeft;
    oy = e.clientY - win.offsetTop;
    win.style.zIndex = 1000;
  });

  document.addEventListener('mousemove', e => {
    if (dragging) {
      win.style.left = (e.clientX - ox) + 'px';
      win.style.top = (e.clientY - oy) + 'px';
    }
  });

  document.addEventListener('mouseup', () => dragging = false);
});

function closeWindow(id) {
  document.getElementById(id).style.display = 'none';
}

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString();
  const date = now.toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric' });
  const el = document.getElementById('clock');
  if (el) el.textContent = time;
  const big = document.getElementById('big-clock');
  if (big) big.textContent = time;
  const bigDate = document.getElementById('big-date');
  if (bigDate) bigDate.textContent = date;
}
setInterval(updateClock, 1000);
updateClock();

let calcExpr = '';
function calcInput(v) {
  calcExpr += v;
  document.getElementById('calc-display').value = calcExpr;
}
function calcEqual() {
  try {
    document.getElementById('calc-display').value = eval(calcExpr);
    calcExpr = String(eval(calcExpr));
  } catch { document.getElementById('calc-display').value = 'Error'; calcExpr = ''; }
}
function calcClear() {
  calcExpr = '';
  document.getElementById('calc-display').value = '';
}
