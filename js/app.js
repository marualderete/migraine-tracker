import { navigate, setActiveNav } from './router.js';
import { renderHome } from './views/home.js';
import { startWizard, editEpisode, renderWizardStep, wizardNext, wizardBack, addMedToWizard, removeMedFromWizard, saveEditNow } from './wizard.js';
import { onChipClick, onToggleChange, updateSlider } from './components.js';
import { selectEpisodeDate } from './datepicker.js';
import { openAddMedModal, saveMedToActive, openCloseWaveModal, closeCurrentWave, openNewWaveModal, addNewWave } from './episode.js';
import { showEpisodeDetail, deleteEpisode } from './views/history.js';
import { importData, clearAllData } from './views/settings.js';
import { openModal, closeModal } from './modal.js';
import { intensityColor } from './utils.js';
import { DB } from './db.js';

// Exponer en window todo lo que los onclick en HTML strings necesitan
Object.assign(window, {
  navigate, setActiveNav, renderHome,
  startWizard, editEpisode, renderWizardStep,
  wizardNext, wizardBack, addMedToWizard, removeMedFromWizard, saveEditNow,
  onChipClick, onToggleChange, updateSlider, selectEpisodeDate,
  openAddMedModal, saveMedToActive, openCloseWaveModal, closeCurrentWave, openNewWaveModal, addNewWave,
  showEpisodeDetail, deleteEpisode,
  importData, clearAllData,
  openModal, closeModal,
  intensityColor,
  DB,
});

// Init
document.addEventListener('DOMContentLoaded', () => {
  navigate('home');
});

// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
