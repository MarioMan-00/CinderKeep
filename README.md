# Cinderkeep

A dark fantasy pixel-art action platformer built with HTML5, CSS3, vanilla JavaScript and the HTML5 Canvas API. No libraries, no build step, no asset files: every sprite, tile and sound is generated in code.

## Run it
Open `index.html` in a browser, or serve the folder (`python3 -m http.server`) and visit http://localhost:8000.

## Main menu
The title screen is a live battle. Each scene a different hero (Knight, Sage, Rogue or Sentinel) fights through waves of that level's enemies, then the next scene drops them into a boss arena: the Ashen King, the Grave Matron, the Forgemaster, the Bellwarden and Sir Varric, the Iron Marshal. The hero is played by a simple AI that closes in, swings, dodges, casts bolts, raises the shield and uses class abilities. Scenes change every 16 seconds. Nothing on the title counts toward your save.

## Music and settings
The title screen plays an original theme. Behind it, the battle's sound effects and the keep's ambience are mixed far down so the music leads. The theme is a slow D-minor procession of dark pads, low bass and a church-bell melody with a distant toll, all synthesised live with Web Audio (no audio files). It fades in when you reach the main menu, fades out when you start a run, and returns when you go back to the title.

Every boss fight has its own theme, "The Last Vigil": an A-minor lament with swelling strings, a heartbeat drum, a falling harp and a violin line that enters after four bars and climbs higher on the second pass. The Bell Warden has a theme of his own, "Requiem of the Bell": a tragic D-minor boss hymn with a chanting choir, a restless string ostinato, low brass swells and timpani. A cathedral bell tolls through it, tubular bells sigh a falling motif in the opening, then double the violin lament when the full hymn swells. Boss music rises when the arena gates close, keeps playing while paused, and fades out slowly when the boss falls (or quickly if you do).

Settings (title menu or pause menu) has sliders for Master volume, Music and Sound effects, plus a mute toggle (also the M key) and a test sound. Settings are saved on this device.

## Playing on a phone
Cinderkeep plays on phones held sideways, filling the screen edge to edge (it widens its view to the phone's shape).
- **Left thumb:** a move stick that appears where your thumb lands.
- **Right thumb:** attack (drag it to aim), heavy (drag to aim), jump, dodge, the four abilities, and **USE**, which pops up above the abilities when there's something to use.
- **Top left:** flask, ember bomb and warding ash. **≡** pauses.
- **Settings → Arrange touch buttons:** drag any control to a new spot and resize it; the layout is saved on the phone.
- **Settings / main menu → Full screen**, and starting a run on a phone goes full screen by itself.

## Shrines are safe rooms
Every shrine stands in a safe room with a door on each open side. Doors slide open as you walk up. Enemies can't come in or see you inside, and their missiles break against the doorway.

## Controls
Press **Tab** at any time to open the character sheet (health, stamina, gear, upgrade ranks, and the greatsword's temper and damage numbers); press Tab or Esc again to close it. It is also in the pause menu.

Mouse aim (the knight faces your cursor) · Left click light attack · Right click heavy attack · A/D walk (hold to run) · Space jump (double jump in air) · S+Space drop through · Shift or L dodge · J / K light / heavy attack · F heal · Q ember bomb · R warding ash · E take/open/rest · P or Esc pause · M sound on/off

## Characters
Starting a new game opens **Choose your path**. Each character uses the same animation rig and pixel style, with their own look, weapon, stats and four abilities on keys **1–4** (touch buttons 1–4 on phones). The ability bar sits at the bottom left with each cooldown shown. Abilities start at rank 1. At any shrine, **Train your abilities** raises them to rank 4 (300, 650 and 1100 souls); each rank makes the ability stronger and shortens its cooldown by 8%.

| Character | Weapon | Health · Stamina | Strengths |
|---|---|---|---|
| **Knight** | Greatsword | 110 · 100 | Takes 10% less damage. The original Ashen Knight. |
| **Sage** | Ashwood staff | 72 · 115 | The staff is only a focus: its blows deal 2 damage (3 heavy). Arcane Bolt does the killing, from a pool of magic. |
| **Rogue** | Twin daggers | 85 · 125 | 15% faster, cheaper dodges, fast weak swings, 160% damage from behind. |
| **Sentinel** | War spear and tower shield | 120 · 95 | Takes 15% less damage, the longest reach, a little slower. |

**Knight:** 1 **Heavy Strike** (a crushing heavy blow that staggers), 2 **Shield Bash** (charge and stun), 3 **Battle Cry** (more damage for 8s, throws back nearby foes), 4 **Guard** (take 70% less damage and never stagger for a few seconds).

**Sage:** the Sage casts from a **magic bar** (blue, between health and stamina), not stamina. **Arcane Bolt** on **left click** (or J, hold to keep casting): 8 magic a bolt, 11 damage at rank 1, one bolt every 0.7s. **Charged Bolt** on **right click** (hold to charge, release to fire): 25–50 magic. Magic refills on its own a moment after you stop casting. **Strike back:** when the Sage is hit, part of the lost health glows on the bar for a few seconds; hitting enemies in that window wins some of it back. At shrines the Sage trains **Deepen the well** (+20 magic, faster recovery) instead of health and stamina, and spends Weapon Shards on **Arcane Bolt - Quicky** (0.55s, 0.42s, then 0.32s between bolts) as well as tempering the staff (+6% a temper for the Sage).

**Rogue:** 1 **Shadow Step** (blink through foes), 2 **Backstab** (appear behind the nearest foe and stab; gets around shields), 3 **Smoke Bomb** (a cloud that hides you and makes nearby foes choke and lose track of you), 4 **Dual Strike** (a quick four- or five-cut flurry).

**Sentinel shield stance:** hold **right click** (or K) to raise the tower shield with the spear couched over it. You move slowly, and the shield and spear swing to follow your cursor in any direction; blows from the front are blocked down to 15% chip damage at the cost of stamina, and if your stamina runs out your guard breaks. While the shield is up, hold **left click** to draw the spear back and gather light at its tip (full at about 0.8s), then release to lunge along that line with a piercing thrust that strikes straight at your cursor (up, level, down or behind you): 16 to 50 damage, farther and harder the longer you charge, 12 to 30 stamina, and a full charge staggers foes. With the shield down, left click is the normal spear combo.

**Sentinel:** 1 **Judgment Strike** (a pillar of light ahead that damages and stuns), 2 **Divine Shield** (untouchable for a moment), 3 **Healing Prayer** (heal over time), 4 **Rallying Cry** (more damage, less damage taken and faster stamina for 10s).

Stuns from abilities work on regular foes, not bosses. Saves made before characters existed load as the Knight.

## Level 1: Cinderkeep
One connected side-scrolling level in five sections:
- **The Forgotten Gate**: safe start, ruined gate, a small gap, one Hollow Soldier, a chest of souls.
- **The Fallen Courtyard**: broken statues and walls, two Hollow Soldiers, an elevated platform, an optional treasure room, a locked door and a hidden passage.
- **The Prison Walk**: dark corridors and cells, a Crypt Archer, an Armored Warden, a spike hazard, a secret weapon-upgrade room, and a shortcut back to the courtyard.
- **The Ashen Shrine**: the checkpoint brazier. Rest to heal, refill flasks and items, spend souls on upgrades, and save.
- **The Throne of Cinders**: the arena of the Ashen King. When he falls, the stair behind his throne opens.

## Level 2: The Depths
Harder (non-boss foes have 30% more health, deal 35% more damage and drop 50% more souls) and nearly twice as long, in five larger sections:
- **The Bone Stair**: a shrine at the foot of the stair, a hound pack, a spike pit, an archer on a ledge, a burning abyss to leap.
- **The Ossuary Halls**: a Pyre Priest on a dais, a spiked hall crossed on iron walkways under archer fire, an Armored Warden, a hound pair, a hidden crypt above with a Scroll of Ash, and a false wall hiding a vial and souls.
- **The Matron's Choir**: a Cinder Wraith in the nave, then the Grave Matron's arena.
- **The Cinder Well**: bridges over the burning well guarded by wraiths, a Pyre Priest on a high ledge, two Wardens in a low hall, then the Shrine of Embers.
- **The Seraph's Pyre**: the arena of the Cinder Seraph. When it falls, a stair behind the pyre leads down to Level 3.

### New enemies
- **Ash Hound** (30 health): hunts in packs, circles at a distance, crouches with white eyes, then lunges. It checks for solid ground before leaping, and rests after landing.
- **Pyre Priest** (45 health): marks the ground under you with a glowing glyph, then a pillar of fire erupts. If you crowd it, it gathers ash, bursts, and blinks away.
- **Cinder Wraith** (28 health, flies): drifts over pits, locks a red line on you, then dives through it and rests, open to attack.

### New bosses
- **The Grave Matron**: bone-lance volleys, a line of grasping hands that rises toward you, a blink that brings her behind you for a crook sweep. At half health she summons two Hollow Soldiers and attacks faster.
- **The Cinder Seraph**: hovers within jumping reach, fires fans of ember feathers, marks a spot and dives on it (sending shockwaves both ways), then sits grounded and vulnerable. At half health it rains pillars of fire.

## Level 3: The Hollow Forge
The hardest level (non-boss foes have 65% more health, deal 62% more damage and drop 2.2x souls), with new hazards: pools of molten slag, floor vents that glow before they erupt, and burning ground left by fire bombs and ingots.
- **The Slag Gate**: a shrine, a slag pool, an imp ledge, two soldiers, a vent, a molten chasm with a single foothold, a Chain Reaver.
- **The Bellows Halls**: a corridor of four vents firing in sequence, a Slag Golem, an imp perch, a hidden smithy with a Scroll of Ash and, behind a false wall, an Ashen Whetstone and a soul cache, then a Reaver and hounds.
- **The Anvil Court**: a Pyre Priest, then the Forgemaster's arena.
- **The Chain Shafts**: five chained platforms over a slag lake with wraiths and an imp, then a golem with a Reaver, an archer, a Warden, and the Shrine of the Crown.
- **The Crown Furnace**: the arena of the Ember Queen. When she falls, a stair behind her climbs to Level 4.

### New enemies
- **Slag Golem**: armored, so ordinary hits only chip it (30%). After its slow two-fisted pound it vents its glowing core for two seconds; hits then deal double damage.
- **Ember Imp**: hops away when you approach and lobs fire bombs that leave burning ground.
- **Chain Reaver**: spins its chain overhead, throws a hook that reels you in, then cuts. Roll through the hook, or roll away from the cut.

### New bosses
- **The Forgemaster**: hammer slams with shockwaves, molten ingots thrown in an arc that burn where they land, and a bull charge that stuns him if he hits a wall. At half health the arena's floor vents start erupting.
- **The Ember Queen**: a fast duelist. Thrusts across the arena, three-cut combos, and backsteps away from your swings. At half health she leaves burning ground behind her and leaps in with fire.

## Level 4: The Castle Walls
Out of the Queen's furnace and up onto the battlements in full daylight: blue sky, drifting clouds, the countryside and a far-off town below. It is the hardest and most crowded level so far (non-boss foes have twice the health, deal 95% more damage and drop 3x souls). Wind gusts sweep across the Sky Bridge in pulses (they no longer push the knight).
- **The Gatehouse Roof**: the Shrine of the Dawn, a crow flock, a halberdier, an archer on a merlon block, a breach in the wall to jump, and a tower with a bombardier on its roof.
- **The Long Wall**: halberdiers, crow flocks, a ballista, an archer turret, a bombardier platform, hounds, a Warden, and a tower holding a Scroll of Ash. A false floor in that tower drops to a hidden pocket with an Ashen Whetstone and a soul cache.
- **The Bell Tower**: the arena of the Bellwarden.
- **The Sky Bridge**: a long wooden bridge with four gaps and wind gusts, three halberdiers and six crows, then a tower with a bombardier and the Shrine of the Spire.
- **The Sun Spire**: the arena of Ignis, the Ash Drake. When it falls, a stair leads down to Level 5.

### New enemies
- **Carrion Crow**: weak, but they come in flocks. They circle, caw, then swoop at you.
- **Halberdier**: a long thrust and a sweep that hits both sides. Both shove you hard, which is dangerous near gaps.
- **Siege Bombardier**: sits on rooftops, marks the spot where you stand, then lobs a mortar shell onto it. Keep moving. Kicks you away if you get close.

### New bosses
- **The Bell Warden**: the bell-headed jailer with two chained bells. See *The Bell Warden* below for his attacks.
- **Ignis, the Ash Drake**: on the roof, it claws, sweeps its tail and breathes fire that leaves burning ground. Then it takes off to strafe the wall with fire and rain down fireball volleys before landing again.

## Level 5: The Outer Ramparts
Down from the Sun Spire onto the outer walls and the siege yard in the afternoon sun. It is the longest and hardest level (660 tiles, about 40% longer than Level 4; non-boss foes have about 4.7x the health, deal 2.34x the damage and drop 3.6x souls compared to Level 1), with three new armored enemies that block the way and two bosses who fight with reinforcements.
- **The Rampart Stair**: the Shrine of the Ramparts, crows, a halberdier and a Bulwark, a breach, an archer, a tower passage held by an Iron Brute with a bombardier on its roof, hounds and soldiers, an archer and bombardier deck, a Flail Knight, more crows and a second Brute.
- **The Siege Yard**: a Bulwark in the wall gate, then the outer bailey under the curtain wall: trebuchets, tents, barricades, a bombardier scaffold, spike strips, a Flail Knight and a Brute, archers on a broken siege tower, a Chain Reaver, hounds, a Warden and a Bulwark side by side, a chest with a Scroll of Ash, a hidden cellar with two soul caches, and the Shrine of the Muster.
- **The Muster Field**: the arena of Sir Varric, the Iron Marshal, with an archer on a scaffold at each end.
- **The Curtain Wall**: a tower held by a Brute (its false floor hides an Ashen Whetstone and a soul cache), then a long wall walk with four gaps and two windy stretches, Bulwarks, Flail Knights, Brutes, halberdiers, hounds, crow flocks, an archer turret and a bombardier platform, ending at the Shrine of the Barbican.
- **The Barbican**: a Brute, a Bulwark and a Flail Knight in a row, then the arena of Gorrath, the Siege Colossus, before the great gate, with a bombardier on each gate tower.

### New armored enemies
None of these can be walked or rolled through. You have to break them, get behind them, or jump over them.
- **Iron Brute**: a hulk with a maul and three chest plates. Light blows from the front glance off (35% damage) until heavy attacks crack all three plates, which staggers it. Its maul smash sends a shockwave forward and leaves it open for a moment. It shoulder-charges from range, and it swats upward at anyone jumping over it.
- **Bulwark**: a tower shield that blocks every blow from the front, heavy ones included, and costs you stamina. It advances, pokes its spear over the rim, and bashes with the shield. After a bash its guard is down for a second (hits deal 1.5x). Otherwise get behind it, or use bombs.
- **Flail Knight**: armored (30% less damage from the front). It walks into you with a whirling ball and chain, then reels dizzy (hits deal 1.5x), or lashes the flail out to long range.

### New bosses (both fight with reinforcements)
- **Sir Varric, the Iron Marshal**: four-cut sword combos (five at half health), a lunge he can chain into more cuts, and a leaping slam with a double shockwave (triple at half health). He parries some of your blows from the front ("Parried"), which costs stamina, then answers with a fast riposte. His war horn ("To arms!") calls three soldiers at a time through both arena gates, always including an Iron Brute (Brutes, Bulwarks, Flail Knights and halberdiers; four at a time and up to seven on the field at half health). On "Loose!", his archers rain a volley of arrows, with a second wave at half health; red marks show where they will land. Two more archers stand on the scaffolds. Everything that fights at his side moves 15% faster than usual.
- **Gorrath, the Siege Colossus**: an armored giant in three phases (at two thirds and one third of his health). Light blows from the front deal 60%. His club slam sticks in the stone for a moment (hits deal 1.5x); his low sweep must be jumped; his stomp brings rubble down across the arena (shadows show where); he rams across the arena and is stunned if he hits a tower; he swats anyone standing above him. Bombardiers shell you from both gate towers, and his roar calls Brutes, Flail Knights and Bulwarks with crows from the start (more each phase, up to five at once). They leap down off the wall on either side of you, and climb or hop over anything in their way to reach you. From phase 2: a chain lash that reaches across half the arena, slams that follow into sweeps, and a quake that drops rubble on the whole arena except one gap you must reach. In phase 3 he is enraged: faster still, double slams, double sweeps, double lashes, and a charge that bounces off the tower and comes straight back.

### Replaying Level 5
Once Level 5 is unlocked, the title screen offers **Replay Level 5**: it starts the Outer Ramparts from its first shrine with your knight, souls and upgrades, and brings back the Iron Marshal and the Siege Colossus.

### The Bell Warden (Level 4 boss)
Once a royal warden of the kingdom's prisons, now a bell fused where his head was: faceless, grated, glowing from inside, with an iron cross on its crown. He wears a tattered crimson-and-black robe, broad pauldrons and chains across the chest, and swings two more bells on chains.
- **Bell Swing**: a wide arc from over his shoulder down to the floor in front, with a red trail. Heavy damage and knockback.
- **Ground Slam**: both bells overhead (a red line marks the impact), then into the stone. The impact and the shockwaves that run both ways **stun** you briefly. Jump the waves.
- **Chain Pull**: he whirls a bell and hurls it on its chain. If it catches you, you're reeled in and struck with the other bell. Jump over it or roll through it.
- **Phase 2, Enraged** (below half health): he erupts in a burst of fire and keeps burning. Flames rise behind him and from his bell head, his grates glow white-hot, both weapon bells burn, and his swing trail turns to fire. Every attack is faster: wind-ups about 45% quicker, much shorter pauses after attacks, a faster walk, double swings, a quicker chain reel and wider shockwaves.
- **Ringing Phase** (Phase 2): he tolls his head, sending out spectral rings, and three spectral bells take flight and circle the arena for about 12 seconds. When they sweep along the floor you have to jump or roll past them.

## Difficulty curve
Every level is at least 20% tougher than the one before, in both health and damage. Regular foes scale from Level 1 by health 1x, 1.3x, 1.65x, 2x, 4.67x and damage 1x, 1.35x, 1.62x, 1.95x, 2.34x; each level's bosses have at least 20% more health and damage than the previous level's, and every boss has at least 20% more health than the boss before it.

## Upgrades
**Weapon Shards are the only way to temper your weapon.** Every boss drops one shard where it falls (nine in all; replaying Level 5 does not drop them again). At any shrine, one shard tempers your weapon by one rank (+12% damage each, up to +9), with no souls needed. Ashen Whetstones no longer temper weapons; they crumble into 400 souls. At any shrine, flasks deepened 5 times (up to full-health heals), and stamina raised 5 times. Three newer upgrades: **Kindle the edge** (3 ranks; heavy attacks send a running wave of flame along the ground), **Harden the plate** (5 ranks; 6% less damage taken per rank) and **Widen the satchel** (3 ranks; one more ember bomb and warding ash per rank). Level 5 adds **Fortify the heart** (5 ranks; +15 maximum health each), **Learn to sunder** (3 ranks; +15% damage to armored foes per rank, and from rank 2 light blows can crack a Brute's plate) and **Drink of the fallen** (3 ranks; each kill restores 6, 9 or 12 health). 

## Enemies
- **Hollow Soldier** (50 health, 10 souls): patrols a short stretch, spots you by sight, closes in, raises its blade before striking, then pauses to recover.
- **Crypt Archer** (35 health, 12 souls): keeps its distance, backs away or hops back when you close in, draws and aims (red aim line) before loosing a visible arrow.
- **Armored Warden** (120 health, 30 souls): slow and turns slowly. Its shield blocks light attacks from the front; a heavy attack breaks its guard. Its overhead strike has a long wind-up, and when it misses, its weapon sticks in the ground for a long recovery. Attacks from behind deal 1.5x damage.

Every attack has a visible wind-up and a recovery window. Enemies stop at ledges, return home when they lose you, are pulled back if they ever fall out of the level, and are freed if they end up inside a wall.

## Code map (js/game.js)
Constants and palette · backdrop layers · the authored level and section list · level rendering · audio (Web Audio synthesis) · input · the Ashen Knight state machine · enemies and the Ashen King · step loop · rendering with a quarter-resolution light map · the HTML interface (HUD, pause, shrine, title menus).
