/**
 * levels.js
 * Level definitions for Mummy's Run.
 * Each level is a plain object describing: platforms, spikes, portals, and
 * the finish zone. All measurements are in world units (metres).
 *
 * Coordinate system: X = right, Y = up, Z = out-of-screen (camera is pulled back).
 */

const LEVELS = [
  // ─────────────────────────────────────────────────────────────────────────
  // LEVEL 1 — Tomb Awakening
  // Tutorial: gentle pace, wide platforms, a handful of single spikes.
  // No portal — pure platforming to learn jump timing.
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'Tomb Awakening',
    subtitle: 'Learn to jump — watch the spikes!',
    skyTop: 0x1a0d33,
    skyBottom: 0x5c2a00,
    groundColor: 0x7a6040,
    platformColor: 0x8b7355,
    runSpeed: 4.2,          // units/sec horizontal auto-run
    cameraOffsetZ: 18,

    // Platforms: { x, y, w, h } — centred on (x, y), width w, height h
    platforms: [
      // Starting ground section
      { x: 0,   y: -1,  w: 20, h: 1 },
      // First gap then platform
      { x: 28,  y: -1,  w: 10, h: 1 },
      // Next platform (slight rise)
      { x: 46,  y: 0.5, w: 8,  h: 1 },
      // Long flat
      { x: 62,  y: -1,  w: 16, h: 1 },
      // Two-step rise
      { x: 84,  y: 0,   w: 6,  h: 1 },
      { x: 97,  y: 1,   w: 6,  h: 1 },
      // Long descent
      { x: 114, y: -1,  w: 20, h: 1 },
      // Final approach
      { x: 142, y: -1,  w: 18, h: 1 },
    ],

    // Spikes: { x, y } — tip of spike (base is 1 unit below)
    spikes: [
      { x: 22,  y: -0.5 },   // just before first gap
      { x: 34,  y: -0.5 },
      { x: 52,  y: 0 },
      { x: 67,  y: -0.5 },
      { x: 71,  y: -0.5 },
      { x: 90,  y: -0.5 },
      { x: 101, y: 0.5 },
      { x: 118, y: -0.5 },
      { x: 124, y: -0.5 },
    ],

    // Portals: none in level 1
    portals: [],

    // Finish gate: reach this X position to complete the level
    finishX: 156,
    finishY: -1,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LEVEL 2 — Crumbling Cliffs
  // Medium pace, narrower platforms, double-spike clusters, one portal
  // mid-level that triggers ~20 seconds of flying.
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'Crumbling Cliffs',
    subtitle: 'Find the portal — take flight!',
    skyTop: 0x0a1a3a,
    skyBottom: 0x8b3a00,
    groundColor: 0x5a4530,
    platformColor: 0x7a6248,
    runSpeed: 5.2,

    platforms: [
      { x: 0,   y: -1,  w: 14, h: 1 },
      { x: 22,  y: -1,  w: 7,  h: 1 },
      { x: 36,  y: 1,   w: 5,  h: 1 },
      { x: 48,  y: -1,  w: 8,  h: 1 },
      { x: 62,  y: 0,   w: 5,  h: 1 },
      // Portal platform
      { x: 76,  y: -1,  w: 10, h: 1 },
      // --- flying gap ---
      // Landing after fly
      { x: 130, y: 2,   w: 8,  h: 1 },
      { x: 146, y: 0,   w: 6,  h: 1 },
      { x: 158, y: -1,  w: 6,  h: 1 },
      { x: 172, y: 1,   w: 7,  h: 1 },
      { x: 186, y: -1,  w: 14, h: 1 },
    ],

    spikes: [
      { x: 16,  y: -0.5 },
      { x: 28,  y: -0.5 },
      { x: 29,  y: -0.5 },
      { x: 42,  y: 1.5  },
      { x: 53,  y: -0.5 },
      { x: 55,  y: -0.5 },
      { x: 65,  y: 0.5  },
      { x: 80,  y: -0.5 },
      // After fly — tricky spike zone
      { x: 134, y: 2.5  },
      { x: 148, y: 0.5  },
      { x: 161, y: -0.5 },
      { x: 175, y: 1.5  },
      { x: 176, y: 1.5  },
      { x: 190, y: -0.5 },
    ],

    portals: [
      { x: 82, y: 0, flyDuration: 22 },  // triggers flying for 22 seconds
    ],

    finishX: 196,
    finishY: -1,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LEVEL 3 — Sky Temple
  // Fast pace, spike field at the start, early portal, long flying section
  // with mid-air spike rows, dramatic ending.
  // ─────────────────────────────────────────────────────────────────────────
  {
    name: 'Sky Temple',
    subtitle: 'Survive the sky — reach the heavens!',
    skyTop: 0x000a20,
    skyBottom: 0x2a004a,
    groundColor: 0x2a2050,
    platformColor: 0x4a3a78,
    runSpeed: 6.4,

    platforms: [
      // Short opening — tight spike gauntlet
      { x: 0,   y: -1,  w: 10, h: 1 },
      { x: 18,  y: -1,  w: 5,  h: 1 },
      { x: 30,  y: 0,   w: 5,  h: 1 },
      // Portal platform
      { x: 44,  y: -1,  w: 10, h: 1 },
      // After long fly: final challenge platforms
      { x: 170, y: 3,   w: 6,  h: 1 },
      { x: 184, y: 1,   w: 5,  h: 1 },
      { x: 196, y: -1,  w: 16, h: 1 },
    ],

    spikes: [
      // Opening spike gauntlet
      { x: 11,  y: -0.5 },
      { x: 12,  y: -0.5 },
      { x: 13,  y: -0.5 },
      { x: 22,  y: -0.5 },
      { x: 34,  y: 0.5  },
      { x: 48,  y: -0.5 },
      // Mid-air spikes (Y values higher, encountered during flying)
      { x: 80,  y: 5    },
      { x: 81,  y: 5    },
      { x: 100, y: 3    },
      { x: 115, y: 6    },
      { x: 116, y: 6    },
      { x: 130, y: 4    },
      { x: 145, y: 7    },
      { x: 146, y: 7    },
      // Final platform spikes
      { x: 173, y: 3.5  },
      { x: 187, y: 1.5  },
      { x: 200, y: -0.5 },
      { x: 202, y: -0.5 },
    ],

    portals: [
      { x: 50, y: 0, flyDuration: 55 }, // long flying section
    ],

    finishX: 210,
    finishY: -1,
  },
];
