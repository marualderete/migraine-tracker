import { clamp, intensityColor, intensityLabel, stressLabel, sleepQLabel, hydrationLabel } from './utils.js';

export function renderSlider(id, value, opts = {}) {
  const { min=0, max=100, step=1, leftLabel='', rightLabel='', scheme='neutral', formatter=null } = opts;
  const val = clamp(value, min, max);
  const formatted = formatter ? formatter(val) : (scheme === 'pain' ? `${val}/10 — ${intensityLabel(val)}` : scheme === 'positive' ? (id==='sleep_quality'?`${val}/10 — ${sleepQLabel(val)}`:`${val}/10`) : scheme === 'warn' ? (id==='stress_yesterday'||id==='stress_today'?`${val}/10 — ${stressLabel(val)}`:`${val}/10`) : id==='hydration' ? `${val}/10 — ${hydrationLabel(val)}` : `${val}`);
  const color = scheme==='pain' ? intensityColor(val) : scheme==='positive' ? (val>6?'var(--green)':val>3?'var(--amber)':'var(--red)') : scheme==='warn' ? (val<3?'var(--green)':val<6?'var(--amber)':'var(--red)') : 'var(--accent2)';
  return `
    <div class="slider-wrap">
      <div class="slider-value-badge" id="display_${id}" style="color:${color}">${formatted}</div>
      <input type="range" class="range-input" id="slider_${id}" min="${min}" max="${max}" step="${step}" value="${val}"
        oninput="updateSlider('${id}','${scheme}',${min},${max})">
      ${leftLabel||rightLabel ? `<div class="slider-end-labels"><span>${leftLabel}</span><span>${rightLabel}</span></div>` : ''}
    </div>`;
}

export function updateSlider(id, scheme, min, max, _fmt) {
  const input = document.getElementById(`slider_${id}`);
  if (!input) return;
  const val = parseFloat(input.value);
  const pct = ((val-min)/(max-min))*100;
  const color = scheme==='pain' ? intensityColor(val) : scheme==='positive' ? (val>6?'var(--green)':val>3?'var(--amber)':'var(--red)') : scheme==='warn' ? (val<3?'var(--green)':val<6?'var(--amber)':'var(--red)') : 'var(--accent2)';
  input.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, var(--card2) ${pct}%, var(--card2) 100%)`;
  const display = document.getElementById(`display_${id}`);
  if (!display) return;
  display.style.color = color;
  if (scheme==='pain') display.textContent = `${val}/10 — ${intensityLabel(val)}`;
  else if (id==='sleep_quality') display.textContent = `${val}/10 — ${sleepQLabel(val)}`;
  else if (id==='hydration') display.textContent = `${val}/10 — ${hydrationLabel(val)}`;
  else if (id==='stress_yesterday'||id==='stress_today') display.textContent = `${val}/10 — ${stressLabel(val)}`;
  else if (id==='sleep_hours') display.textContent = `${val} horas`;
  else if (id==='prodrome_hours') display.textContent = `${val}h antes`;
  else if (id==='fasting_hours') display.textContent = `${val}h de ayuno`;
  else if (id==='caffeine_cups') display.textContent = val===0?'Ninguna':`${val} ${val===1?'taza':'tazas'}`;
  else if (id==='mate_rounds') display.textContent = val===0?'No tomé':`${val} ${val===1?'porrón':'porrones'}`;
  else if (id==='screen_time') display.textContent = `${val}h`;
  else display.textContent = `${val}/10`;
}

export function initSliders() {
  document.querySelectorAll('.range-input').forEach(input => {
    const id = input.id.replace('slider_','');
    const scheme = input.closest('.slider-wrap')?.querySelector(`#display_${id}`)?.style?.color ? null : 'neutral';
    updateSlider(id, input.dataset.scheme || 'neutral', parseFloat(input.min), parseFloat(input.max), null);
    // Fix: re-derive scheme from class or just re-init
    input.dispatchEvent(new Event('input'));
  });
}

export function getSliderVal(id) {
  const el = document.getElementById(`slider_${id}`);
  return el ? parseFloat(el.value) : 0;
}

export function renderChips(id, options, isMulti, selected, variant='') {
  const selSet = new Set(selected);
  return `<div class="chips-grid" id="chips_${id}" data-multi="${isMulti}" data-variant="${variant}" onclick="onChipClick(event,'${id}')">
    ${options.map(o => `<div class="chip ${selSet.has(o)?('selected'+(variant==='pink'?' selected-pink':'')):''}" data-val="${o}">${o}</div>`).join('')}
  </div>`;
}

export function onChipClick(event, id) {
  const chip = event.target.closest('.chip');
  if (!chip) return;
  const wrap = document.getElementById(`chips_${id}`);
  const isMulti = wrap.dataset.multi === 'true';
  const variant = wrap.dataset.variant;
  const selClass = 'selected' + (variant==='pink'?' selected-pink':'');
  if (!isMulti) {
    wrap.querySelectorAll('.chip').forEach(c => c.className = 'chip');
    chip.className = `chip ${selClass}`;
  } else {
    chip.classList.toggle('selected');
    if (variant === 'pink') chip.classList.toggle('selected-pink');
  }
  // Show/hide conditional sections
  if (id === 'prodrome') {
    const hasVal = wrap.querySelectorAll('.chip.selected').length > 0;
    const grp = document.getElementById('prodrome-hours-group');
    if (grp) grp.style.display = hasVal ? 'block' : 'none';
  }
  if (id === 'has_cycle') {
    const show = chip.dataset.val === 'Sí, tengo ciclo';
    const el = document.getElementById('cycle-fields');
    if (el) el.style.display = show ? 'block' : 'none';
  }
}

export function getChipVals(id) {
  const wrap = document.getElementById(`chips_${id}`);
  if (!wrap) return [];
  return [...wrap.querySelectorAll('.chip.selected')].map(c => c.dataset.val);
}

export function renderToggle(id, checked) {
  return `<label class="toggle">
    <input type="checkbox" id="toggle_${id}" ${checked?'checked':''} onchange="onToggleChange('${id}')">
    <span class="toggle-slider"></span>
  </label>`;
}

export function onToggleChange(id) {
  const checked = document.getElementById(`toggle_${id}`).checked;
  if (id === 'aura') {
    const el = document.getElementById('aura-detail');
    if (el) el.style.display = checked ? 'block' : 'none';
  }
  if (id === 'meals_skipped') {
    const el = document.getElementById('fasting-detail');
    if (el) el.style.display = checked ? 'block' : 'none';
  }
  if (id === 'exercise_done') {
    const el = document.getElementById('exercise-detail');
    if (el) el.style.display = checked ? 'block' : 'none';
  }
}
