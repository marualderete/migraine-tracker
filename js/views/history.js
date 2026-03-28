import { DB } from '../db.js';
import { formatDate, intensityColor, intensityLabel } from '../utils.js';
import { PHASE_LABELS } from '../config.js';

export function renderEpisodeItem(ep) {
  const waveCount = ep.waves?.length || 1;
  const allMeds = ep.waves?.flatMap(w => w.medications||[]) || [];
  const uniqueMeds = [...new Set(allMeds.map(m=>m.name))];
  const phase = ep.menstrual_phase ? Object.keys(PHASE_LABELS).find(k=>k===ep.menstrual_phase) : null;
  const phaseLabel = phase ? PHASE_LABELS[phase] : null;
  const pct = ep.current_intensity || 0;
  return `<div class="ep-item" onclick="showEpisodeDetail('${ep.id}')">
    <div class="ep-item-header">
      <span class="ep-date">${formatDate(ep.date)}</span>
      <span class="ep-waves">${waveCount} ola${waveCount>1?'s':''} ${ep.status==='active'?'🟢':''}</span>
    </div>
    <div class="intensity-bar"><div class="intensity-fill" style="width:${pct*10}%;background:${intensityColor(pct)}"></div></div>
    <div class="ep-tags" style="margin-top:8px">
      <span class="tag tag-red">${intensityLabel(pct)} (${pct})</span>
      ${phaseLabel ? `<span class="tag tag-pink">${phaseLabel.split(' ')[0]} ${phaseLabel.split(' ').slice(1,3).join(' ')}</span>` : ''}
      ${uniqueMeds.map(m=>`<span class="tag">${m}</span>`).join('')}
      ${ep.stress_letdown ? `<span class="tag tag-amber">Rebote estrés</span>` : ''}
      ${(ep.foods_consumed||[]).length > 0 ? `<span class="tag tag-amber">${ep.foods_consumed.slice(0,2).join(', ')}</span>` : ''}
    </div>
  </div>`;
}

export function renderHistory() {
  const episodes = DB.getEpisodes();
  let html = `<div class="view active" id="view-history">
    <h1 class="page-title">Historial</h1>
    <p class="page-subtitle">${episodes.length} episodio${episodes.length!==1?'s':''} registrado${episodes.length!==1?'s':''}</p>`;
  if (episodes.length === 0) {
    html += `<div class="empty-state"><span class="empty-emoji">📋</span><p>Aún no hay episodios.<br>Cuando tengas uno, registralo desde Inicio.</p></div>`;
  } else {
    episodes.forEach(ep => { html += renderEpisodeItem(ep); });
  }
  html += '</div>';
  document.getElementById('app').innerHTML = html;
}

export function showEpisodeDetail(id) {
  const ep = DB.getEpisodes().find(e => e.id === id);
  if (!ep) return;
  const allMeds = ep.waves?.flatMap(w => w.medications||[]) || [];
  const phase = ep.menstrual_phase ? PHASE_LABELS[ep.menstrual_phase] : null;
  let html = `<div class="view active" id="view-ep-detail">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
      <button class="btn btn-ghost" onclick="navigate('history')" style="padding:4px 0">← Volver</button>
      <button class="btn btn-secondary btn-sm" style="margin-left:auto" onclick="editEpisode('${ep.id}')">✏️ Editar</button>
    </div>
    <h1 class="page-title">${formatDate(ep.date)}</h1>
    <div class="ep-tags" style="margin-bottom:16px">
      <span class="tag tag-red">${intensityLabel(ep.current_intensity||0)} — ${ep.current_intensity||0}/10</span>
      ${ep.status === 'active' ? '<span class="tag tag-green">Activo</span>' : ''}
    </div>`;

  // Waves
  html += `<div class="card"><div class="card-title">⏱ Evolución del día</div>
    <div class="wave-timeline">
      ${(ep.waves||[]).map(w => `
        <div class="wave-item">
          <div class="wave-dot-col">
            <div class="wave-dot ${w.resolved?'resolved':'open'}"></div>
          </div>
          <div class="wave-content">
            <div class="wave-time">Ola ${w.id}: ${w.wave_start}${w.wave_end?' → '+w.wave_end:' (activa)'}</div>
            <div class="wave-intensity">Intensidad: ${w.peak_intensity} · ${w.resolution_type||''}</div>
            ${(w.medications||[]).map(m=>`<span class="tag" style="margin-top:4px;display:inline-block">${m.name}${m.time?' '+m.time:''} · ${m.efficacy||0}/10 alivio</span>`).join('')}
          </div>
        </div>`).join('')}
    </div></div>`;

  // Clinical data rows
  const rows = [
    ['🧭 Ubicación', (ep.pain_location||[]).join(', ')],
    ['⚡ Tipo de dolor', (ep.pain_quality||[]).join(', ')],
    ['🌙 Fase menstrual', phase],
    ['📅 Días hasta menstruación', ep.days_until_period !== null && ep.days_until_period !== undefined ? `${ep.days_until_period} días` : null],
    ['😴 Sueño', ep.sleep_hours ? `${ep.sleep_hours}h · calidad ${ep.sleep_quality||0}/10` : null],
    ['🌊 Estrés (ayer/hoy)', ep.stress_yesterday !== undefined ? `${ep.stress_yesterday}/10 / ${ep.stress_today}/10` : null],
    ['🔄 Rebote de estrés', ep.stress_letdown ? 'Sí' : null],
    ['💧 Hidratación', ep.hydration !== undefined ? `${ep.hydration}/10` : null],
    ['🥗 Alimentos', (ep.foods_consumed||[]).join(', ')],
    ['☕ Café / té', ep.caffeine_cups !== undefined ? `${ep.caffeine_cups} tazas${ep.caffeine_withdrawal?' (abstinencia)':''}` : null],
    ['🧉 Mate', ep.mate_rounds !== undefined ? (ep.mate_rounds === 0 ? 'No tomó' : `${ep.mate_rounds} ${ep.mate_rounds===1?'porrón':'porrones'}`) : null],
    ['☁️ Clima', ep.weather],
    ['📺 Pantalla', ep.screen_time !== undefined ? `${ep.screen_time}h` : null],
    ['⚠️ Pródromo', (ep.prodrome||[]).join(', ')],
  ].filter(([,v]) => v);

  html += `<div class="card"><div class="card-title">📊 Datos del episodio</div>
    ${rows.map(([k,v]) => `<div class="settings-row" style="cursor:default"><span class="text-muted text-sm">${k}</span><span style="font-size:13px;text-align:right;max-width:55%">${v}</span></div>`).join('')}
  </div>`;

  if (ep.notes) {
    html += `<div class="card"><div class="card-title">📝 Notas</div><p style="font-size:14px;color:var(--text2);line-height:1.6">${ep.notes}</p></div>`;
  }

  html += `<button class="btn btn-danger btn-sm" style="margin-bottom:24px" onclick="deleteEpisode('${ep.id}')">Eliminar episodio</button>`;
  html += `</div>`;
  document.getElementById('app').innerHTML = html;
  window.setActiveNav(null);
}

export function deleteEpisode(id) {
  if (confirm('¿Eliminás este episodio?')) {
    const data = DB.get();
    data.episodes = data.episodes.filter(e => e.id !== id);
    DB.save(data);
    window.navigate('history');
  }
}
