// Funciones puras de utilidad. Sin dependencias.

export const todayStr = () => new Date().toISOString().slice(0,10);
export const nowTimeStr = () => new Date().toTimeString().slice(0,5);
export const dateOffset = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0,10); };
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6);
export const clamp = (v,min,max) => Math.min(max,Math.max(min,v));

export function formatDate(str) {
  if (!str) return '';
  const [y,m,d] = str.split('-');
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const dt = new Date(y, m-1, d);
  return `${days[dt.getDay()]} ${d} ${months[m-1]} ${y}`;
}

export function intensityColor(v) {
  if (v < 2) return '#10b981';
  if (v < 4) return '#34d399';
  if (v < 6) return '#f59e0b';
  if (v < 8) return '#f97316';
  return '#ef4444';
}

export function intensityLabel(v) {
  if (v < 1.5) return 'Sin dolor';
  if (v < 3) return 'Leve';
  if (v < 5) return 'Moderado';
  if (v < 6.5) return 'Importante';
  if (v < 8) return 'Fuerte';
  if (v < 9.3) return 'Muy fuerte';
  return 'Insoportable';
}

export function stressLabel(v) {
  if (v < 2) return 'Zen 🧘';
  if (v < 4) return 'Tranquila';
  if (v < 6) return 'Moderado';
  if (v < 8) return 'Alto';
  return 'Al límite';
}

export function sleepQLabel(v) {
  if (v < 2) return 'Pésimo';
  if (v < 4) return 'Malo';
  if (v < 6) return 'Regular';
  if (v < 8) return 'Bueno';
  return 'Excelente';
}

export function hydrationLabel(v) {
  if (v < 2) return 'Muy poca (< 500ml)';
  if (v < 4) return 'Poca (~ 700ml)';
  if (v < 6) return 'Regular (~ 1L)';
  if (v < 8) return 'Buena (~ 1.5L)';
  return 'Excelente (2L+)';
}
