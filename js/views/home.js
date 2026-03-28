import { DB } from '../db.js';
import { todayStr, formatDate, intensityColor, intensityLabel } from '../utils.js';
import { renderEpisodeItem } from './history.js';

export function renderHome() {
  const episodes = DB.getEpisodes();
  const active = DB.getActiveEpisode();
  const thisMonth = episodes.filter(e => e.date && e.date.startsWith(todayStr().slice(0,7)));
  const avgPain = thisMonth.length ? (thisMonth.reduce((s,e) => s + (e.current_intensity||0), 0) / thisMonth.length).toFixed(0) : 0;

  let html = `
    <div class="view active" id="view-home">
      <div class="flex-between" style="margin-bottom:4px">
        <div>
          <h1 class="page-title">MigraTrack ✦</h1>
          <p class="page-subtitle">${formatDate(todayStr())}</p>
        </div>
      </div>`;

  if (active) {
    const wave = active.waves[active.waves.length - 1];
    const waveNum = active.waves.length;
    const openMeds = active.waves.flatMap(w => w.medications || []);
    html += `
      <div class="active-ep-card">
        <div class="active-badge">Episodio activo</div>
        <div class="flex-between" style="margin-bottom:10px">
          <div>
            <div style="font-size:17px;font-weight:700">Día de migraña</div>
            <div class="text-sm text-muted">${waveNum} ola${waveNum>1?'s':''} · Empezó a las ${active.started_at}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:24px;font-weight:800;color:${intensityColor(active.current_intensity||0)}">${active.current_intensity||0}</div>
            <div class="text-sm text-muted">intensidad</div>
          </div>
        </div>
        ${openMeds.length > 0 ? `<div class="ep-tags" style="margin-bottom:10px">${openMeds.map(m=>`<span class="tag">${m.name}</span>`).join('')}</div>` : ''}
        <div class="wave-timeline">
          ${active.waves.map((w,i) => `
            <div class="wave-item">
              <div class="wave-dot-col">
                <div class="wave-dot ${w.resolved?'resolved':'open'}"></div>
                ${i < active.waves.length-1 ? '<div class="wave-line"></div>' : ''}
              </div>
              <div class="wave-content">
                <div class="wave-time">Ola ${w.id} — ${w.wave_start}${w.wave_end?' → '+w.wave_end:' (activa)'}</div>
                <div class="wave-intensity">Intensidad máx: ${w.peak_intensity}</div>
                ${w.medications?.length ? `<div class="wave-meds">${w.medications.map(m=>`<span class="tag">${m.name}${m.time?' '+m.time:''}</span>`).join('')}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="divider"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="openAddMedModal()">💊 Tomé medicación</button>
          ${!wave.resolved ? `<button class="btn btn-secondary btn-sm" onclick="openCloseWaveModal()">✅ Mejoró</button>` : `<button class="btn btn-secondary btn-sm" onclick="openNewWaveModal()">🔄 Volvió</button>`}
        </div>
        ${wave.resolved ? `<button class="btn btn-ghost" style="width:100%;margin-top:6px;color:var(--text3)" onclick="openNewWaveModal()">🔄 El dolor volvió (nueva ola)</button>` : ''}
      </div>`;
    html += `
      <button class="btn btn-secondary btn-sm" style="width:100%;margin-bottom:16px;opacity:.75"
        onclick="startWizard()">📅 Registrar episodio de otro día</button>`;
  } else {
    html += `
      <button class="episode-cta" onclick="startWizard()">
        <span class="cta-emoji">🧠</span>
        <div class="cta-title">Tengo un episodio</div>
        <div class="cta-sub">Empezar registro completo</div>
      </button>`;
  }

  html += `
    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-value">${thisMonth.length}</div>
        <div class="stat-label">episodios este mes</div>
      </div>
      <div class="stat-box">
        <div class="stat-value" style="color:${intensityColor(Number(avgPain))}">${avgPain}</div>
        <div class="stat-label">dolor promedio</div>
      </div>
    </div>`;

  if (episodes.length > 0) {
    html += `<div class="card-title" style="margin-bottom:8px">Episodios recientes</div>`;
    episodes.slice(0,3).forEach(ep => {
      html += renderEpisodeItem(ep);
    });
  } else {
    html += `<div class="empty-state"><span class="empty-emoji">📋</span><p>No hay episodios registrados aún.<br>Cuando tengas uno, tocá el botón de arriba.</p></div>`;
  }

  html += `</div>`;
  document.getElementById('app').innerHTML = html;
}
