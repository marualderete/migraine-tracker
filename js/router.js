import { renderHome } from './views/home.js';
import { renderHistory } from './views/history.js';
import { renderPatterns } from './views/patterns.js';
import { renderSettings } from './views/settings.js';
import { renderWizardStep } from './wizard.js';

export let currentView = 'home';

export function navigate(view) {
  currentView = view;
  const nav = document.getElementById('bottom-nav');
  nav.style.display = view === 'wizard' ? 'none' : 'flex';
  setActiveNav(view);
  if (view === 'home') renderHome();
  else if (view === 'history') renderHistory();
  else if (view === 'patterns') renderPatterns();
  else if (view === 'settings') renderSettings();
  // For wizard, renderWizardStep() is called directly from startWizard/editEpisode
  // but we still scroll
  document.getElementById('app').scrollTop = 0;
}

export function setActiveNav(view) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const el = document.getElementById(`nav-${view}`);
  if (el) el.classList.add('active');
}
