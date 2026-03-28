import { todayStr, nowTimeStr, uid, formatDate } from './utils.js';
import { DB } from './db.js';
import { PHASE_LABELS, MED_OPTIONS, FOOD_OPTIONS, PRODROME_OPTIONS, WEATHER_OPTIONS } from './config.js';
import { renderSlider, renderChips, renderToggle, getSliderVal, getChipVals } from './components.js';
import { renderDatePicker } from './datepicker.js';

// Estado del wizard
export let wizardData = {};
export let wizardStep = 0;
export let editingEpisodeId = null;

// Exponer wizardData en window para que datepicker.js pueda modificarlo
// (se actualiza cada vez que se reasigna wizardData)
function syncWizardDataToWindow() {
  window.wizardData = wizardData;
}

const WIZARD_STEPS = [
  {
    id: 'inicio',
    icon: '🧠',
    title: 'Inicio del episodio',
    subtitle: 'Contame cuándo arrancó y cómo está el dolor en este momento.',
    render() {
      return `
        <div class="field-group">
          <label class="field-label">¿Qué día fue el episodio?</label>
          <p class="field-sublabel">Tocá el día que corresponda. Podés registrar episodios pasados.</p>
          ${renderDatePicker(wizardData.episode_date || todayStr())}
        </div>
        <div class="field-group">
          <label class="field-label">¿A qué hora comenzó el dolor?</label>
          <input type="time" id="f_started_at" class="time-input" value="${wizardData.started_at || nowTimeStr()}">
        </div>
        <div class="field-group">
          <label class="field-label">¿Qué tan intenso es el dolor ahora mismo?</label>
          <p class="field-sublabel">Arrastrá el círculo. 0 = sin dolor, 10 = lo peor.</p>
          ${renderSlider('current_intensity', wizardData.current_intensity ?? 5, {
            max:10, leftLabel:'Sin dolor', rightLabel:'Insoportable', scheme:'pain'
          })}
        </div>
        <div class="field-group">
          <label class="field-label">¿Cuánto te está limitando?</label>
          <p class="field-sublabel">0 = funciono normal / 10 = no puedo hacer nada</p>
          ${renderSlider('disability_level', wizardData.disability_level ?? 4, {
            max:10, leftLabel:'Funciono normal', rightLabel:'No puedo nada', scheme:'pain'
          })}
        </div>
      `;
    },
    collect() {
      wizardData.episode_date = document.getElementById('f_episode_date').value;
      wizardData.started_at = document.getElementById('f_started_at').value;
      wizardData.current_intensity = getSliderVal('current_intensity');
      wizardData.disability_level = getSliderVal('disability_level');
      syncWizardDataToWindow();
    }
  },
  {
    id: 'dolor',
    icon: '📍',
    title: 'Características del dolor',
    subtitle: '¿Dónde y cómo es el dolor? Podés elegir varios.',
    render() {
      return `
        <div class="field-group">
          <label class="field-label">¿Dónde está ubicado?</label>
          ${renderChips('pain_location', [
            'Frente','Sien derecha','Sien izquierda','Ambas sienes',
            'Detrás del ojo derecho','Detrás del ojo izquierdo',
            'Nuca / base del cráneo','Toda la cabeza'
          ], true, wizardData.pain_location || [])}
        </div>
        <div class="field-group">
          <label class="field-label">¿Cómo es el dolor?</label>
          ${renderChips('pain_quality', [
            'Pulsante (late)','Opresivo (presión)','Punzante','Quemante','Sordo / pesado'
          ], true, wizardData.pain_quality || [])}
        </div>
        <div class="field-group">
          <label class="field-label">¿Hay aura?</label>
          <p class="field-sublabel">Disturbios visuales, hormigueos, dificultad para hablar, luces o manchas antes del dolor.</p>
          ${renderToggle('aura', wizardData.aura || false)}
          <div id="aura-detail" style="margin-top:10px;display:${wizardData.aura?'block':'none'}">
            <input type="text" id="f_aura_desc" class="num-input" placeholder="Describí el aura brevemente..." value="${wizardData.aura_description||''}">
          </div>
        </div>
      `;
    },
    collect() {
      wizardData.pain_location = getChipVals('pain_location');
      wizardData.pain_quality = getChipVals('pain_quality');
      wizardData.aura = document.getElementById('toggle_aura').checked;
      wizardData.aura_description = document.getElementById('f_aura_desc')?.value || '';
      syncWizardDataToWindow();
    }
  },
  {
    id: 'sintomas',
    icon: '👁️',
    title: 'Síntomas asociados',
    subtitle: 'Indicá cuánto te afecta cada uno. 0 = nada, 10 = máximo.',
    render() {
      return `
        <div class="field-group">
          <label class="field-label">Sensibilidad a la luz (fotofobia)</label>
          ${renderSlider('photophobia', wizardData.photophobia ?? 0, {
            max:10, leftLabel:'No molesta', rightLabel:'Insoportable', scheme:'warn'
          })}
        </div>
        <div class="field-group">
          <label class="field-label">Sensibilidad al sonido (fonofobia)</label>
          ${renderSlider('phonophobia', wizardData.phonophobia ?? 0, {
            max:10, leftLabel:'No molesta', rightLabel:'Insoportable', scheme:'warn'
          })}
        </div>
        <div class="field-group">
          <label class="field-label">Náuseas</label>
          ${renderSlider('nausea', wizardData.nausea ?? 0, {
            max:10, leftLabel:'Sin náuseas', rightLabel:'Con ganas de vomitar', scheme:'warn'
          })}
        </div>
        <div class="field-group">
          <label class="field-label">Sensibilidad a los olores (osmofobia)</label>
          ${renderSlider('osmophobia', wizardData.osmophobia ?? 0, {
            max:10, leftLabel:'Normal', rightLabel:'Insoportable', scheme:'warn'
          })}
        </div>
        <div class="field-group">
          <label class="field-label">¿Vomitaste?</label>
          ${renderToggle('vomiting', wizardData.vomiting || false)}
        </div>
      `;
    },
    collect() {
      wizardData.photophobia = getSliderVal('photophobia');
      wizardData.phonophobia = getSliderVal('phonophobia');
      wizardData.nausea = getSliderVal('nausea');
      wizardData.osmophobia = getSliderVal('osmophobia');
      wizardData.vomiting = document.getElementById('toggle_vomiting').checked;
      syncWizardDataToWindow();
    }
  },
  {
    id: 'prodromo',
    icon: '⚠️',
    title: 'Señales previas (pródromo)',
    subtitle: 'Las 24–48 horas antes del dolor, ¿notaste alguna de estas señales? Esto es clave para predecir episodios.',
    render() {
      return `
        <div class="field-group">
          <label class="field-label">¿Qué señales notaste?</label>
          <p class="field-sublabel">Los prodromas son señales de que el episodio ya empezó horas antes del dolor.</p>
          ${renderChips('prodrome', PRODROME_OPTIONS, true, wizardData.prodrome || [])}
        </div>
        <div class="field-group" id="prodrome-hours-group" style="display:${(wizardData.prodrome||[]).length>0?'block':'none'}">
          <label class="field-label">¿Cuántas horas antes del dolor aparecieron?</label>
          ${renderSlider('prodrome_hours', wizardData.prodrome_hours ?? 12, {
            min:1, max:48, leftLabel:'1 hora', rightLabel:'48 horas',
            formatter: v => `${v}h antes`, scheme:'neutral'
          })}
        </div>
      `;
    },
    collect() {
      wizardData.prodrome = getChipVals('prodrome');
      wizardData.prodrome_hours = getSliderVal('prodrome_hours');
      syncWizardDataToWindow();
    }
  },
  {
    id: 'ciclo',
    icon: '🌙',
    title: 'Ciclo menstrual',
    subtitle: 'Esta sección es opcional. Si no tenés ciclo menstrual, elegí la opción correspondiente.',
    render() {
      const hasCycle = wizardData.has_cycle !== false;
      return `
        <div class="field-group">
          <label class="field-label">¿Tenés ciclo menstrual?</label>
          ${renderChips('has_cycle', ['Sí, tengo ciclo', 'No tengo ciclo'], false,
            hasCycle ? ['Sí, tengo ciclo'] : ['No tengo ciclo'])}
        </div>
        <div id="cycle-fields" style="display:${hasCycle ? 'block' : 'none'}">
          <div class="field-group">
            <label class="field-label">¿En qué fase estás hoy?</label>
            ${renderChips('menstrual_phase', Object.values(PHASE_LABELS), false, wizardData.menstrual_phase ? [PHASE_LABELS[wizardData.menstrual_phase]] : [], 'pink')}
          </div>
          <div class="field-group">
            <label class="field-label">¿Cuántos días faltan para que baje la menstruación?</label>
            <p class="field-sublabel">Si ya bajó, poné 0. Si no sabés, dejalo en blanco.</p>
            <input type="number" id="f_days_until_period" class="num-input" min="0" max="35" placeholder="ej: 2" value="${wizardData.days_until_period !== undefined ? wizardData.days_until_period : ''}">
          </div>
          <div class="field-group">
            <label class="field-label">¿Bajó la menstruación hoy?</label>
            ${renderToggle('period_today', wizardData.period_today || false)}
          </div>
          <div class="field-group">
            <label class="field-label">¿Con qué intensidad tenés síntomas premenstruales?</label>
            <p class="field-sublabel">Hinchazón, irritabilidad, sensibilidad en mamas, cambios de humor, etc.</p>
            ${renderSlider('pms_symptoms', wizardData.pms_symptoms ?? 0, {
              max:10, leftLabel:'Ninguno', rightLabel:'Muy intensos', scheme:'warn'
            })}
          </div>
        </div>
      `;
    },
    collect() {
      const hasCycle = getChipVals('has_cycle')[0] !== 'No tengo ciclo';
      wizardData.has_cycle = hasCycle;
      if (!hasCycle) {
        wizardData.menstrual_phase = null;
        wizardData.days_until_period = null;
        wizardData.period_today = false;
        wizardData.pms_symptoms = null;
        syncWizardDataToWindow();
        return;
      }
      const phaseVals = getChipVals('menstrual_phase');
      if (phaseVals.length) {
        const key = Object.keys(PHASE_LABELS).find(k => PHASE_LABELS[k] === phaseVals[0]);
        wizardData.menstrual_phase = key || phaseVals[0];
      }
      const dEl = document.getElementById('f_days_until_period');
      wizardData.days_until_period = dEl && dEl.value !== '' ? parseInt(dEl.value) : null;
      const pEl = document.getElementById('toggle_period_today');
      wizardData.period_today = pEl ? pEl.checked : false;
      wizardData.pms_symptoms = getSliderVal('pms_symptoms');
      syncWizardDataToWindow();
    }
  },
  {
    id: 'sueno',
    icon: '😴',
    title: 'Sueño de anoche',
    subtitle: 'El sueño fragmentado o corto es uno de los predictores más fuertes de un episodio.',
    render() {
      return `
        <div class="field-group">
          <label class="field-label">¿A qué hora te acostaste?</label>
          <input type="time" id="f_sleep_bedtime" class="time-input" value="${wizardData.sleep_bedtime || '23:00'}">
        </div>
        <div class="field-group">
          <label class="field-label">¿A qué hora te levantaste?</label>
          <input type="time" id="f_sleep_wake" class="time-input" value="${wizardData.sleep_wake || '07:00'}">
        </div>
        <div class="field-group">
          <label class="field-label">¿Cuántas horas dormiste en total?</label>
          ${renderSlider('sleep_hours', wizardData.sleep_hours ?? 7, {
            min:2, max:12, step:0.5,
            formatter: v => `${v} horas`,
            leftLabel:'2 horas', rightLabel:'12 horas', scheme:'sleep'
          })}
        </div>
        <div class="field-group">
          <label class="field-label">¿Cuánto tardaste en dormirte?</label>
          ${renderChips('sleep_latency', ['< 15 min','15–30 min','30–60 min','> 1 hora'], false, wizardData.sleep_latency ? [wizardData.sleep_latency] : [])}
        </div>
        <div class="field-group">
          <label class="field-label">¿Te despertaste durante la noche?</label>
          ${renderChips('sleep_awakenings', ['No me desperté','1 vez','2–3 veces','Más de 3 veces'], false, wizardData.sleep_awakenings ? [wizardData.sleep_awakenings] : [])}
        </div>
        <div class="field-group">
          <label class="field-label">¿Cómo valorarías la calidad general del sueño?</label>
          ${renderSlider('sleep_quality', wizardData.sleep_quality ?? 6, {
            max:10, leftLabel:'Pésimo', rightLabel:'Perfecto', scheme:'positive'
          })}
        </div>
      `;
    },
    collect() {
      wizardData.sleep_bedtime = document.getElementById('f_sleep_bedtime').value;
      wizardData.sleep_wake = document.getElementById('f_sleep_wake').value;
      wizardData.sleep_hours = getSliderVal('sleep_hours');
      wizardData.sleep_latency = getChipVals('sleep_latency')[0] || null;
      wizardData.sleep_awakenings = getChipVals('sleep_awakenings')[0] || null;
      wizardData.sleep_quality = getSliderVal('sleep_quality');
      syncWizardDataToWindow();
    }
  },
  {
    id: 'estres',
    icon: '🌊',
    title: 'Estrés',
    subtitle: 'El estrés es el trigger más reportado. También el "efecto rebote" (la migraña aparece cuando el estrés se libera) está documentado clínicamente.',
    render() {
      return `
        <div class="field-group">
          <label class="field-label">¿Cuál fue tu nivel de estrés ayer?</label>
          ${renderSlider('stress_yesterday', wizardData.stress_yesterday ?? 4, {
            max:10, leftLabel:'Zen 🧘', rightLabel:'Al límite 🔥', scheme:'warn'
          })}
        </div>
        <div class="field-group">
          <label class="field-label">¿Y hoy, antes del episodio?</label>
          ${renderSlider('stress_today', wizardData.stress_today ?? 4, {
            max:10, leftLabel:'Zen 🧘', rightLabel:'Al límite 🔥', scheme:'warn'
          })}
        </div>
        <div class="field-group">
          <label class="field-label">¿Hubo un periodo de mucho estrés que se liberó ayer o anteayer?</label>
          <p class="field-sublabel">Ej: terminaste un proyecto difícil, pasó algo que venías sosteniendo... Las migrañas del fin de semana entran acá.</p>
          ${renderToggle('stress_letdown', wizardData.stress_letdown || false)}
        </div>
        <div class="field-group">
          <label class="field-label">¿A qué se debió el estrés?</label>
          ${renderChips('stress_type', ['Trabajo','Familia','Económico','Social','Salud','Sin causa clara','Múltiples causas'], true, wizardData.stress_type || [])}
        </div>
      `;
    },
    collect() {
      wizardData.stress_yesterday = getSliderVal('stress_yesterday');
      wizardData.stress_today = getSliderVal('stress_today');
      wizardData.stress_letdown = document.getElementById('toggle_stress_letdown').checked;
      wizardData.stress_type = getChipVals('stress_type');
      syncWizardDataToWindow();
    }
  },
  {
    id: 'alimentacion',
    icon: '🥗',
    title: 'Alimentación e hidratación',
    subtitle: 'Lo que comiste y bebiste en las últimas 24–48 horas (no solo hoy).',
    render() {
      return `
        <div class="field-group">
          <label class="field-label">Hidratación de ayer</label>
          <p class="field-sublabel">¿Cuánta agua / líquidos tomaste ayer en total?</p>
          ${renderSlider('hydration', wizardData.hydration ?? 5, {
            max:10, leftLabel:'Casi nada', rightLabel:'2 litros +', scheme:'positive'
          })}
        </div>
        <div class="field-group">
          <label class="field-label">¿Saltaste alguna comida ayer?</label>
          ${renderToggle('meals_skipped', wizardData.meals_skipped || false)}
          <div id="fasting-detail" style="margin-top:12px;display:${wizardData.meals_skipped?'block':'none'}">
            <label class="field-label text-sm">¿Cuántas horas aproximadas de ayuno?</label>
            ${renderSlider('fasting_hours', wizardData.fasting_hours ?? 8, {
              min:3, max:24, formatter: v=>`${v}h de ayuno`,
              leftLabel:'3 horas', rightLabel:'24 horas', scheme:'warn'
            })}
          </div>
        </div>
        <div class="field-group">
          <label class="field-label">¿Consumiste alguno de estos alimentos en las últimas 48 horas?</label>
          <p class="field-sublabel">Importante: los antojos que tuviste <em>antes</em> del dolor son síntomas del pródromo, no causas.</p>
          ${renderChips('foods_consumed', FOOD_OPTIONS, true, wizardData.foods_consumed || [])}
        </div>
        <div class="field-group">
          <label class="field-label">Calidad general de la alimentación ayer</label>
          ${renderSlider('diet_quality', wizardData.diet_quality ?? 6, {
            max:10, leftLabel:'Muy mala', rightLabel:'Excelente', scheme:'positive'
          })}
        </div>
        <div class="field-group">
          <label class="field-label">¿Cuántas tazas de café o té tomaste ayer?</label>
          <p class="field-sublabel">Café, té, energizante, gaseosa con cafeína.</p>
          ${renderSlider('caffeine_cups', wizardData.caffeine_cups ?? 1, {
            min:0, max:8, step:1, formatter: v => v===0?'Ninguna':`${v} ${v===1?'taza':'tazas'}`,
            leftLabel:'Ninguna', rightLabel:'8+', scheme:'neutral'
          })}
        </div>
        <div class="field-group">
          <label class="field-label">¿Tomaste mate ayer?</label>
          <p class="field-sublabel">Contá cuántas rondas o porrones aproximadamente.</p>
          ${renderSlider('mate_rounds', wizardData.mate_rounds ?? 0, {
            min:0, max:5, step:1,
            formatter: v => v===0?'No tomé':`${v} ${v===1?'porrón':'porrones'}`,
            leftLabel:'No tomé', rightLabel:'5+', scheme:'neutral'
          })}
        </div>
        <div class="field-group">
          <label class="field-label">¿Tomaste menos cafeína/mate de lo habitual?</label>
          <p class="field-sublabel">La abstinencia de cafeína es un trigger claro y documentado.</p>
          ${renderToggle('caffeine_withdrawal', wizardData.caffeine_withdrawal || false)}
        </div>
      `;
    },
    collect() {
      wizardData.hydration = getSliderVal('hydration');
      wizardData.meals_skipped = document.getElementById('toggle_meals_skipped').checked;
      wizardData.fasting_hours = getSliderVal('fasting_hours');
      wizardData.foods_consumed = getChipVals('foods_consumed');
      wizardData.diet_quality = getSliderVal('diet_quality');
      wizardData.caffeine_cups = getSliderVal('caffeine_cups');
      wizardData.mate_rounds = getSliderVal('mate_rounds');
      wizardData.caffeine_withdrawal = document.getElementById('toggle_caffeine_withdrawal').checked;
      syncWizardDataToWindow();
    }
  },
  {
    id: 'entorno',
    icon: '☁️',
    title: 'Entorno y clima',
    subtitle: 'Los cambios de presión barométrica y la luz intensa son triggers ambientales probados.',
    render() {
      return `
        <div class="field-group">
          <label class="field-label">¿Cómo está el clima hoy?</label>
          ${renderChips('weather', WEATHER_OPTIONS, false, wizardData.weather ? [wizardData.weather] : [])}
        </div>
        <div class="field-group">
          <label class="field-label">¿Sentís que el clima influye hoy?</label>
          ${renderToggle('weather_factor', wizardData.weather_factor || false)}
        </div>
        <div class="field-group">
          <label class="field-label">Horas de pantalla (celular + compu) ayer</label>
          ${renderSlider('screen_time', wizardData.screen_time ?? 6, {
            min:0, max:16, step:1, formatter: v=>`${v}h`,
            leftLabel:'0', rightLabel:'16h', scheme:'warn'
          })}
        </div>
        <div class="field-group">
          <label class="field-label">¿Estuviste expuesta a luz solar intensa sin lentes?</label>
          ${renderToggle('bright_light', wizardData.bright_light || false)}
        </div>
        <div class="field-group">
          <label class="field-label">¿Hubo olores fuertes? (perfume, químicos, humo, nafta)</label>
          ${renderToggle('strong_odors', wizardData.strong_odors || false)}
        </div>
        <div class="field-group">
          <label class="field-label">¿Mucho ruido alrededor?</label>
          ${renderToggle('loud_noise', wizardData.loud_noise || false)}
        </div>
      `;
    },
    collect() {
      const w = getChipVals('weather');
      wizardData.weather = w[0] || null;
      wizardData.weather_factor = document.getElementById('toggle_weather_factor').checked;
      wizardData.screen_time = getSliderVal('screen_time');
      wizardData.bright_light = document.getElementById('toggle_bright_light').checked;
      wizardData.strong_odors = document.getElementById('toggle_strong_odors').checked;
      wizardData.loud_noise = document.getElementById('toggle_loud_noise').checked;
      syncWizardDataToWindow();
    }
  },
  {
    id: 'ejercicio',
    icon: '🏃',
    title: 'Actividad física',
    subtitle: 'El ejercicio moderado es preventivo; el muy intenso puede disparar episodios.',
    render() {
      return `
        <div class="field-group">
          <label class="field-label">¿Hiciste ejercicio ayer o hoy antes del episodio?</label>
          ${renderToggle('exercise_done', wizardData.exercise_done || false)}
        </div>
        <div id="exercise-detail" style="display:${wizardData.exercise_done?'block':'none'}">
          <div class="field-group">
            <label class="field-label">¿Qué tipo de ejercicio?</label>
            ${renderChips('exercise_type', ['Caminata suave','Yoga / stretching','Pilates','Cardio moderado','Entrenamiento de fuerza','Cardio intenso / HIIT','Deporte'], false, wizardData.exercise_type ? [wizardData.exercise_type] : [])}
          </div>
          <div class="field-group">
            <label class="field-label">¿Qué tan intenso fue?</label>
            ${renderSlider('exercise_intensity', wizardData.exercise_intensity ?? 4, {
              max:10, leftLabel:'Muy suave', rightLabel:'Agotadora', scheme:'warn'
            })}
          </div>
        </div>
      `;
    },
    collect() {
      wizardData.exercise_done = document.getElementById('toggle_exercise_done').checked;
      const et = getChipVals('exercise_type');
      wizardData.exercise_type = et[0] || null;
      wizardData.exercise_intensity = getSliderVal('exercise_intensity');
      syncWizardDataToWindow();
    }
  },
  {
    id: 'medicacion',
    icon: '💊',
    title: 'Medicación',
    subtitle: '¿Ya tomaste algo? Registrá cada medicamento, la hora y cómo te afectó.',
    render() {
      const meds = wizardData.first_wave_meds || [];
      return `
        <div id="meds-list">
          ${meds.length === 0 ? '<p class="text-muted text-sm" style="margin-bottom:12px">Todavía no registraste medicación para esta ola.</p>' : meds.map((m,i) => `
            <div class="med-row">
              <div class="med-row-num">${i+1}</div>
              <div class="med-row-content">
                <strong>${m.name}${m.dose ? ` (${m.dose})` : ''}</strong> — ${m.time || ''}
                ${m.efficacy !== null ? `<br><span>Alivio: <span style="color:${window.intensityColor ? window.intensityColor(10-m.efficacy) : ''}">${m.efficacy}/10</span></span>` : ''}
              </div>
              <button onclick="removeMedFromWizard(${i})" style="background:none;border:none;color:var(--text3);font-size:18px;cursor:pointer;padding:4px">×</button>
            </div>
          `).join('')}
        </div>
        <div class="divider"></div>
        <p class="field-label">Agregar medicamento</p>
        <div class="field-group mt-2">
          <label class="field-label text-sm">¿Qué tomaste?</label>
          ${renderChips('wiz_med_name', MED_OPTIONS, false, [])}
        </div>
        <div class="field-group">
          <label class="field-label text-sm">¿A qué hora?</label>
          <input type="time" id="f_med_time" class="time-input" value="${nowTimeStr()}">
        </div>
        <div class="field-group">
          <label class="field-label text-sm">Dosis (opcional)</label>
          <input type="text" id="f_med_dose" class="num-input" placeholder="ej: 400mg, 1 comprimido...">
        </div>
        <div class="field-group">
          <label class="field-label text-sm">¿Cuánto alivio te dio? (dejalo en 0 si aún no sabés)</label>
          ${renderSlider('wiz_med_efficacy', 0, {
            max:10, leftLabel:'Sin alivio', rightLabel:'Alivio total', scheme:'positive'
          })}
        </div>
        <button class="btn btn-secondary btn-sm mt-2" onclick="addMedToWizard()">+ Agregar este medicamento</button>
      `;
    },
    collect() {
      // meds already in wizardData.first_wave_meds via addMedToWizard()
    }
  },
  {
    id: 'notas',
    icon: '📝',
    title: 'Notas finales',
    subtitle: 'Cualquier cosa que no hayamos cubierto y que sientas importante.',
    render() {
      return `
        <div class="field-group">
          <label class="field-label">¿Algo más que quieras registrar?</label>
          <p class="field-sublabel">Cómo te sentiste emocionalmente, eventos del día, sensaciones raras... todo suma.</p>
          <textarea id="f_notes" class="textarea" placeholder="Escribí lo que quieras...">${wizardData.notes || ''}</textarea>
        </div>
        <div class="card" style="background:rgba(16,185,129,.08);border-color:rgba(16,185,129,.25)">
          <p class="text-sm" style="color:var(--green2);line-height:1.6">
            ✅ Listo para guardar. Una vez guardado, el episodio quedará <strong>activo</strong> — podés volver a él durante el día para agregar más medicación, registrar si volvió el dolor, o cerrarlo cuando te mejores.
          </p>
        </div>
      `;
    },
    collect() {
      wizardData.notes = document.getElementById('f_notes')?.value || '';
      syncWizardDataToWindow();
    }
  }
];

export function startWizard() {
  editingEpisodeId = null;
  wizardData = { first_wave_meds: [] };
  wizardStep = 0;
  syncWizardDataToWindow();
  window.navigate('wizard');
  renderWizardStep();
}

export function editEpisode(id) {
  const ep = DB.getEpisodes().find(e => e.id === id);
  if (!ep) return;
  editingEpisodeId = id;
  wizardData = { ...ep, first_wave_meds: ep.waves?.[0]?.medications || [] };
  wizardStep = 0;
  syncWizardDataToWindow();
  window.navigate('wizard');
  renderWizardStep();
}

export function renderWizardStep() {
  const step = WIZARD_STEPS[wizardStep];
  const total = WIZARD_STEPS.length;
  const pct = ((wizardStep) / total * 100).toFixed(0);
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="view active" id="view-wizard">
      <div class="wizard-top">
        ${editingEpisodeId ? `<div style="background:rgba(245,158,11,.15);border-bottom:1px solid rgba(245,158,11,.3);padding:6px 16px;font-size:12px;color:var(--amber);font-weight:600">✏️ Editando episodio del ${formatDate(wizardData.episode_date||todayStr())}</div>` : ''}
        <div class="wizard-progress-bar"><div class="wizard-progress-fill" style="width:${pct}%"></div></div>
        <div class="wizard-step-indicator">
          <span class="wizard-step-text">Paso ${wizardStep+1} de ${total}</span>
          <span class="wizard-step-emoji">${step.icon}</span>
        </div>
      </div>
      <div class="wizard-body">
        <h2 class="wizard-step-title">${step.title}</h2>
        <p class="wizard-step-subtitle">${step.subtitle}</p>
        ${step.render()}
      </div>
      <div class="wizard-nav">
        ${editingEpisodeId && wizardStep < total-1 ? `<button class="btn btn-secondary btn-save-now" onclick="saveEditNow()">💾 Guardar cambios y salir</button>` : ''}
        <div class="wizard-nav-row">
          <button class="btn btn-secondary btn-back" onclick="${wizardStep > 0 ? 'wizardBack()' : `navigate(editingEpisodeId ? 'history' : 'home')`}">←</button>
          <button class="btn btn-primary btn-next" onclick="wizardNext()">
            ${wizardStep === total-1 ? (editingEpisodeId ? '💾 Guardar cambios' : '💾 Guardar episodio') : 'Continuar →'}
          </button>
        </div>
      </div>
    </div>
  `;
  // init slider fills
  setTimeout(() => {
    document.querySelectorAll('.range-input').forEach(input => {
      input.dispatchEvent(new Event('input'));
    });
  }, 50);
}

export function wizardNext() {
  WIZARD_STEPS[wizardStep].collect();
  if (wizardStep === WIZARD_STEPS.length - 1) {
    saveWizardEpisode();
  } else {
    wizardStep++;
    renderWizardStep();
    document.getElementById('app').scrollTop = 0;
  }
}

export function wizardBack() {
  WIZARD_STEPS[wizardStep].collect();
  wizardStep--;
  renderWizardStep();
  document.getElementById('app').scrollTop = 0;
}

export function addMedToWizard() {
  const nameVals = getChipVals('wiz_med_name');
  const name = nameVals[0] || 'Medicamento';
  const time = document.getElementById('f_med_time')?.value || nowTimeStr();
  const dose = document.getElementById('f_med_dose')?.value || '';
  const efficacy = getSliderVal('wiz_med_efficacy');
  if (!wizardData.first_wave_meds) wizardData.first_wave_meds = [];
  wizardData.first_wave_meds.push({ name, time, dose, efficacy });
  syncWizardDataToWindow();
  // Re-render just the med step
  const body = document.querySelector('.wizard-body');
  if (body) {
    body.innerHTML = `<h2 class="wizard-step-title">${WIZARD_STEPS[wizardStep].title}</h2>
      <p class="wizard-step-subtitle">${WIZARD_STEPS[wizardStep].subtitle}</p>
      ${WIZARD_STEPS[wizardStep].render()}`;
    setTimeout(() => document.querySelectorAll('.range-input').forEach(i => i.dispatchEvent(new Event('input'))), 50);
  }
}

export function removeMedFromWizard(idx) {
  wizardData.first_wave_meds.splice(idx, 1);
  syncWizardDataToWindow();
  const body = document.querySelector('.wizard-body');
  if (body) {
    body.innerHTML = `<h2 class="wizard-step-title">${WIZARD_STEPS[wizardStep].title}</h2>
      <p class="wizard-step-subtitle">${WIZARD_STEPS[wizardStep].subtitle}</p>
      ${WIZARD_STEPS[wizardStep].render()}`;
    setTimeout(() => document.querySelectorAll('.range-input').forEach(i => i.dispatchEvent(new Event('input'))), 50);
  }
}

export function saveEditNow() {
  WIZARD_STEPS[wizardStep].collect();
  const existing = DB.getEpisodes().find(e => e.id === editingEpisodeId);
  if (existing) {
    const meds = wizardData.first_wave_meds || [];
    const updated = { ...existing, ...wizardData };
    delete updated.first_wave_meds;
    if (updated.waves?.length > 0) {
      updated.waves[0].medications = meds;
      updated.waves[0].peak_intensity = updated.current_intensity || existing.waves[0].peak_intensity;
    }
    DB.saveEpisode(updated);
  }
  editingEpisodeId = null;
  window.navigate('history');
}

export function saveWizardEpisode() {
  if (editingEpisodeId) {
    const existing = DB.getEpisodes().find(e => e.id === editingEpisodeId);
    if (existing) {
      const meds = wizardData.first_wave_meds || [];
      const updated = { ...existing, ...wizardData };
      delete updated.first_wave_meds;
      if (updated.waves?.length > 0) {
        updated.waves[0].medications = meds;
        updated.waves[0].peak_intensity = updated.current_intensity || existing.waves[0].peak_intensity;
      }
      DB.saveEpisode(updated);
    }
    editingEpisodeId = null;
    window.navigate('history');
    return;
  }
  const epDate = wizardData.episode_date || todayStr();
  const isPastEpisode = epDate < todayStr();
  const ep = {
    id: uid(),
    date: epDate,
    created_at: new Date().toISOString(),
    status: isPastEpisode ? 'resolved' : 'active',
    ...wizardData,
    waves: [{
      id: 1,
      wave_start: wizardData.started_at || nowTimeStr(),
      wave_end: null,
      peak_intensity: wizardData.current_intensity || 5,
      resolved: false,
      resolution_type: null,
      medications: wizardData.first_wave_meds || []
    }]
  };
  delete ep.first_wave_meds;
  DB.saveEpisode(ep);
  window.navigate('home');
}
