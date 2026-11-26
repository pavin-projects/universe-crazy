# Universe Crazy

An original, browser-based 2.5D arena fighter. The title screen opens on a continuously turning spiral galaxy with six differently sized drifting planets and orbiting moons, while small ships trade fire in the distance. Choose from ten original fighters, inspect their full-turn 3D previews and animated idle poses, then fight in a four-way free-for-all against three CPUs or play locally with up to four people. Fighters have articulated limbs, animated movement, blinking eyes, and opening speech bubbles. Starting a match sends fighters through the portal onto the arena. Arenas vary in size and shape, with rounded mini-planet bases, drifting ringed planets in the background, climbable stairs, raised combat platforms, and themed scenery around open edges. Attacks near the perimeter add outward launch force, and falling into space costs a stock. K.O. animations pull downed fighters into a spinning black hole before their normal respawn. Find and strike glowing seals in a few arenas to open the hidden Null Abyss and challenge Entity.exe. Its portal stays closed until Entity.exe is defeated; winning opens the exit and unlocks its fighter skin for future visits when browser storage is available.

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

For online play, use the Vite development server: it hosts the account API and WebSocket lobby on the same port. Sign in, choose the online mode, and host or join using the small corner indicator. The host can start with two to six players; a full six-player lobby starts automatically. The lobby stays open until it starts or the host leaves. Other players must be able to reach the server; the static GitHub Pages build does not provide the online server.

Run the focused tests with `node --test tests\collision.test.js tests\flight.test.js tests\lobby.test.js`.

## Controls

In solo mode, use WASD or the arrow keys to move; W/S or Up/Down adjust depth, and Space or Up jumps. J or Enter fights, and K or right Shift uses a special. The three CPU rivals fight each other as well as you. Every fighter has a dedicated 100-HP bar; a depleted bar costs a stock and the fighter respawns, while running or being knocked off the arena also costs a stock. On touch screens, drag the virtual joystick to move and adjust depth; use the separate JUMP, FIGHT, and SPECIAL buttons. Strike a glowing seal on select maps to open the hidden arena. The fighter stops when keys are released; CPU rivals move and attack by design.

Each fighter has a different special ability with a four-second cooldown. Its name appears on the fighter card and in the match controls. Rex Rumble breathes fire, and the secret Entity.exe fighter uses a Void Pulse.

Local four-player mode runs at half speed. Player 1 uses `A`/`D` and `W`/`S`, `Space` to jump, and `J`/`K` to fight/use a special. Player 2 uses the arrow keys, `Enter`, and right `Shift`. Player 3 uses `F`/`H` and `T`/`G`, `R` to jump, and `Y`/`U` to fight/use a special. Player 4 uses numpad `4`/`6` and `8`/`5`, `0` to jump, and `1`/`2` to fight/use a special. Touch controls operate Player 1.

Press **START** to open fighter selection, then press **FIGHT!** to begin. Use the previous/next or Random controls to choose an arena. The 200 numbered layouts are generated deterministically, so each selection is repeatable.

Adventure mode lets you fly through a larger galaxy, watch battles on planets, and track nearby objects and Entity.exe on the ship-centered minimap. Drag the touch joystick to turn and thrust; the touch buttons ascend, fire, boost, and descend. On the keyboard, Shift or K boosts. Projectiles collide with planets and the first target they reach.

Choose **FULL SCREEN** on the title screen to hide browser chrome while playing. Full screen may be blocked when the game is embedded; open it in its own tab instead.

An original, 30-track synthesized space soundtrack starts when you press **START** and cycles through all 30 tracks automatically. Use **Music: On/Off** and **Track 1/30** in the top-right corner to mute or skip tracks; browsers require a user gesture before audio can play.

The renderer is tuned for steadier performance on everyday devices: it caps display resolution and frame rate, skips expensive real-time shadows, and pauses while the tab is hidden. If WebGL cannot start or is interrupted, the game displays a recovery message instead of leaving a blank screen. Keyboard state is cleared on focus changes and match transitions to prevent stuck movement.

## Host on GitHub Pages

The production build is deployed by the included GitHub Actions workflow. Enable GitHub Pages for the repository and choose **GitHub Actions** as the source; pushes to `main` build and deploy `dist/`.

The Playroom portal lists this game at `https://pavin-projects.github.io/universe-crazy/`. Update that URL in the portal's `games.json` if you deploy under a different owner or repository name.
