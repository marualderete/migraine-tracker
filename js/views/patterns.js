import { DB } from '../db.js';
import { intensityColor } from '../utils.js';
import { PHASE_LABELS } from '../config.js';

export function analyzePatterns(episodes) {
  if (episodes.length < 2) return null;
  const insights = [];
  const n = episodes.length;

  // 1. Menstrual phase correlation
  const phaseCounts = {};
  episodes.forEach(e => { if (e.menstrual_phase) phaseCounts[e.menstrual_phase] = (phaseCounts[e.menstrual_phase]||0)+1; });
  const topPhaseEntry = Object.entries(phaseCounts).sort((a,b)=>b[1]-a[1])[0];
  if (topPhaseEntry && topPhaseEntry[1]/n >= 0.35) {
    const pct = Math.round(topPhaseEntry[1]/n*100);
    insights.push({
      type:'menstrual', emoji:'🌙', priority:'high',
      title: `Patrón hormonal claro`,
      text: `El <strong>${pct}%</strong> de tus episodios ocurren en <strong>${PHASE_LABELS[topPhaseEntry[0]]?.replace(/[🔴🌱🌕🌙🌑]/g,'').trim()}</strong>. La fluctuación de estrógenos en esta fase activa el sistema trigeminovascular.`,
      pct
    });
  }

  // 2. Sleep
  const sleepEps = episodes.filter(e => e.sleep_hours);
  if (sleepEps.length >= 2) {
    const avgSleep = sleepEps.reduce((s,e)=>s+e.sleep_hours,0)/sleepEps.length;
    const badSleep = sleepEps.filter(e=>e.sleep_hours<6.5).length;
    const badPct = Math.round(badSleep/sleepEps.length*100);
    if (avgSleep < 7 || badPct >= 50) {
      insights.push({
        type:'sleep', emoji:'😴', priority: avgSleep<5.5?'high':'medium',
        title: 'Sueño insuficiente como trigger',
        text: `En promedio dormís <strong>${avgSleep.toFixed(1)}h</strong> la noche anterior a un episodio. El <strong>${badPct}%</strong> de las veces dormiste menos de 6.5h. Estudios 2024 encontraron que el insomnio tiene relación causal bidireccional con la migraña.`,
        pct: badPct
      });
    }
    const avgQuality = sleepEps.reduce((s,e)=>s+(e.sleep_quality||50),0)/sleepEps.length;
    if (avgQuality < 5.5) {
      insights.push({
        type:'sleep_quality', emoji:'🌙', priority:'medium',
        title: 'Calidad del sueño comprometida',
        text: `La calidad promedio del sueño previo al episodio es <strong>${(Math.round(avgQuality*10)/10)}/10</strong>. El sueño fragmentado (despertarse varias veces) es más predictivo que la duración.`,
        pct: Math.round(avgQuality)
      });
    }
  }

  // 3. Stress letdown
  const letdownEps = episodes.filter(e=>e.stress_letdown).length;
  const letdownPct = Math.round(letdownEps/n*100);
  if (letdownPct >= 25) {
    insights.push({
      type:'stress_letdown', emoji:'📉', priority:'high',
      title: 'Efecto rebote del estrés',
      text: `El <strong>${letdownPct}%</strong> de tus episodios ocurren el día en que el estrés se libera. Este "efecto rebote" (weekend migraine) es un fenómeno documentado: los niveles de cortisol bajan bruscamente y disparan el episodio.`,
      pct: letdownPct
    });
  }

  // 4. High stress before episode
  const highStressEps = episodes.filter(e=>(e.stress_yesterday||0)>=6.5).length;
  const highStressPct = Math.round(highStressEps/n*100);
  if (highStressPct >= 40) {
    insights.push({
      type:'stress', emoji:'🌊', priority:'medium',
      title: 'Estrés alto previo',
      text: `El <strong>${highStressPct}%</strong> de los episodios siguieron a un día con estrés ≥6.5/10. El estrés modula los niveles de CGRP, el péptido clave en la cascada de la migraña.`,
      pct: highStressPct
    });
  }

  // 5. Food triggers
  const foodCounts = {};
  episodes.forEach(e => (e.foods_consumed||[]).forEach(f => { if (f !== 'Nada en especial') foodCounts[f] = (foodCounts[f]||0)+1; }));
  const topFoods = Object.entries(foodCounts).sort((a,b)=>b[1]-a[1]).slice(0,4);
  if (topFoods.length > 0 && topFoods[0][1] >= 2) {
    const foodBar = topFoods.map(([f,c]) => ({ label:f, pct:Math.round(c/n*100), count:c }));
    insights.push({
      type:'food', emoji:'🥗', priority:'medium',
      title: 'Alimentos más frecuentes antes del episodio',
      text: `Estos son los alimentos que aparecen con más frecuencia en las 24–48h previas a tus episodios. Recordá: pueden ser triggers O síntomas del pródromo (antojo).`,
      bars: foodBar
    });
  }

  // 6. Prodrome patterns
  const prodromeCounts = {};
  episodes.forEach(e => (e.prodrome||[]).forEach(p => prodromeCounts[p] = (prodromeCounts[p]||0)+1));
  const topProdrome = Object.entries(prodromeCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if (topProdrome.length > 0 && topProdrome[0][1] >= 2) {
    const proBars = topProdrome.map(([p,c]) => ({ label:p, pct:Math.round(c/n*100), count:c }));
    insights.push({
      type:'prodrome', emoji:'⚠️', priority:'info',
      title: 'Tus señales de alerta más frecuentes',
      text: `Estas señales aparecen antes del dolor. Reconocerlas te da ventaja para intervenir temprano (hidratarte, descansar, tomar medicación preventiva).`,
      bars: proBars
    });
  }

  // 7. Caffeine withdrawal
  const cafWithEps = episodes.filter(e=>e.caffeine_withdrawal).length;
  const cafWithPct = Math.round(cafWithEps/n*100);
  if (cafWithPct >= 25) {
    insights.push({
      type:'caffeine', emoji:'☕', priority:'medium',
      title: 'Abstinencia de cafeína',
      text: `El <strong>${cafWithPct}%</strong> de los episodios coincidieron con días en que tomaste menos cafeína de lo habitual. La abstinencia de cafeína es uno de los triggers más directamente causales y fáciles de evitar.`,
      pct: cafWithPct
    });
  }

  // 8. Weather
  const weatherEps = episodes.filter(e=>e.weather_factor).length;
  const weatherPct = Math.round(weatherEps/n*100);
  if (weatherPct >= 30) {
    insights.push({
      type:'weather', emoji:'☁️', priority:'info',
      title: 'Sensibilidad al clima',
      text: `El <strong>${weatherPct}%</strong> de tus episodios coincidieron con cambios climáticos. Las variaciones de presión barométrica de ≥6 hPa son el factor ambiental con mayor evidencia clínica.`,
      pct: weatherPct
    });
  }

  // 9. Compound triggers
  const compound = episodes.filter(e => {
    let factors = 0;
    if ((e.stress_yesterday||0) >= 60) factors++;
    if ((e.sleep_hours||8) < 6.5) factors++;
    if ((e.foods_consumed||[]).some(f => ['Chocolate','Harinas refinadas','Vino tinto','Queso curado/añejo'].includes(f))) factors++;
    if (e.menstrual_phase === 'lutea_tardia' || e.menstrual_phase === 'menstruacion') factors++;
    return factors >= 3;
  });
  if (compound.length >= 2) {
    const cPct = Math.round(compound.length/n*100);
    insights.push({
      type:'compound', emoji:'🧩', priority:'high',
      title: 'Tormenta perfecta de triggers',
      text: `El <strong>${cPct}%</strong> de tus episodios más intensos tienen 3 o más factores combinados: estrés alto + sueño corto + alimentos trigger + fase hormonal crítica. La combinación dispara el umbral de migraña mucho más que cada factor por separado.`,
      pct: cPct
    });
  }

  // 10. Days until period correlation
  const periodWindow = episodes.filter(e => e.days_until_period !== null && e.days_until_period !== undefined && e.days_until_period <= 3).length;
  const periodPct = Math.round(periodWindow/n*100);
  if (periodPct >= 30) {
    insights.push({
      type:'period_window', emoji:'🔴', priority:'high',
      title: 'Ventana menstrual (-3 a 0 días)',
      text: `El <strong>${periodPct}%</strong> de tus episodios ocurren en los 3 días previos a la menstruación. Esto define la "migraña menstrual pura" según los criterios IHS. La caída de estrógenos en este momento eleva el CGRP y baja el umbral de dolor.`,
      pct: periodPct
    });
  }

  // Sort by priority
  const order = {high:0, medium:1, info:2, positive:3};
  insights.sort((a,b) => (order[a.priority]||2) - (order[b.priority]||2));
  return insights;
}

export function renderPatterns() {
  const episodes = DB.getEpisodes().filter(e => e.status !== 'active');
  let html = `<div class="view active" id="view-patterns">
    <h1 class="page-title">Patrones 🔍</h1>
    <p class="page-subtitle">Análisis basado en ${episodes.length} episodio${episodes.length!==1?'s':''} completados</p>`;

  if (episodes.length < 2) {
    html += `<div class="empty-state"><span class="empty-emoji">🔍</span><p>Necesitás al menos <strong>2 episodios</strong> registrados para ver patrones.<br><br>Los patrones se vuelven más precisos con 6+ episodios.</p></div>`;
  } else {
    const insights = analyzePatterns(episodes);
    if (!insights || insights.length === 0) {
      html += `<p class="text-muted text-sm">Aún no hay patrones claros. Seguí registrando para que el análisis sea más preciso.</p>`;
    } else {
      insights.forEach(ins => {
        const cls = ins.priority === 'high' ? 'insight-high' : ins.priority === 'medium' ? 'insight-medium' : ins.priority === 'positive' ? 'insight-positive' : 'insight-info';
        html += `<div class="insight-card ${cls}">
          <div class="insight-emoji">${ins.emoji}</div>
          <div class="insight-title">${ins.title}</div>
          <div class="insight-text">${ins.text}</div>
          ${ins.pct !== undefined && !ins.bars ? `<div style="margin-top:8px"><span class="insight-pct">${ins.pct}%</span></div>` : ''}
          ${ins.bars ? `<div class="bar-chart">${ins.bars.map(b=>`
            <div class="bar-row">
              <div class="bar-label">${b.label}</div>
              <div class="bar-track"><div class="bar-fill" style="width:${b.pct}%;background:var(--accent)"></div></div>
              <div class="bar-val">${b.pct}%</div>
            </div>`).join('')}</div>` : ''}
        </div>`;
      });
    }

    // Quick summary stats
    const avgPain = (episodes.reduce((s,e)=>s+(e.current_intensity||0),0)/episodes.length).toFixed(0);
    const avgSleep = episodes.filter(e=>e.sleep_hours).length ? (episodes.filter(e=>e.sleep_hours).reduce((s,e)=>s+e.sleep_hours,0)/episodes.filter(e=>e.sleep_hours).length).toFixed(1) : '–';
    const avgStress = episodes.filter(e=>e.stress_yesterday).length ? (episodes.filter(e=>e.stress_yesterday).reduce((s,e)=>s+e.stress_yesterday,0)/episodes.filter(e=>e.stress_yesterday).length).toFixed(0) : '–';
    html += `<div class="card" style="margin-top:8px">
      <div class="card-title">Promedios generales</div>
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat-box"><div class="stat-value" style="font-size:20px;color:${intensityColor(Number(avgPain))}">${avgPain}</div><div class="stat-label">dolor medio</div></div>
        <div class="stat-box"><div class="stat-value" style="font-size:20px">${avgSleep}h</div><div class="stat-label">sueño previo</div></div>
        <div class="stat-box"><div class="stat-value" style="font-size:20px;color:var(--amber)">${avgStress}/10</div><div class="stat-label">estrés previo</div></div>
      </div>
    </div>`;
  }
  html += '</div>';
  document.getElementById('app').innerHTML = html;
}
