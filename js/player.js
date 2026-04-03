/**
 * player.js
 * Builds and manages the Minecraft blockart mummy sprite using Three.js.
 * The mummy is assembled from BoxGeometry pieces and attached to a parent
 * Object3D so position/rotation can be driven by the physics body.
 *
 * Exposes a global `Player` constructor / factory.
 */

const Player = (() => {
  // ── Palette ─────────────────────────────────────────────────────────────
  const MAT = {
    bandage:  new THREE.MeshLambertMaterial({ color: 0xd4c9a8 }),
    dark:     new THREE.MeshLambertMaterial({ color: 0x2a2218 }),
    eye:      new THREE.MeshLambertMaterial({ color: 0x00e8c8, emissive: 0x00c8aa }),
    mouth:    new THREE.MeshLambertMaterial({ color: 0x1a0f00 }),
    strip:    new THREE.MeshLambertMaterial({ color: 0xbfb08a }),
    innerEye: new THREE.MeshLambertMaterial({ color: 0x000000 }),
  };

  function box(w, h, d, mat) {
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  }

  function buildMummy() {
    const root = new THREE.Group();

    // ── Body ────────────────────────────────────────────────────────────
    const body = box(0.7, 1.0, 0.5, MAT.bandage);
    body.position.y = 0.5;
    root.add(body);

    // Bandage strips on body
    [-0.18, 0.05, 0.28].forEach(yOff => {
      const strip = box(0.72, 0.06, 0.52, MAT.strip);
      strip.position.set(0, 0.5 + yOff, 0);
      root.add(strip);
    });

    // ── Head ────────────────────────────────────────────────────────────
    const head = box(0.8, 0.75, 0.7, MAT.bandage);
    head.position.y = 1.45;
    root.add(head);

    // Head bandage wrapping lines
    [-0.18, 0.08].forEach(yOff => {
      const wrap = box(0.82, 0.055, 0.72, MAT.strip);
      wrap.position.set(0, 1.45 + yOff, 0);
      root.add(wrap);
    });

    // Eyes (glowing teal)
    [-0.2, 0.2].forEach(xOff => {
      const eyeWhite = box(0.18, 0.18, 0.08, MAT.eye);
      eyeWhite.position.set(xOff, 1.52, 0.35);
      root.add(eyeWhite);

      const pupil = box(0.09, 0.09, 0.06, MAT.innerEye);
      pupil.position.set(xOff, 1.50, 0.38);
      root.add(pupil);
    });

    // Jagged mouth (three dark rects)
    [-0.15, 0, 0.15].forEach((xOff, i) => {
      const tooth = box(0.08, i % 2 === 0 ? 0.12 : 0.08, 0.06, MAT.mouth);
      tooth.position.set(xOff, 1.22, 0.36);
      root.add(tooth);
    });

    // ── Arms ────────────────────────────────────────────────────────────
    // Left arm
    const lArm = new THREE.Group();
    const lUpper = box(0.22, 0.55, 0.22, MAT.bandage);
    lUpper.position.y = -0.26;
    lArm.add(lUpper);
    const lLower = box(0.18, 0.42, 0.18, MAT.strip);
    lLower.position.y = -0.70;
    lArm.add(lLower);
    // Dangling bandage end
    const lDangle = box(0.10, 0.2, 0.10, MAT.bandage);
    lDangle.position.set(0.04, -0.96, 0);
    lArm.add(lDangle);
    lArm.position.set(-0.47, 0.9, 0);
    root.add(lArm);

    // Right arm
    const rArm = new THREE.Group();
    const rUpper = box(0.22, 0.55, 0.22, MAT.bandage);
    rUpper.position.y = -0.26;
    rArm.add(rUpper);
    const rLower = box(0.18, 0.42, 0.18, MAT.strip);
    rLower.position.y = -0.70;
    rArm.add(rLower);
    const rDangle = box(0.10, 0.2, 0.10, MAT.bandage);
    rDangle.position.set(-0.04, -0.96, 0);
    rArm.add(rDangle);
    rArm.position.set(0.47, 0.9, 0);
    root.add(rArm);

    // ── Legs ────────────────────────────────────────────────────────────
    [-0.2, 0.2].forEach((xOff, i) => {
      const leg = new THREE.Group();
      const upper = box(0.28, 0.55, 0.28, MAT.bandage);
      upper.position.y = -0.27;
      leg.add(upper);
      const lower = box(0.22, 0.45, 0.22, MAT.strip);
      lower.position.y = -0.72;
      leg.add(lower);
      // Foot
      const foot = box(0.28, 0.14, 0.36, MAT.dark);
      foot.position.set(0, -1.02, 0.05);
      leg.add(foot);
      leg.position.set(xOff, 0, 0);
      root.add(leg);
    });

    // Store refs for animation
    root.userData.lArm = lArm;
    root.userData.rArm = rArm;

    return root;
  }

  // ── Animation ───────────────────────────────────────────────────────────
  let walkCycle = 0;
  let flyBob = 0;

  function animate(mummy, delta, isFlying, isOnGround, isMoving) {
    const lArm = mummy.userData.lArm;
    const rArm = mummy.userData.rArm;

    if (isFlying) {
      // Flap arms up and down gently
      flyBob += delta * 3;
      const flapAngle = Math.sin(flyBob) * 0.5;
      lArm.rotation.z =  flapAngle + 0.2;
      rArm.rotation.z = -flapAngle - 0.2;
      mummy.rotation.z = Math.sin(flyBob * 0.5) * 0.04;
    } else if (isMoving && isOnGround) {
      // Walk cycle: swing arms
      walkCycle += delta * 6;
      lArm.rotation.x =  Math.sin(walkCycle) * 0.5;
      rArm.rotation.x = -Math.sin(walkCycle) * 0.5;
      mummy.rotation.z = 0;
    } else {
      // Idle — reset
      lArm.rotation.x *= 0.85;
      rArm.rotation.x *= 0.85;
    }
  }

  return { build: buildMummy, animate };
})();
