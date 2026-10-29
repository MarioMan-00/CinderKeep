# Cinderkeep: handoff

Written on 29 October 2026 at the end of a long Claude chat session, to carry the project into Claude Code (the Code tab). Read this first. `CLAUDE.md` repeats the standing rules in short.

## Where things stand

- **This repo is now the source of truth.** Until this commit the game was built in a chat session as one self-contained HTML file and published as a claude.ai artifact. This commit brings the repo up to date with that file. The user has the artifact link, and it shows the same game as this commit, except for the dormant wing-concept code described under *Open decisions*.
- **The layout is a mechanical split of that file:**
  - The `<style>` block became `cinderkeep/css/style.css`.
  - The `<script>` block became `cinderkeep/js/game.js`.
  - The rest became `cinderkeep/index.html`.

  If you ever need the single-file form again, for example to republish the artifact, inline the two back.
- **Tests before this commit**, run in headless Chromium:
  - All 15 of the final boss's attacks land and clean up after themselves.
  - Both phase changes, the posture meter and the King's End safe spots work.
  - The grab's full-health rule holds, and the death scene runs through to the win screen.
  - Level 6 starts from the level select.
  - There are no page errors.

## Hard rules (from the user)

1. **Never touch the Playtest Vault itself:** not its website, its database or its repository.
2. **Add no secrets, tokens or other files to the repo.** It holds the game, `README.md`, `splash.png`, the workflow, and these two docs.
3. **Anything that lands on `main` publishes the game to every tester.** The publish runs through `.github/workflows/vault-publish.yml`.
   - Unless the user asks for a playtest release, every commit that reaches `main` needs `[skip publish]` in its message. Add `[skip ci]` too, so the workflow doesn't run at all.
   - A pull request whose title starts with `WIP:` doesn't publish when merged.
   - Pushing any branch other than `main` triggers nothing.
4. **`cinderkeep/` is exactly what testers receive** (it is set as `VAULT_DIST`). Never put tests, tools, notes or images in it. Keep test hooks in throwaway copies.
5. **Commit author:** match the existing commit author shown in `git log`.

## The game at a glance

Cinderkeep is a dark-fantasy pixel-art Soulslike platformer in vanilla JavaScript and Canvas, with no build step and no asset files. Every sprite, tile and sound is generated in code.

- **Classes:** Knight, Sage, Rogue and Sentinel.
- **Home screen:** Continue, New game, Levels (start at any level) and Practice (any boss, with the upgrades you would have by then and a class picker).

| # | Level | Sections | Bosses (save flag) |
|---|---|---|---|
| 1 | Cinderkeep | Fallen Courtyard, Prison Depths, Burning Halls, Throne of Cinders | The Ashen King (`kingDead`) |
| 2 | The Depths | Bone Stair, Ossuary Halls, Cinder Well, Seraph's Pyre | The Grave Matron (`matronDead`), The Cinder Seraph (`seraphDead`) |
| 3 | The Hollow Forge | Slag Gate, Bellows Halls, Anvil Works, Chain Shafts, Crown Furnace | The Forgemaster (`forgeDead`), The Ashen Queen (`queenDead`) |
| 4 | The Castle Walls | Gatehouse Ward, Long Wall, Bell Tower, Merchant Quarter, Spire Climb, Sun Spire | The Bellwarden (`bellDead`), The Shattered Blades, the Veiled Executioner (`drakeDead`, a flag kept from the drake it replaced) |
| 5 | The Outer Ramparts | Barracks Row, Siege Field, Muster Field, Ruined Abbey, Barbican Walls, Great Gate | Sir Varric, the Iron Marshal (`marshalDead`), Gorrath, the Siege Colossus (`colossusDead`) |
| 6 | The Throne of Cinderkeep | Hall of Kings, Throne of Cinderkeep | **The Cinder Keep** (`ckDead`); beating him wins the game |

## Changes since the last repo commit (28 Oct)

- **Level 4:**
  - Chests are capped at 13, and the floating chests are fixed.
  - The Sun Spire boss is now the Shattered Blades (the Veiled Executioner), replacing Ignis the drake. It is drawn at 65% scale (`BL_SCALE`) with wind-blown cloth.
  - The arena platforms are gone.
- **Level 5:**
  - Rebuilt shorter than Level 4. The user asked for four distinct parts, each with different buildings.
  - The unfinished buildings are fixed, and the enemies hit harder.
- **Gorrath, rebuilt from the user's spec:**
  - 10 attacks, phase 2 at 50%, a stagger and a staged death.
  - An iron look; `GORRATH_V` picks the variant, and 5 is the one in use.
  - Arm fixes and 12,000 HP.
  - When he falls, a stair leads up to Level 6. He no longer ends the game.
- **Sir Varric** has been redrawn in the user's chosen "Lord Marshal" design, with wind-blown cloth (`drawMarshal`).
- **Graphics pass on the whole game:** `atmosphere()` adds per-level colour grading (`GRADE`), light beams from windows and drifting motes. Enemies are outlined.
- **Characters are back to their original size** (`PSC=1`). The user tried several sizes and settled here.
- **Home screen:** the level select was added. Practice mode now gives upgraded builds and a class picker.
- **New:** Level 6 and the final boss (both below). The boss health bar has a third phase icon (`#ph3`), shown only for the Cinder Keep.

## Level 6: The Throne of Cinderkeep (`buildL6`)

- **Hall of Kings (tiles 0–141):**
  - Pillars, king statues, royal banners, braziers, and raised galleries with archers and priests.
  - 18 elite foes, two chests, and the Shrine of the Last King at tile 62.
- **Throne room (tiles 142–232):**
  - The gate is at tile 142, the trigger at 148, and the arena's right edge at 229.
  - Decor: stained glass (`sglass`), chandeliers (`chand`), royal banners (`rbanner`), a golden throne on a dais (`gthrone`), braziers, and a carpet (`carpet`, drawn by `drawCarpets` after the front layer).
  - Two iron grates (one-way tiles over pits) at tiles 152–154 and 210–212. Dropping into one ducks King's End.
- **Lists that had to grow for a sixth level:**
  - `WIDTHS`, `SECT`, the builder array in `buildWorld`, `LVS`, and `GRADE` (with a `GRADE6` fallback in `atmosphere`).
  - `LVNAMES`, `LVBOSS`, and the `lvl_` menu actions.
  - The continue, wake and stair texts, and the title screen's "/10 bosses" count.
  - `DAYL()`: daylight only on levels 4–5.

## The final boss: The Cinder Keep

**His look:** the user adapted their "Gilded Sovereign" design doc and renamed him The Cinder Keep.
- Slightly tarnished gold plate, and a crowned great-helm with a floating halo.
- Layered gorget plates joining the helm to the body. The user asked that his head connect realistically.
- A white tabard, a crimson cape and a silver longsword.
- The Ember Paladin's crimson kite shield with a flame sigil. The user chose it over the spec's tower shield.

**Stats and code:**
- Type `ckeep`: HP 11,000, damage 58, souls 30,000. Save flag `ckDead`.
- All his code is under the comment `THE CINDER KEEP` in `game.js`.

**Phases:** at 70% (`CKC.P2`) and 35% (`CKC.P3`), with Last Light at 10% (`CKC.LAST`).

**Moves** (keys in his move table `M`):
- **Phase 1:**
  - `decree`, Royal Decree. If you roll behind him after the bash, he swings his shield backward instead of striking down.
  - `crownfall`, Crownfall.
  - `wall`, The King's Wall. Hits from the front deal 15%; three blocked hits bring a shield thrust; a heavy hit staggers him; a heavy hit during the shield's white glint breaks his stance.
  - `advance`, Sovereign's Advance.
- **Phase 2:** his fire waves now leave burning ground.
  - `sun`, Sunbreaker. If you jump early, he waits for you to land.
  - `crowns`, Crown of Embers.
  - `charge`, The Scorched Throne. Hitting a wall stuns him for a long time.
  - `grab`, Imperial Execution. It never kills from full health.
  - `erupt`, Ashen Eruption. The gaps move each time.
- **Phase 3:**
  - `wings`, Wings of the Usurper.
  - `ruin`, Heaven's Ruin. It retargets once below 20% health.
  - `halo`, The Shattered Halo. The fragments can be cut down with the sword.
  - `kend`, King's End, about every 30 seconds. Safe answers: roll on the white flash, drop into a grate, or stand behind his fallen shield. The shield drops at 22% health or on his first posture break in phase 3.
- **Last Light (10%):** `decreeS`, `sunS`, `wingsD` and `ruinT` (a dive, then a thrust). Each hit burns out part of his wings.

**Phase changes:** `trans1` ("Judgment of the Crown") and `trans2` ("The Crown Breaks") each play one of the user's lines. He can't be damaged during them (handled in `ckHit`).

**Posture:** a hidden meter, `post`. Hits fill it and heavy hits fill it faster. It drains after 2.5 seconds without a hit. When it is full he drops to one knee (`stunned`), which gets the game's normal 1.5x critical bonus.

**How the code is built:**
- **Moves:** `aiCinderKeep` runs a small step-sequence runner, state `'seq'`. Each step has:
  - a wind-up `w`, an active window `a` and a recovery `r`;
  - an optional hitbox `[x0,x1,y0,y1,damageMul,knockback]`, relative to facing;
  - optional `go`/`act`/`wind` callbacks, and `nx` for branching.

  The bespoke states are cases in the same switch: `wall`, `adv`, `chgW`/`chg`, `grab`, `wings`, `ruin`, `halo`, `kend`, `trans1`/`trans2`, `stunned`, `stag` and `rec`.
- **Poses:** his poses are in `CKP`, chosen by `ckPose(e)` from `e.pose`.
- **Damage:** `ckHit` handles everything special about damage he takes.
- **Projectiles:**
  - His projectiles are shots tagged `ck:1`, of kinds `ckwave`, `ckfire`, `ckfeather`, `ckcrown`, `ckpil` and `ckhalo`. `stepShotCK` and `drawShotCK` step and draw them, and they are cleared when he dies.
  - The fallen shield is `ckshield` (`ck:2`).
- **Death:** `ckDeath` plays the ending scene. The body stays, `game.wonT=10.5` counts down, and the win screen follows.
- **Gotcha:** `hitPlayerBox` needs `x0 < x1`. Getting this wrong was the cause of a grab bug, now fixed.

## Open decisions (ask the user before acting)

1. **His phase-3 wings are waiting on the user's pick.** Four new designs are already in the code as `ckWings(style, ...)`, and the global `CK_WING` chooses one:

   | `CK_WING` | Design |
   |---|---|
   | 0 | Current: straight flame strokes. This is what ships now. |
   | 1 | A, Seraph Feathers |
   | 2 | B, Shattered Blades |
   | 3 | C, Iron and Ash |
   | 4 | D, Phoenix Flame |

   The user has seen all five in the game: resting, spread and folded. When they choose:
   - Set `CK_WING`, then delete the unused styles. Delete the old stroke code too if they want.
   - Re-check the fold during Wings of the Usurper, the Last Light burn-out (`wcut`) and the collapse when he dies.
   - If they pick B, make the shards bolder; they read thin.
   - They may ask for a mix, for example A's shape with D's fire.
2. **Knight redesign:** three slim-knight concepts (A, B and C) were shown earlier and never picked. Don't start this unless asked.

## Known gaps

- **`README.md` is stale.** It was last updated on 28 Oct.
  - It still describes Ignis the Ash Drake as Level 4's last boss.
  - The Level 1, 3, 4 and 5 sections and boss descriptions predate the rebuilds. Level 3 still says "Anvil Court" and "Ember Queen" where the game has the Anvil Works and the Ashen Queen.
  - Level 6, the Cinder Keep, the level select and practice mode are missing.

  Update it when the user wants, in the README only (not in `cinderkeep/`).
- **Weapon upgrades:** tempering the weapon has 9 ranks, but there are now 10 bosses and so 10 Weapon Shards.

## Code map (`cinderkeep/js/game.js`: one IIFE, about 5,900 lines)

Search for function names rather than line numbers.

- **Screen:** a 400×225 buffer (`VW`×`VH`) scaled up to the window. Tiles are `T=16`, with `ROWS=22`; the floor is row 16, so floor y = `16*T`. `g` is the canvas context.
- **World:** `buildWorld(L)` calls `buildL1` to `buildL6({S,D,O,I,E,zone})`.
  - `S(x0,y0,x1,y1,code)` sets tiles: 0 air, 1 stone, 2 one-way, 3 spikes, 4 plank, 5 false wall, 6 iron, 7 molten.
  - `D` adds decor, drawn into the back layer; custom decor lives in `DECOR2`.
  - `O` adds objects (`shrine`, `chest`, `descent` and so on), `I` adds items and `E` adds enemy spawns.
  - Boss arenas use `arenas.push({gates,trigger,x1,boss,flag,name,sub})`.
- **Enemies:**
  - The `FOE` stats table, and the `BOSS` map (type to save flag).
  - The AI and draw dispatch maps in `updateFoe` and `drawFoe`.
  - `damageFoe` holds each type's defences; `killFoe` handles banners, shard drops and the win; `updateFoe` holds special cases for the dead state.
  - Helpers: `walker`, `move`, `bodyBlock`, `slowTurn`, `hitPlayerBox`, `shove`, `hurtPlayer`, `sparks`, `dust`, `part`, `tempLights`, `banner`, `nums` and `sfx.*`.
- **Projectiles:** one `shots` array. Each boss family has its own `stepShotX`/`drawShotX`, chained in the update loop and in `drawShot2`.
- **Player:** a state machine `PS` with idle, walk, run, jump, fall, light, heavy, dodge, hurt, heal and death. A dodge gives 0.3 seconds of invulnerability.
- **Practice:** `PRACTICE` entries are `[id, name, levelIndex, flag, gateTile]`, and `practiceBuild` gives the upgrades for that point in the game.

## How to test

There is no build step. Open `cinderkeep/index.html` in a browser, or run `python3 -m http.server` in `cinderkeep/`.

For automated checks, Playwright with Chromium worked well:

1. Copy `cinderkeep/` to a temporary folder.
2. In the copy's `js/game.js`, add this hook just before the final `})();`. Never commit it.

   ```js
   window.__t={P:()=>P,game,B:()=>boss,S:()=>shots,dmg:(e,d,k)=>damageFoe(e,d,1,0,false,k||'heavy')};
   ```
3. Drive the game from Python:

   ```python
   pg.goto('file:///tmp/ck/index.html'); pg.evaluate("localStorage.clear()"); pg.reload()
   pg.click('[data-act=practice]'); pg.click('[data-act=prac_ckeep]')
   pg.keyboard.down('d'); pg.wait_for_timeout(2600); pg.keyboard.up('d')        # walk into the arena
   pg.evaluate("()=>{const b=window.__t.B();b.state='chase';b.cd=0;b.want='kend';b.cds={}}")  # force one move
   pg.locator('#game').screenshot(path='shot.png')
   ```

What to check: every attack does damage, its shots clear, there are no page errors, and it runs at about 60 fps.

## Working with the user

- **Visual changes:** before a big visual change, show pictures first. Draw several options in the game's own style and let them pick; they often ask for "some pictures" or "models".
- **Keep the established look.** In the user's words: "keep him the same as my game". Knights should look fit, not chunky.
- **Reading requests:** messages are short and sometimes have typos. Read them generously, and ask only when a wrong guess would be costly.
- **Reporting:** after a change, give a short, plain summary of what changed in the game rather than in the code.
