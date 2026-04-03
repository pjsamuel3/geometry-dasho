/**
 * physics.js
 * Lightweight 2D platformer physics for Mummy's Run.
 * Handles gravity, AABB platform collisions, impulse-based jumping and
 * flying. No external library required.
 *
 * World units: metres. Positive Y = up.
 */

const Physics = (() => {
  const GRAVITY   = -22;       // m/s²
  const FLY_GRAV  =  -5;       // reduced gravity during flying
  const MAX_FALL  = -25;       // terminal velocity (downward)
  const SKIN_W    = 0.01;      // overlap tolerance for collision

  /** A simple rigid body (axis-aligned box, 2D). */
  class Body {
    constructor({ x = 0, y = 0, hw = 0.5, hh = 0.5, mass = 1 } = {}) {
      this.x   = x;
      this.y   = y;
      this.vx  = 0;
      this.vy  = 0;
      this.hw  = hw;   // half-width
      this.hh  = hh;   // half-height
      this.mass = mass; // 0 = static
      this.onGround = false;
    }

    get left()   { return this.x - this.hw; }
    get right()  { return this.x + this.hw; }
    get bottom() { return this.y - this.hh; }
    get top()    { return this.y + this.hh; }
  }

  // Sorted list of static platforms { x, y, hw, hh }
  let staticBodies = [];
  let dynamicBodies = [];
  let flying = false;

  function reset() {
    staticBodies  = [];
    dynamicBodies = [];
    flying = false;
  }

  function addStatic({ x, y, hw, hh }) {
    staticBodies.push({ x, y, hw, hh,
      get left()   { return this.x - this.hw; },
      get right()  { return this.x + this.hw; },
      get bottom() { return this.y - this.hh; },
      get top()    { return this.y + this.hh; },
    });
  }

  function addDynamic(body) {
    dynamicBodies.push(body);
    return body;
  }

  /**
   * One-way top-only collision: only resolves when the dynamic body is
   * above the static body's midline and moving downward.
   * This prevents the player from getting wedged against platform sides.
   */
  function resolveAABB(dyn, stat) {
    const overlapX = Math.min(dyn.right, stat.right) - Math.max(dyn.left, stat.left);
    const overlapY = Math.min(dyn.top, stat.top)     - Math.max(dyn.bottom, stat.bottom);
    if (overlapX <= SKIN_W || overlapY <= SKIN_W) return null;

    // Only land on the top surface — never collide with sides or bottom.
    // dyn.y > stat.y: player centre is above the platform body's centre
    // (all platforms store their body centre at y = platformTop - halfHeight),
    // so this condition is true whenever the player arrives from above.
    if (dyn.y > stat.y && dyn.vy <= 0) {
      return { dy: overlapY, side: 'top' };
    }
    return null;
  }

  function step(dt) {
    const grav = flying ? FLY_GRAV : GRAVITY;

    for (const body of dynamicBodies) {
      if (body.mass === 0) continue;

      // Apply gravity
      body.vy += grav * dt;
      body.vy  = Math.max(body.vy, MAX_FALL);

      // Integrate
      body.x += body.vx * dt;
      body.y += body.vy * dt;

      // Reset ground flag
      body.onGround = false;

      // Collide with statics
      for (const stat of staticBodies) {
        const r = resolveAABB(body, stat);
        if (!r) continue;

        body.y -= r.dy;

        if (r.side === 'top') {
          // Landing on platform
          if (body.vy < 0) body.vy = 0;
          body.onGround = true;
        }
      }

      // Lock Z axis
      body.z = 0;
    }
  }

  return { Body, reset, addStatic, addDynamic, step,
    setFlying(f) { flying = f; } };
})();
