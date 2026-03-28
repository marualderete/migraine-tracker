import { DB } from './db.js';
import { nowTimeStr } from './utils.js';
import { openModal, closeModal } from './modal.js';
import { renderSlider, renderChips, getSliderVal, getChipVals } from './components.js';
import { MED_OPTIONS } from './config.js';

export function openAddMedModal() {
  const ep = DB.getActiveEpisode();
  if (!ep) return;
  document.getElementById('modal-med-content').innerHTML = `
    <div class="modal-title">💊 Agregar medicación</div>
    <div class="field-group">
      <label class="field-label">¿Qué tomaste?</label>
      ${renderChips('modal_med_name', MED_OPTIONS, false, [])}
    </div>
    <div class="field-group">
      <label class="field-label">¿A qué hora?</label>
      <input type="time" id="modal_med_time" class="time-input" value="${nowTimeStr()}">
    </div>
    <div class="field-group">
      <label class="field-label">Dosis</label>
      <input type="text" id="modal_med_dose" class="num-input" placeholder="ej: 400mg">
    </div>
    <div class="field-group">
      <label class="field-label">¿Cuánto alivio te dio? (dejalo en 0 si aún no sabés)</label>
      ${renderSlider('modal_med_eff', 0, {max:10, leftLabel:'Sin alivio', rightLabel:'Alivio total', scheme:'positive'})}
    </div>
    <button class="btn btn-primary mt-3" onclick="saveMedToActive()">Guardar</button>
  `;
  openModal('modal-med');
  setTimeout(() => document.querySelectorAll('.range-input').forEach(i => i.dispatchEvent(new Event('input'))), 50);
}

export function saveMedToActive() {
  const ep = DB.getActiveEpisode();
  if (!ep) return;
  const names = getChipVals('modal_med_name');
  const med = {
    name: names[0] || 'Medicamento',
    time: document.getElementById('modal_med_time').value,
    dose: document.getElementById('modal_med_dose').value,
    efficacy: getSliderVal('modal_med_eff')
  };
  const wave = ep.waves[ep.waves.length - 1];
  if (!wave.medications) wave.medications = [];
  wave.medications.push(med);
  DB.saveEpisode(ep);
  closeModal('modal-med');
  window.renderHome();
}

export function openCloseWaveModal() {
  const ep = DB.getActiveEpisode();
  if (!ep) return;
  document.getElementById('modal-wave-content').innerHTML = `
    <div class="modal-title">✅ Cerrar ola actual</div>
    <p class="text-muted text-sm" style="margin-bottom:16px">El dolor se fue o mejoró considerablemente.</p>
    <div class="field-group">
      <label class="field-label">¿A qué hora mejoró?</label>
      <input type="time" id="modal_wave_end" class="time-input" value="${nowTimeStr()}">
    </div>
    <div class="field-group">
      <label class="field-label">¿Cómo se resolvió?</label>
      ${renderChips('modal_wave_res', ['Solo (espontáneo)','Con medicación','Dormí','Oscuridad y silencio','Frío en la frente','Vomité','Otro'], true, [])}
    </div>
    <div class="field-group">
      <label class="field-label">¿Cómo te sentís ahora? (intensidad del dolor)</label>
      ${renderSlider('modal_wave_now', 10, {leftLabel:'Sin dolor', rightLabel:'Sigue igual', scheme:'pain'})}
    </div>
    <button class="btn btn-primary mt-3" onclick="closeCurrentWave(false)">Cerrar esta ola</button>
    <button class="btn btn-secondary mt-2" onclick="closeCurrentWave(true)" style="margin-top:8px">Cerrar ola Y terminar el episodio del día</button>
  `;
  openModal('modal-wave');
  setTimeout(() => document.querySelectorAll('.range-input').forEach(i => i.dispatchEvent(new Event('input'))), 50);
}

export function closeCurrentWave(closeEpisode) {
  const ep = DB.getActiveEpisode();
  if (!ep) return;
  const wave = ep.waves[ep.waves.length - 1];
  const resVals = getChipVals('modal_wave_res');
  wave.wave_end = document.getElementById('modal_wave_end')?.value || nowTimeStr();
  wave.resolved = true;
  wave.resolution_type = resVals.length ? resVals.join(', ') : null;
  wave.final_intensity = getSliderVal('modal_wave_now');
  if (closeEpisode) ep.status = 'resolved';
  DB.saveEpisode(ep);
  closeModal('modal-wave');
  window.renderHome();
}

export function openNewWaveModal() {
  const ep = DB.getActiveEpisode();
  if (!ep) return;
  document.getElementById('modal-wave-content').innerHTML = `
    <div class="modal-title">🔄 Volvió el dolor (nueva ola)</div>
    <p class="text-muted text-sm" style="margin-bottom:16px">Registrá esta recaída dentro del mismo episodio del día.</p>
    <div class="field-group">
      <label class="field-label">¿A qué hora volvió?</label>
      <input type="time" id="modal_new_wave_start" class="time-input" value="${nowTimeStr()}">
    </div>
    <div class="field-group">
      <label class="field-label">Intensidad del dolor ahora</label>
      ${renderSlider('modal_new_wave_int', 6, {max:10, leftLabel:'Leve', rightLabel:'Insoportable', scheme:'pain'})}
    </div>
    <button class="btn btn-primary mt-3" onclick="addNewWave()">Registrar nueva ola</button>
  `;
  openModal('modal-wave');
  setTimeout(() => document.querySelectorAll('.range-input').forEach(i => i.dispatchEvent(new Event('input'))), 50);
}

export function addNewWave() {
  const ep = DB.getActiveEpisode();
  if (!ep) return;
  // Close previous wave if still open
  const prev = ep.waves[ep.waves.length-1];
  if (!prev.resolved) {
    prev.wave_end = document.getElementById('modal_new_wave_start')?.value || nowTimeStr();
    prev.resolved = true;
    prev.resolution_type = 'nueva ola';
  }
  ep.waves.push({
    id: ep.waves.length + 1,
    wave_start: document.getElementById('modal_new_wave_start')?.value || nowTimeStr(),
    wave_end: null,
    peak_intensity: getSliderVal('modal_new_wave_int'),
    resolved: false,
    resolution_type: null,
    medications: []
  });
  DB.saveEpisode(ep);
  closeModal('modal-wave');
  window.renderHome();
}
