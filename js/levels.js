/**
 * levels.js
 * Level definitions for Mummy's Run — Geometry Dash style.
 *
 * Physics recap (for level design):
 *   runSpeed × 1 second = horizontal jump distance (gravity = 22, jumpForce = 11)
 *   Level 1: runSpeed 4.2 → jump distance ~4.2 units
 *   Level 2: runSpeed 5.2 → jump distance ~5.2 units
 *   Level 3: runSpeed 6.2 → jump distance ~6.2 units
 *
 * Platform y = TOP surface of the platform (player lands here).
 * Spikes y   = platform top surface (spike base sits on it).
 * Gap rule   : gap width must be < runSpeed to be jumpable.
 */

const LEVELS = [
  // ─────────────────────────────────────────────────────────────────────────
  // LEVEL 1 — Tomb Dash (Tutorial)
  // Single flat floor — no gaps. Learn to jump over spikes. Easy spacing.
  // Jump distance: ~4.2 units. Spikes well apart. No gaps.
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'Tomb Dash',
    subtitle: 'Tap anywhere to jump — avoid the spikes!',
    skyTop: 0x1a0d33,
    skyBottom: 0x5c2a00,
    platformColor: 0x8b7355,
    runSpeed: 4.2,
    cameraOffsetZ: 18,

    // One continuous floor. Spans x = -6 to 74 (top at y = 0).
    platforms: [
      { x: 34, y: 0, w: 80, h: 2 },
    ],

    // Spikes sit on the floor (y = 0). Player must jump over each one.
    // Spikes spaced ≥ 6 units apart so player can land and jump again.
    spikes: [
      { x: 10,  y: 0 },
      { x: 18,  y: 0 },
      { x: 26,  y: 0 },
      { x: 27,  y: 0 },  // double spike — first challenge
      { x: 36,  y: 0 },
      { x: 45,  y: 0 },
      { x: 54,  y: 0 },
      { x: 55,  y: 0 },  // double spike
      { x: 63,  y: 0 },
    ],

    portals: [],

    finishX: 70,
    finishY: 0,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LEVEL 2 — Crumbling Cliffs
  // Two short gaps (3 units wide, jumpable at 5.2 m/s). Double spikes.
  // Jump distance: ~5.2 units.
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'Crumbling Cliffs',
    subtitle: 'Jump the gaps — and the spikes!',
    skyTop: 0x0a1a3a,
    skyBottom: 0x8b3a00,
    platformColor: 0x7a6248,
    runSpeed: 5.2,

    // Platform 1: x = -6 to 42
    // Gap 1:      x = 42 to 44 (2 units — well under 5.2 jump distance)
    // Platform 2: x = 44 to 60
    // Gap 2:      x = 60 to 63 (3 units)
    // Platform 3: x = 63 to 97
    platforms: [
      { x: 18,  y: 0, w: 48, h: 2 },   // -6 to 42
      { x: 52,  y: 0, w: 16, h: 2 },   // 44 to 60  (gap 1: 42–44, 2 u)
      { x: 80,  y: 0, w: 34, h: 2 },   // 63 to 97  (gap 2: 60–63, 3 u)
    ],

    spikes: [
      { x: 6,   y: 0 },
      { x: 16,  y: 0 },
      { x: 17,  y: 0 },
      { x: 27,  y: 0 },
      { x: 36,  y: 0 },
      // platform 2 (after gap 1 at x=44)
      { x: 50,  y: 0 },
      { x: 56,  y: 0 },
      // platform 3 (after gap 2 at x=63)
      { x: 68,  y: 0 },
      { x: 69,  y: 0 },
      { x: 78,  y: 0 },
      { x: 87,  y: 0 },
      { x: 88,  y: 0 },
    ],

    portals: [],

    finishX: 94,
    finishY: 0,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LEVEL 3 — Sky Temple
  // Tight spike gauntlet on the ground, then a portal launches flying mode.
  // A few mid-air spikes during flight, then land on the final platform.
  // Jump distance: ~6.2 units.  Flying speed: 6.2 × 0.85 ≈ 5.3 m/s.
  // Flying duration 20 s → covers ~106 units.
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'Sky Temple',
    subtitle: 'Survive the sky — reach the heavens!',
    skyTop: 0x000a20,
    skyBottom: 0x2a004a,
    platformColor: 0x4a3a78,
    runSpeed: 6.2,

    // Platform 1: -3 to 44  (gap: 44–48)
    // Platform 2: 48 to 72  (portal at x=66)
    // --- flying gap: 72 to ~178 (106 units at 5.3 m/s × 20 s) ---
    // Platform 3: 172 to 212
    platforms: [
      { x: 20,  y: 0, w: 46, h: 2 },   // -3 to 43
      { x: 58,  y: 0, w: 24, h: 2 },   // 46 to 70  (gap: 43–46, 3 u)
      { x: 188, y: 0, w: 44, h: 2 },   // 166 to 210
    ],

    spikes: [
      // Opening gauntlet on platform 1
      { x: 8,   y: 0 },
      { x: 9,   y: 0 },
      { x: 18,  y: 0 },
      { x: 28,  y: 0 },
      { x: 29,  y: 0 },
      { x: 38,  y: 0 },
      // Portal platform (platform 2)
      { x: 52,  y: 0 },
      { x: 62,  y: 0 },
      // Mid-air spikes (y ≥ 5 — dodge by going low or very high)
      { x: 90,  y: 5 },
      { x: 115, y: 5 },
      { x: 140, y: 5 },
      { x: 165, y: 5 },
      // Final platform
      { x: 177, y: 0 },
      { x: 188, y: 0 },
      { x: 200, y: 0 },
      { x: 201, y: 0 },
    ],

    portals: [
      // Portal at end of platform 2; flyDuration=20 s → lands at ~172
      { x: 66, y: 0, flyDuration: 20 },
    ],

    finishX: 208,
    finishY: 0,
  },
];

