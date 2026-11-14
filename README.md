# Universe Crazy

An original, browser-based 3D arena fighter. Choose from six procedural fighters, battle in 200 seeded arena layouts across ten visual themes, and play solo versus the CPU or in local two-player mode. Arenas include elevated platforms with working landing physics; fighters have distinct stats, specials, and movement animations.

The character names and geometry here are a starter interpretation. Replace the procedural models and expand the roster/maps when the original art and design details are ready. This project uses its own characters, visuals, UI, and rules; it does not include third-party game assets.

## Run locally

Requirements: Node.js 20.19+ and npm.

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. To create and check the production build:

```powershell
npm run build
npm run preview
```

## Controls

In solo mode, use either arrows or WASD for movement. Arrow Up and Space jump; Arrow Down and S/W adjust depth. J or Enter strikes, and K or Shift uses a special. The fighter stops when keys are released; the CPU opponent moves and attacks by design.

In local mode, `A`/`D` move, `W`/`S` adjust depth, `Space` jumps, and `J`/`K` attack. The arrow keys move, Arrow Up jumps, Arrow Down adjusts depth, and `Enter`/right `Shift` attack. Touch buttons are available for solo play on touch screens.

Use the previous/next or Random controls on the fighter-selection screen to choose an arena. The 200 numbered layouts are generated deterministically, so each selection is repeatable.

The renderer is tuned for steadier performance on everyday devices: it caps display resolution and frame rate, skips expensive real-time shadows, and pauses while the tab is hidden. Keyboard state is cleared on focus changes and match transitions to prevent stuck movement.

## Host on GitHub Pages

The production build is deployed by the included GitHub Actions workflow. Enable GitHub Pages for the repository and choose **GitHub Actions** as the source; pushes to `main` build and deploy `dist/`.

The Playroom portal lists this game at `https://pavin-projects.github.io/universe-crazy/`. Update that URL in the portal's `games.json` if you deploy under a different owner or repository name.
