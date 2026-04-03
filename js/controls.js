/**
 * controls.js
 * Handles touch and keyboard input for Mummy's Run.
 * Exposes a global `Controls` object.
 */

const Controls = (() => {
  const state = {
    jump: false,      // was jump pressed this frame
    jumpHeld: false,  // is jump currently held
    left: false,      // is left currently held
  };

  // ── Button elements ──────────────────────────────────────────
  const btnJump = document.getElementById('btn-jump');
  const btnLeft = document.getElementById('btn-left');

  function pressJump()    { state.jump = true;  state.jumpHeld = true;  btnJump.classList.add('pressed'); }
  function releaseJump()  { state.jumpHeld = false; btnJump.classList.remove('pressed'); }
  function pressLeft()    { state.left = true;  btnLeft.classList.add('pressed'); }
  function releaseLeft()  { state.left = false; btnLeft.classList.remove('pressed'); }

  // Touch events
  btnJump.addEventListener('touchstart', (e) => { e.preventDefault(); pressJump(); },   { passive: false });
  btnJump.addEventListener('touchend',   (e) => { e.preventDefault(); releaseJump(); }, { passive: false });
  btnJump.addEventListener('touchcancel',(e) => { e.preventDefault(); releaseJump(); }, { passive: false });

  btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); pressLeft(); },   { passive: false });
  btnLeft.addEventListener('touchend',   (e) => { e.preventDefault(); releaseLeft(); }, { passive: false });
  btnLeft.addEventListener('touchcancel',(e) => { e.preventDefault(); releaseLeft(); }, { passive: false });

  // Mouse events (desktop testing)
  btnJump.addEventListener('mousedown', pressJump);
  btnJump.addEventListener('mouseup',   releaseJump);
  btnLeft.addEventListener('mousedown', pressLeft);
  btnLeft.addEventListener('mouseup',   releaseLeft);

  // Keyboard events (desktop testing)
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      if (!e.repeat) pressJump();
    }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') pressLeft();
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') releaseJump();
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') releaseLeft();
  });

  return {
    /** Call at the END of each frame after reading jump */
    flush() { state.jump = false; },

    get jump()     { return state.jump; },
    get jumpHeld() { return state.jumpHeld; },
    get left()     { return state.left; },

    /** Update button label to match current game mode */
    setFlyMode(isFlying) {
      btnJump.textContent = isFlying ? '🪶' : '🦘';
    },
  };
})();
