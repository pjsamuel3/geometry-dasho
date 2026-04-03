/**
 * controls.js
 * Handles touch and keyboard input for Mummy's Run.
 * Geometry Dash style: tap anywhere on screen to jump.
 * Exposes a global `Controls` object.
 */

const Controls = (() => {
  const state = {
    jump: false,      // was jump pressed this frame
    jumpHeld: false,  // is jump currently held
  };

  // ── Button element ──────────────────────────────────────────
  const btnJump = document.getElementById('btn-jump');

  function pressJump()   { state.jump = true; state.jumpHeld = true;  btnJump.classList.add('pressed'); }
  function releaseJump() { state.jumpHeld = false; btnJump.classList.remove('pressed'); }

  // Tap the jump button
  btnJump.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); pressJump(); },   { passive: false });
  btnJump.addEventListener('touchend',   (e) => { e.preventDefault(); e.stopPropagation(); releaseJump(); }, { passive: false });
  btnJump.addEventListener('touchcancel',(e) => { e.preventDefault(); e.stopPropagation(); releaseJump(); }, { passive: false });
  btnJump.addEventListener('mousedown', (e) => { e.stopPropagation(); pressJump(); });
  btnJump.addEventListener('mouseup',   releaseJump);

  // Tap anywhere else on canvas (Geometry Dash style)
  const canvas = document.getElementById('game-canvas');
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); pressJump(); },   { passive: false });
  canvas.addEventListener('touchend',   (e) => { e.preventDefault(); releaseJump(); }, { passive: false });
  canvas.addEventListener('touchcancel',(e) => { e.preventDefault(); releaseJump(); }, { passive: false });
  canvas.addEventListener('mousedown',  pressJump);
  canvas.addEventListener('mouseup',    releaseJump);

  // Keyboard events (desktop testing)
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      if (!e.repeat) pressJump();
    }
  });
  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') releaseJump();
  });

  return {
    /** Call at the END of each frame after reading jump */
    flush() { state.jump = false; },

    get jump()     { return state.jump; },
    get jumpHeld() { return state.jumpHeld; },

    /** Update button label to match current game mode */
    setFlyMode(isFlying) {
      btnJump.textContent = isFlying ? '🪶' : '🦘';
    },
  };
})();
