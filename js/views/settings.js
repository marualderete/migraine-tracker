import { DB } from '../db.js';

export function renderSettings() {
  const count = DB.getEpisodes().length;
  let html = `<div class="view active" id="view-settings">
    <h1 class="page-title">Ajustes ⚙️</h1>
    <p class="page-subtitle">${count} episodio${count!==1?'s':''} guardado${count!==1?'s':''}</p>
    <div class="settings-section">
      <div class="card-title">Datos</div>
      <div class="card">
        <div class="settings-row" onclick="DB.exportJSON()">
          <span class="settings-row-label">📥 Exportar datos (JSON)</span>
          <span class="settings-row-icon">→</span>
        </div>
        <div class="settings-row" onclick="document.getElementById('import-input').click()">
          <span class="settings-row-label">📤 Importar datos (JSON)</span>
          <span class="settings-row-icon">→</span>
        </div>
        <input type="file" id="import-input" accept=".json" style="display:none" onchange="importData(event)">
        <div class="settings-row" onclick="clearAllData()">
          <span class="settings-row-label" style="color:var(--red)">🗑️ Borrar todos los datos</span>
          <span class="settings-row-icon">→</span>
        </div>
      </div>
    </div>
    <div class="settings-section">
      <div class="card-title">📱 Como usar en el celular</div>
      <div class="card">
        <p style="font-size:13px;color:var(--text2);line-height:1.7">
          Si desinstalas la app, se perdera el historial de tus episodios, exporta los datos para luego poder importarlos nuevamente<br><br>
        </p>
      </div>
    </div>
    <div class="settings-section">
      <div class="card-title">ℹ️ Acerca de</div>
      <div class="card">
        <p style="font-size:13px;color:var(--text2);line-height:1.7">
          MigraTrack v1.0 · Basado en evidencia clínica reciente (2020–2025).<br>
          Fuentes: IHS, AHS, PMC studies sobre CGRP, ciclo menstrual y migraña, sueño y migraña, ML predictivo.<br><br>
          Desarrollado por <strong style="color:var(--text)">Maria Ines Alderete</strong><br>
          <a href="https://github.com/marualderete/migraine-tracker" target="_blank"
            style="color:var(--accent2);text-decoration:none">github.com/marualderete/migraine-tracker</a><br><br>
          <em>No reemplaza la consulta médica.</em>
        </p>
      </div>
    </div>
  </div>`;
  document.getElementById('app').innerHTML = html;
}

export function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    if (DB.importJSON(e.target.result)) {
      alert('✅ Datos importados correctamente.');
      window.navigate('home');
    } else {
      alert('❌ El archivo no tiene el formato correcto.');
    }
  };
  reader.readAsText(file);
}

export function clearAllData() {
  if (confirm('¿Estás segura? Se borrarán TODOS los episodios. Esta acción no se puede deshacer.')) {
    localStorage.removeItem(DB.KEY);
    window.navigate('home');
  }
}
