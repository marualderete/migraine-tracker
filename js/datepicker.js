import { todayStr, dateOffset, formatDate } from './utils.js';

export function renderDatePicker(selected) {
  const today = todayStr();
  const opts = [
    { label: 'Hoy',         sub: formatDate(today),          value: today },
    { label: 'Ayer',        sub: formatDate(dateOffset(-1)), value: dateOffset(-1) },
    { label: 'Hace 2 días', sub: formatDate(dateOffset(-2)), value: dateOffset(-2) },
  ];
  const isCustom = selected && !opts.find(o => o.value === selected);
  return `
    <div id="date-picker-container" style="position:relative">
      <div class="date-picker-opts">
        ${opts.map(o => `
          <button type="button" class="date-opt-btn ${selected === o.value ? 'selected' : ''}"
            onclick="selectEpisodeDate('${o.value}')">
            <span class="date-opt-label">${o.label}</span>
            <span class="date-opt-sub">${o.sub}</span>
          </button>`).join('')}
        <button type="button" class="date-opt-btn ${isCustom ? 'selected' : ''}"
          onclick="document.getElementById('f_episode_date_native').showPicker?.() || document.getElementById('f_episode_date_native').click()">
          <span class="date-opt-label">Otra fecha…</span>
          <span class="date-opt-sub">${isCustom ? formatDate(selected) : 'Elegir del calendario'}</span>
        </button>
      </div>
      <input type="date" id="f_episode_date_native"
        style="position:absolute;opacity:0;pointer-events:none;width:1px;height:1px;top:0;left:0"
        value="${selected || today}" max="${today}"
        onchange="selectEpisodeDate(this.value)">
      <input type="hidden" id="f_episode_date" value="${selected || today}">
    </div>`;
}

export function selectEpisodeDate(date) {
  // Use window.wizardData to avoid circular dependency with wizard.js
  if (window.wizardData) window.wizardData.episode_date = date;
  const container = document.getElementById('date-picker-container');
  if (container) container.outerHTML = renderDatePicker(date);
}
