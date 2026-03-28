// Objeto DB con localStorage. Sin dependencias.
import { todayStr } from './utils.js';

export const DB = {
  KEY: 'migratrack_v1',
  get() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || { episodes: [] }; }
    catch { return { episodes: [] }; }
  },
  save(data) { localStorage.setItem(this.KEY, JSON.stringify(data)); },
  getEpisodes() { return this.get().episodes || []; },
  saveEpisode(ep) {
    const data = this.get();
    const idx = data.episodes.findIndex(e => e.id === ep.id);
    if (idx >= 0) data.episodes[idx] = ep;
    else data.episodes.unshift(ep);
    this.save(data);
  },
  getActiveEpisode() {
    return this.getEpisodes().find(e => e.status === 'active') || null;
  },
  exportJSON() {
    const blob = new Blob([JSON.stringify(this.get(), null, 2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `migratrack_${todayStr()}.json`;
    a.click();
  },
  importJSON(str) {
    try {
      const d = JSON.parse(str);
      if (Array.isArray(d.episodes)) { this.save(d); return true; }
    } catch {}
    return false;
  }
};
