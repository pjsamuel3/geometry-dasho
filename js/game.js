/**
 * game.js
 * Main game loop and state machine for Mummy's Run.
 * Orchestrates Three.js rendering, custom physics, and level loading.
 */

(function () {
  'use strict';

  // ── Constants ──────────────────────────────────────────────────────────
  const JUMP_FORCE    =  11;     // initial upward velocity on jump
  const FLAP_FORCE    =   7.5;   // upward velocity added on flap
  const MAX_FLY_Y     =  13;     // max altitude during flying
  const LIVES_START   =   3;
  const PLAYER_START_X = -4;
  const PLAYER_START_Y =  2;
  const PORTAL_RADIUS =  1.5;

  // ── Three.js Scene Setup ───────────────────────────────────────────────
  const canvas   = document.getElementById('game-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene  = new THREE.Scene();
  scene.fog    = new THREE.FogExp2(0x0a0a1a, 0.022);

  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 600);

  // Lighting
  const ambLight = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight.position.set(10, 30, 20);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(1024, 1024);
  dirLight.shadow.camera.left  = -80;
  dirLight.shadow.camera.right =  80;
  dirLight.shadow.camera.top   =  40;
  dirLight.shadow.camera.bottom = -20;
  scene.add(dirLight);

  let skyMesh = null;

  // ── Game State ─────────────────────────────────────────────────────────
  let currentLevel  = 0;
  let lives         = LIVES_START;
  let gameState     = 'MENU';  // MENU | PLAYING | LEVEL_COMPLETE | GAME_OVER | WIN
  let isFlying      = false;
  let flyTimer      = 0;
  let flyDuration   = 0;
  let jumpCooldown  = 0;
  let deathCooldown = 0;
  let playerBody    = null;

  // Scene objects (cleared on level load)
  let platformMeshes = [];
  let spikeMeshes    = [];
  let portalMeshes   = [];
  let finishMesh     = null;
  let mummyMesh      = null;

  // ── Resize Handling ────────────────────────────────────────────────────
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  // ── UI Wiring ──────────────────────────────────────────────────────────
  UI._onStart = () => startGame();
  UI._onNext  = () => { currentLevel++; loadLevel(); };
  UI._onRetry = () => loadLevel();
  UI._onMenu  = () => { UI.showScreen('menu'); gameState = 'MENU'; };

  UI.showScreen('menu');

  // ── Helpers ────────────────────────────────────────────────────────────

  function clearLevel() {
    [...platformMeshes, ...spikeMeshes, ...portalMeshes].forEach(m => scene.remove(m));
    if (finishMesh)  scene.remove(finishMesh);
    if (mummyMesh)   scene.remove(mummyMesh);
    if (skyMesh)     scene.remove(skyMesh);

    platformMeshes = [];
    spikeMeshes    = [];
    portalMeshes   = [];
    finishMesh     = null;
    mummyMesh      = null;
    playerBody     = null;

    Physics.reset();
  }

  function makeMaterial(color) {
    return new THREE.MeshLambertMaterial({ color });
  }

  function addPlatform(lvl, { x, y, w, h }) {
    // Three.js mesh
    const geo  = new THREE.BoxGeometry(w, h, 2.4);
    const mat  = makeMaterial(lvl.platformColor);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y - h / 2, 0);
    mesh.receiveShadow = true;
    mesh.castShadow    = true;

    // Dark top edge (Minecraft style)
    const edgeGeo = new THREE.BoxGeometry(w + 0.02, 0.08, 2.42);
    const edgeMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
    const edge    = new THREE.Mesh(edgeGeo, edgeMat);
    edge.position.y = h / 2 - 0.001;
    mesh.add(edge);

    scene.add(mesh);
    platformMeshes.push(mesh);

    // Physics static body: centred at (x, y - h/2), half-extents (w/2, h/2)
    Physics.addStatic({ x, y: y - h / 2, hw: w / 2, hh: h / 2 });
  }

  function addSpike(lvl, { x, y }) {
    const group = new THREE.Group();

    // Base slab
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.15, 0.55),
      makeMaterial(0x3a1a1a)
    );
    group.add(base);

    // Three stacked segments tapering upward (Minecraft blockart spike)
    const colours = [0x5a1a1a, 0x7a2020, 0x9a2020];
    const widths   = [0.38, 0.26, 0.14];
    const heights  = [0.36, 0.30, 0.24];
    let yOff = 0.075;
    for (let i = 0; i < 3; i++) {
      const seg = new THREE.Mesh(
        new THREE.BoxGeometry(widths[i], heights[i], widths[i]),
        makeMaterial(colours[i])
      );
      yOff += heights[i] / 2;
      seg.position.y = yOff;
      yOff += heights[i] / 2;
      group.add(seg);
    }

    group.position.set(x, y, 0);
    group.castShadow = true;
    scene.add(group);

    // Store tip position for AABB collision
    group.userData.tipX  = x;
    group.userData.baseY = y;           // platform surface level (spike sits on top)
    group.userData.tipY  = y + 0.925;   // approximate tip height
    group.userData.halfW = 0.25;        // half-width of collision box
    spikeMeshes.push(group);
  }

  function addPortal(lvl, { x, y, flyDuration: fd }) {
    const group = new THREE.Group();

    const ringMat = new THREE.MeshLambertMaterial({
      color: 0x00c8ff,
      emissive: 0x006688,
    });

    // Four sides of the portal frame (square ring)
    [
      { w: 2.6, h: 0.3, d: 0.3, px: 0,    py:  1.3 },
      { w: 2.6, h: 0.3, d: 0.3, px: 0,    py: -1.3 },
      { w: 0.3, h: 2.3, d: 0.3, px: -1.3, py:  0   },
      { w: 0.3, h: 2.3, d: 0.3, px:  1.3, py:  0   },
    ].forEach(({ w, h, d, px, py }) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), ringMat.clone());
      m.position.set(px, py, 0);
      group.add(m);
    });

    // Inner glow plane
    const glowMat = new THREE.MeshLambertMaterial({
      color: 0x00e8ff, emissive: 0x004466,
      transparent: true, opacity: 0.35,
    });
    const glow = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.3, 0.05), glowMat);
    group.add(glow);
    group.userData.glowPlane   = glow;
    group.userData.flyDuration = fd;
    group.userData.activated   = false;
    group.userData.cx          = x;
    group.userData.cy          = y + 1.3;

    group.position.set(x, y + 1.3, 0);
    scene.add(group);
    portalMeshes.push(group);
  }

  function addFinish(lvl, x, y) {
    const group = new THREE.Group();

    const pole = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 4.5, 0.18),
      makeMaterial(0xffdd44)
    );
    pole.position.y = 2.25;
    group.add(pole);

    const flag = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.85, 0.14),
      new THREE.MeshLambertMaterial({ color: 0xff4444, emissive: 0x661111 })
    );
    flag.position.set(0.72, 4.1, 0);
    group.add(flag);

    group.position.set(x, y, 0);
    group.castShadow = true;
    scene.add(group);
    finishMesh = group;
    finishMesh.userData.x = x;
    finishMesh.userData.flag = flag;
  }

  function buildSky(lvl) {
    const geo       = new THREE.PlaneGeometry(1200, 300, 1, 10);
    const colors    = [];
    const posArr    = geo.attributes.position;
    const topCol    = new THREE.Color(lvl.skyTop);
    const bottomCol = new THREE.Color(lvl.skyBottom);
    for (let i = 0; i < posArr.count; i++) {
      const t = (posArr.getY(i) + 150) / 300;
      const c = bottomCol.clone().lerp(topCol, t);
      colors.push(c.r, c.g, c.b);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
    skyMesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true }));
    skyMesh.position.set(300, 10, -40);
    scene.add(skyMesh);
  }

  // ── Level Loading ──────────────────────────────────────────────────────

  function loadLevel() {
    clearLevel();

    const lvl     = LEVELS[currentLevel];
    gameState     = 'PLAYING';
    isFlying      = false;
    flyTimer      = 0;
    deathCooldown = 0;
    jumpCooldown  = 0;

    buildSky(lvl);
    lvl.platforms.forEach(p => addPlatform(lvl, p));
    lvl.spikes.forEach(s => addSpike(lvl, s));
    lvl.portals.forEach(p => addPortal(lvl, p));
    addFinish(lvl, lvl.finishX, lvl.finishY);

    // Player physics body
    playerBody = Physics.addDynamic(
      new Physics.Body({ x: PLAYER_START_X, y: PLAYER_START_Y, hw: 0.38, hh: 0.85 })
    );

    // Mummy mesh
    mummyMesh = Player.build();
    mummyMesh.castShadow = true;
    scene.add(mummyMesh);

    UI.setLives(lives);
    UI.setMode(false);
    UI.setLevel(currentLevel + 1, lvl.name);
    UI.showScreen(null);
    Controls.setFlyMode(false);
    Physics.setFlying(false);
  }

  // ── Hazard Collision ────────────────────────────────────────────────────
  function checkHazards() {
    if (!playerBody || deathCooldown > 0) return;
    const px = playerBody.x;
    const py = playerBody.y;

    // Spikes — AABB overlap check (player must jump over, not run through)
    const pLeft   = px - playerBody.hw;
    const pRight  = px + playerBody.hw;
    const pBottom = py - playerBody.hh;
    const pTop    = py + playerBody.hh;

    for (const spike of spikeMeshes) {
      const sLeft  = spike.userData.tipX - spike.userData.halfW;
      const sRight = spike.userData.tipX + spike.userData.halfW;
      const sBot   = spike.userData.baseY;
      const sTop   = spike.userData.tipY;
      if (pRight > sLeft && pLeft < sRight && pTop > sBot && pBottom < sTop) {
        hitSpike();
        return;
      }
    }

    // Portals
    for (const portal of portalMeshes) {
      if (portal.userData.activated) continue;
      const dx = Math.abs(px - portal.userData.cx);
      const dy = Math.abs(py - portal.userData.cy);
      if (dx < PORTAL_RADIUS && dy < PORTAL_RADIUS) {
        activatePortal(portal);
      }
    }

    // Finish gate
    if (finishMesh && px >= finishMesh.userData.x - 0.5) {
      levelComplete();
    }

    // Fell off world
    if (playerBody.y < -14) hitSpike();
  }

  function hitSpike() {
    lives--;
    deathCooldown = 1.4;
    UI.setLives(lives);

    if (lives <= 0) {
      gameState = 'GAME_OVER';
      UI.showScreen('gameOver');
      return;
    }

    // Reset position
    playerBody.x  = PLAYER_START_X;
    playerBody.y  = PLAYER_START_Y;
    playerBody.vx = 0;
    playerBody.vy = 0;
    isFlying = false;
    flyTimer = 0;
    Physics.setFlying(false);
    UI.setMode(false);
    Controls.setFlyMode(false);
    UI.showBanner('💥 Ouch! Try again…');
  }

  function activatePortal(portal) {
    portal.userData.activated = true;
    isFlying    = true;
    flyTimer    = 0;
    flyDuration = portal.userData.flyDuration || 20;
    playerBody.vy = 5; // gentle upward launch
    Physics.setFlying(true);
    UI.setMode(true);
    Controls.setFlyMode(true);
    UI.showBanner('🌀 Portal! You can fly!');
  }

  function endFlight() {
    isFlying = false;
    flyTimer = 0;
    Physics.setFlying(false);
    UI.setMode(false);
    Controls.setFlyMode(false);
    UI.showBanner('⬇ Gravity returns!');
  }

  function levelComplete() {
    if (gameState === 'LEVEL_COMPLETE' || gameState === 'WIN') return;
    gameState = 'LEVEL_COMPLETE';

    const msgs = [
      'Incredible jumping! 🎉',
      'You soared through the sky! ✈',
      'Legendary mummy! All 3 levels done! 🏆',
    ];
    UI.setCompleteMsg(msgs[currentLevel] || 'Well done!');

    if (currentLevel >= LEVELS.length - 1) {
      gameState = 'WIN';
      setTimeout(() => UI.showScreen('win'), 1400);
    } else {
      setTimeout(() => UI.showScreen('complete'), 1400);
    }
  }

  // ── Start / Restart ────────────────────────────────────────────────────
  function startGame() {
    currentLevel = 0;
    lives        = LIVES_START;
    loadLevel();
  }

  // ── Main Loop ──────────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let cameraX = PLAYER_START_X;
  let cameraY = 5;

  function loop() {
    requestAnimationFrame(loop);
    const delta = Math.min(clock.getDelta(), 0.05);
    const t     = performance.now() / 1000;

    if (gameState !== 'PLAYING') {
      renderer.render(scene, camera);
      return;
    }

    const lvl = LEVELS[currentLevel];

    // ── Cooldowns ──────────────────────────────────────────────────────
    if (deathCooldown > 0) deathCooldown -= delta;
    if (jumpCooldown  > 0) jumpCooldown  -= delta;

    // ── Horizontal movement ────────────────────────────────────────────
    // Always auto-run right (Geometry Dash style — no left control)
    playerBody.vx = isFlying ? lvl.runSpeed * 0.85 : lvl.runSpeed;

    // ── Jump / Flap ────────────────────────────────────────────────────
    if (Controls.jump && jumpCooldown <= 0) {
      if (isFlying) {
        playerBody.vy = Math.min(playerBody.vy + FLAP_FORCE, 9);
        if (playerBody.y > MAX_FLY_Y) {
          playerBody.y  = MAX_FLY_Y;
          playerBody.vy = Math.min(playerBody.vy, 0);
        }
      } else if (playerBody.onGround) {
        playerBody.vy = JUMP_FORCE;
        playerBody.onGround = false;
      }
      jumpCooldown = 0.18;
    }

    // ── Physics step ───────────────────────────────────────────────────
    Physics.step(delta);

    // ── Flying timer ───────────────────────────────────────────────────
    if (isFlying) {
      flyTimer += delta;
      if (flyTimer >= flyDuration) endFlight();
    }

    // ── Sync mummy mesh → physics ──────────────────────────────────────
    if (mummyMesh && playerBody) {
      mummyMesh.position.set(playerBody.x, playerBody.y - playerBody.hh, 0);
      Player.animate(mummyMesh, delta, isFlying, playerBody.onGround, true);
    }

    // ── Portal animation ───────────────────────────────────────────────
    portalMeshes.forEach(p => {
      if (!p.userData.activated) {
        p.rotation.y = Math.sin(t * 1.2) * 0.1;
        if (p.userData.glowPlane) {
          p.userData.glowPlane.material.opacity = 0.25 + Math.sin(t * 2.8) * 0.15;
        }
      } else {
        p.scale.x = Math.max(0, p.scale.x - delta * 1.5);
        p.scale.y = Math.max(0, p.scale.y - delta * 1.5);
      }
    });

    // ── Finish flag wave ───────────────────────────────────────────────
    if (finishMesh && finishMesh.userData.flag) {
      finishMesh.userData.flag.rotation.y = Math.sin(t * 3.2) * 0.35;
    }

    // ── Hazard collision ───────────────────────────────────────────────
    checkHazards();

    // ── Camera smooth follow ───────────────────────────────────────────
    if (playerBody) {
      const targetX = playerBody.x + 4.5;
      const targetY = Math.max(playerBody.y + 3.5, 5);
      cameraX += (targetX - cameraX) * 0.07;
      cameraY += (targetY - cameraY) * 0.07;
      camera.position.set(cameraX, cameraY, lvl.cameraOffsetZ || 18);
      camera.lookAt(cameraX - 2, cameraY - 3.5, 0);
    }

    Controls.flush();
    renderer.render(scene, camera);
  }

  loop();
})();

