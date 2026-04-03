# 🧟 Geometry Dasho — Mummy's Run

A mobile-friendly 3D platform game built with Three.js and a custom AABB physics engine, hosted on GitHub Pages. Navigate a Minecraft-style blocky mummy through increasingly challenging levels full of spikes, platforms, and gravity-defying portals!

---

## 🎮 Game Overview

| Detail | Info |
|---|---|
| **Genre** | 3D side-scrolling platformer |
| **Target Age** | 9–15 years |
| **Play Platform** | Mobile browser (GitHub Pages) |
| **Controls** | On-screen touch buttons |
| **Engine** | Three.js + custom physics |
| **Character** | Minecraft blockart scary mummy |

---

## 🗺️ Game Concept

**Mummy's Run** follows a restless mummy who has been awoken from his tomb and must escape through a series of treacherous ancient chambers and sky-high ruins. As he runs, he discovers magical portals that grant him the power of flight — but physics always pulls him back down!

### Core Mechanics

| Mechanic | Description |
|---|---|
| **Running** | Mummy auto-runs to the right |
| **Jumping** | Tap the JUMP button to leap over spikes and gaps |
| **Spikes** | Touch a spike = lose a life and restart the level |
| **Portals** | Walk through a portal to enter **Flying Mode** |
| **Flying Mode** | Tap FLAP to gain altitude; gravity slowly pulls you down |
| **Level End** | Reach the finish zone to unlock the next level |

---

## 🎨 Art Style

- **Character**: Blocky Minecraft-style mummy built from `BoxGeometry` meshes
  - Off-white bandage wrapping (cream/beige colours)
  - Dark hollow eyes
  - Dangling bandage strips on arms and legs
- **Environment**: Ancient temple aesthetic
  - Stone brick platforms (grey, textured with emissive highlights)
  - Spike traps (dark red/obsidian spikes)
  - Glowing teal portals (pulsing emissive ring)
  - Sky gradient background (dawn to dusk across levels)
- **Lighting**: Ambient + directional with shadows

---

## 📱 Mobile Controls

Two large on-screen buttons:

| Button | Platform Mode | Flying Mode |
|---|---|---|
| **Left button (⬅)** | *(reserved for future use)* | Slow down / brake |
| **Right button (JUMP / FLAP)** | Jump (single jump) | Flap wings (gain altitude) |

Controls are rendered as translucent touch-friendly overlays at the bottom of the screen.

---

## 🏗️ Technical Architecture

```
geometry-dasho/
├── index.html          ← Single-page entry point (GitHub Pages)
├── js/
│   ├── game.js         ← Main game loop, state machine
│   ├── player.js       ← Mummy sprite + animation
│   ├── physics.js      ← Cannon.js world setup + helpers
│   ├── levels.js       ← Level definitions (platforms, spikes, portals)
│   ├── controls.js     ← Touch + keyboard input
│   └── ui.js           ← HUD, life counter, level banner
├── assets/
│   └── (future: audio, textures)
└── README.md
```

### Libraries (CDN, no build step required)

| Library | Purpose | Version |
|---|---|---|
| [Three.js](https://threejs.org/) | 3D rendering | r158 |
| Custom physics (`js/physics.js`) | Gravity, AABB platform collision, flying mode | built-in |

---

## 🏆 Level Design

### Overview (MVP: Levels 1–3, full game: up to 20)

| Level | Name | Theme | Duration | Key Challenge |
|---|---|---|---|---|
| 1 | **Tomb Awakening** | Desert ruins | ~2 min | Learn jump timing over spikes |
| 2 | **Crumbling Cliffs** | Canyon ledges | ~2 min | Tight jump sequences + first portal flying |
| 3 | **Sky Temple** | Cloud ruins | ~2 min | Long flying section + dense spike fields |
| 4–10 | *(future)* | Underground caves | ~2 min ea. | Moving platforms, multi-jump |
| 11–16 | *(future)* | Volcano | ~2 min ea. | Falling platforms, lava pits |
| 17–20 | *(future)* | Final Pyramid | ~2 min ea. | All mechanics combined, boss ending |

---

### Level 1 — Tomb Awakening

**Objective**: Introduce basic jumping over spikes.

```
[START]──platform──[spike]──platform──[spike][spike]──long platform──[PORTAL/END]
```

- Auto-run speed: slow (comfortable pace)
- 4–6 single spikes spread out
- No portal (pure platforming introduction)
- Wide platforms, forgiving gaps
- Teaches: tap to jump timing

---

### Level 2 — Crumbling Cliffs

**Objective**: Tighter jumps + introduce the flying portal.

```
[START]──gap──platform──[spike]──gap──platform──[spike][spike]──gap──[PORTAL]~~flying~~[spike row]──[END]
```

- Auto-run speed: medium
- Narrower platforms, longer gaps
- Double-spike clusters
- One portal mid-level → ~20 seconds of flying
- Teaches: portal transition, flap timing

---

### Level 3 — Sky Temple

**Objective**: Extended flying + dense spike challenge.

```
[START]──spike field──platform──[PORTAL]────long flying section with aerial spikes────[END GATE]
```

- Auto-run speed: fast
- Spike field right at the start (high tension)
- Portal early in the level
- Flying section lasts ~60 seconds with mid-air spike rows
- Teaches: sustained altitude control

---

## 🔁 Game States

```
MENU → LEVEL_INTRO → PLAYING → (FLYING after portal) → LEVEL_COMPLETE → MENU / next level
                                    ↓
                               GAME_OVER → retry
```

---

## 📅 Development Roadmap

### ✅ Iteration 1 (MVP)
- [x] Game plan in README
- [x] index.html skeleton + Three.js scene
- [x] Mummy sprite (blockart)
- [x] Physics world (Cannon.js gravity + floor)
- [x] Platform + spike + portal objects
- [x] Mobile touch controls
- [x] 3 playable levels
- [x] Lives system + level restart
- [x] GitHub Pages hosting

### 🔜 Iteration 2
- [ ] Animated mummy (walking leg swap)
- [ ] Sound effects (jump, spike hit, portal whoosh)
- [ ] Levels 4–10
- [ ] Moving platforms
- [ ] Coin collectibles for score

### 🔜 Iteration 3
- [ ] Levels 11–20
- [ ] Background music
- [ ] High score leaderboard (localStorage)
- [ ] Enemy mummies (jump on head to defeat)
- [ ] Unlockable costumes

---

## 🚀 Running the Game Locally

Because Three.js uses ES modules, you need a simple local server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

For mobile testing: open the same URL on your phone (same Wi-Fi network), replacing `localhost` with your computer's IP address.

---

## 🌐 GitHub Pages Deployment

1. Go to **Settings → Pages** in the repository
2. Set **Source** to `main` branch, `/ (root)` folder
3. Save — the game will be live at `https://pjsamuel3.github.io/geometry-dasho/`

---

## 👨‍💻 Contributing

This is a father-and-son project! Suggestions, bug reports, and level ideas welcome via GitHub Issues.
