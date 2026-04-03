/**
 * ui.js
 * HUD and screen management helpers for Mummy's Run.
 */

const UI = (() => {
  const elLevel    = document.getElementById('level-display');
  const elLives    = document.getElementById('lives-display');
  const elMode     = document.getElementById('mode-display');
  const elBanner   = document.getElementById('level-banner');
  const elFlyInd   = document.getElementById('fly-indicator');

  const screens = {
    menu:     document.getElementById('screen-menu'),
    complete: document.getElementById('screen-level-complete'),
    gameOver: document.getElementById('screen-game-over'),
    win:      document.getElementById('screen-win'),
  };

  // Attach button callbacks (set by Game)
  document.getElementById('btn-start').addEventListener('click',      () => UI._onStart && UI._onStart());
  document.getElementById('btn-next-level').addEventListener('click', () => UI._onNext  && UI._onNext());
  document.getElementById('btn-retry').addEventListener('click',      () => UI._onRetry && UI._onRetry());
  document.getElementById('btn-menu').addEventListener('click',       () => UI._onMenu  && UI._onMenu());
  document.getElementById('btn-play-again').addEventListener('click', () => UI._onStart && UI._onStart());

  // Touch passthrough for buttons above
  ['btn-start','btn-next-level','btn-retry','btn-menu','btn-play-again'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('touchstart', (e) => { e.stopPropagation(); });
  });

  let bannerTimer = null;

  return {
    // Callbacks wired by Game
    _onStart: null,
    _onNext:  null,
    _onRetry: null,
    _onMenu:  null,

    showScreen(name) {
      Object.values(screens).forEach(s => s.classList.add('hidden'));
      if (name && screens[name]) screens[name].classList.remove('hidden');
    },

    setLevel(num, name) {
      elLevel.textContent = `LEVEL ${num}`;
      this.showBanner(`LEVEL ${num}\n${name}`);
    },

    setLives(n) {
      elLives.textContent = '❤️'.repeat(Math.max(0, n));
    },

    setMode(flying) {
      elMode.textContent = flying ? '✈ FLYING' : '';
      if (flying) {
        elFlyInd.classList.add('visible');
      } else {
        elFlyInd.classList.remove('visible');
      }
    },

    setCompleteMsg(msg) {
      document.getElementById('complete-msg').textContent = msg;
    },

    showBanner(text) {
      elBanner.textContent = text;
      elBanner.classList.add('show');
      clearTimeout(bannerTimer);
      bannerTimer = setTimeout(() => elBanner.classList.remove('show'), 2500);
    },
  };
})();
