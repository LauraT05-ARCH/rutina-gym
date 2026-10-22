const NAMES = ['Rutina 1', 'Rutina D2', 'Rutina 3'];
const mk = (r, id, name, weight, sets, tag) => ({ r, id, name, weight, sets, tag: tag || 'Serie', done: 0, reps: 8 });
const DEFAULT = [
  mk(0,'a1','HIP THRUSTS — sostener 3" arriba c/rep','45 / 45+25',4),
  mk(0,'a2','PRENSA HORIZONTAL INCLINADA, pies alto y ancho','41 kg unipodal / 75 kg bipodal',4),
  mk(0,'a3','ADUCCIÓN CADERA','150-160',4),
  mk(0,'a4','ABDUCCIÓN CADERA','150-160',4),
  mk(0,'a5','JALÓN AL PECHO AGARRE ANCHO','70',4),
  mk(0,'a6','PRESS HOMBRO NEUTRO (Pos 6)','15 - 15+5',4),
  mk(0,'a7','TRÍCEP ALTO BIMODAL POLEA CON BARRA','40-50',4),
  mk(1,'b1','SENTADILLA BÚLGARA','25 c/l / 30 c/l',4),
  mk(1,'b2','PRENSA 45° PIES ANCHOS','45 c/l / 90 c/l',4),
  mk(1,'b3','HAMMER STRENGTH','20 - 30 c/l',4),
  mk(1,'b4','FACEPULL','60 lb o 40 kg - 65 lb o 45 kg',4),
  mk(1,'b5','BÍCEPS CURL POLEA','40 - 50',4),
  mk(2,'c1','SENTADILLA HACK','25 c/l / 30 c/l',4),
  mk(2,'c2','STEP UP POLEA','37.5',3),
  mk(2,'c3','JALÓN AL PECHO AGARRE ANGOSTO SUPINO','70',4,'Biserie'),
  mk(2,'c4','PECHO MÁQUINA','55',4,'Biserie'),
  mk(2,'c5','PULLOVER','40 - 50',4),
  mk(2,'c6','ADUCCIÓN CADERA + PULSOS','160',4)
];
const KEY = 'rutinas3';
let focusId = null;
let state = { tab: 0, ex: DEFAULT };
try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.ex) state = s; } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const btn = (on, act, id, v, label) => `<button class="chip${on ? ' on' : ''}" data-a="${act}" data-id="${id}" data-v="${v}">${label}</button>`;

function render() {
  const list = state.ex.filter((e) => e.r === state.tab);
  const done = list.reduce((a, e) => a + e.done, 0), total = list.reduce((a, e) => a + e.sets, 0);
  const active = document.activeElement && document.activeElement.id;
  document.getElementById('app').innerHTML =
    `<div class="head"><div><small>MI RUTINA</small><h1>${NAMES[state.tab]}</h1></div><div>${done} / ${total}<br>series hechas</div></div>` +
    `<div class="tabs">${NAMES.map((n, i) => btn(i === state.tab, 'tab', '', i, n)).join('')}</div>` +
    list.map((e) => `<div class="card">
      <div class="top"><input class="n" id="n-${e.id}" data-a="name" data-id="${e.id}" value="${esc(e.name)}" placeholder="Nombre del ejercicio"><button class="tag" data-a="tag" data-id="${e.id}">${esc(e.tag)}</button><button class="del" data-a="del" data-id="${e.id}" aria-label="Eliminar ejercicio">✕</button></div>
      <div class="row"><label class="lbl" for="p-${e.id}">Peso</label><input class="w" id="p-${e.id}" data-a="weight" data-id="${e.id}" value="${esc(e.weight)}"></div>
      <div class="row"><span class="lbl">Series</span>${btn(e.sets === 3, 'sets', e.id, 3, 3)}${btn(e.sets === 4, 'sets', e.id, 4, 4)}<span style="width:8px"></span>
        ${Array.from({ length: e.sets }, (_, i) => btn(i < e.done, 'done', e.id, i + 1, i + 1)).join('')}</div>
      <div class="row"><span class="lbl">Reps</span>${[6, 8, 10].map((n) => btn(e.reps === n, 'reps', e.id, n, n)).join('')}</div>
    </div>`).join('') +
    `<button class="add" data-a="add">+ Agregar ejercicio</button>` +
    `<button class="reset" data-a="reset">Nuevo entrenamiento (limpiar series)</button>`;
  if (focusId) { const el = document.getElementById('n-' + focusId); if (el) { el.focus(); el.select(); } focusId = null; }
  else if (active) { const el = document.getElementById(active); if (el) el.focus(); }
}

document.getElementById('app').addEventListener('click', (ev) => {
  const b = ev.target.closest('button[data-a]'); if (!b) return;
  const a = b.dataset.a, v = Number(b.dataset.v), e = state.ex.find((x) => x.id === b.dataset.id);
  if (a === 'tab') state.tab = v;
  else if (a === 'reset') state.ex.forEach((x) => { if (x.r === state.tab) x.done = 0; });
  else if (a === 'sets') { e.sets = v; e.done = Math.min(e.done, v); }
  else if (a === 'done') e.done = e.done === v ? v - 1 : v;
  else if (a === 'reps') e.reps = v;
  else if (a === 'tag') e.tag = e.tag === 'Serie' ? 'Biserie' : 'Serie';
  else if (a === 'add') {
    const id = 'x' + Date.now();
    state.ex.push({ r: state.tab, id, name: '', weight: '', sets: 4, tag: 'Serie', done: 0, reps: 8 });
    focusId = id;
  }
  else if (a === 'del') {
    if (!confirm('¿Eliminar "' + (e.name || 'este ejercicio') + '"?')) return;
    state.ex = state.ex.filter((x) => x.id !== e.id);
  }
  save(); render();
});
document.getElementById('app').addEventListener('change', (ev) => {
  const a = ev.target.dataset.a;
  if (a !== 'weight' && a !== 'name') return;
  state.ex.find((x) => x.id === ev.target.dataset.id)[a] = ev.target.value;
  save();
});
render();
