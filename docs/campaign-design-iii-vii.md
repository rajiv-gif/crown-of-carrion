# Crown of Carrion — Campaign Design: Chapters III–VII

Design document for the remaining campaign. Art comes later; this locks story,
battles, enemies, bosses, and the mechanics each chapter introduces.

**The spine:** the Carrion Crown broke the wheel of death. Nothing passes.
Every faction is a different wrong answer to the same question: *what do you
do with souls that cannot leave?* The Congregation ate them. The Covenant
sold them. The Choir wore them. Lucian's answer is the worst one: own the
wheel itself.

**Occult sources per chapter** (tone guides, never named in-game):
- III — inverted communion, transubstantiation literalized
- IV — Nordic oath-law and draugr; LaVey's self-deification and itemized indulgence
- V — Crowley: the Book that reads you, true names, Choronzon and the dissolution of self in the Abyss
- VI — Vedic: samsara jammed, the lokas stacked into one plane; Ragnarök as a scheduled collapse
- VII — moksha refused; the psychopomp's unpaid wage

---

## CHAPTER III — The Bone Congregation
*The Church Catacombs / The Iron Marches · Danger: Lethal*
*Faction: The Bone Congregation · Boss: The Carrion Pope*

### Story
The Black Tithe's gold bought followers. The followers built a church under
the church. Told the innocent were guilty, they ate the guilt — literally.
Communion inverted: the congregation consumed the flock to keep the flock
from leaving, and the flesh kept them kneeling long after it should have
stopped. They are not risen dead. They never got up.

**Mission 1 — The Descent** *(patron: Lucian's ledger)*
Follow the tithe-gold's trail into the catacombs. Tutorialize the corpse-pile
economy: every fight has piles, and the undead feed from them.

**Mission 2 — The First Table** *(patron: no one living)*
The Warden still preaches to seats filled with things that used to be people.
End the sermon. (Miniboss: the Warden of the First Table.)

**Mission 3 — The Black Conclave** *(patron: the ledger itself — the gold
trail ends here)*
Below the table there is a conclave chamber, and in it the thing the
congregation kneels TO. The Carrion Pope did not survive death. He outranked
it. He signs death's paperwork now, and he has been re-hiring the fallen for
nineteen years.

### Enemies (mostly implemented)
- **Flesh Congregant** ✅ — swarm body. Regens 3/turn on corpse piles. Kill fast.
- **Catacomb Digger** ✅ — support. Exhume heals all Congregants; on death feeds nearby Congregants 8 HP. Kill first or last — never in the middle.
- **Crowned Penitent** ✅ — frontline tank. Thorn Rebuke bleeds attackers; Penance Lash self-harm nuke.
- **Catacomb Tender** *(new)* — the hospitality of the table. Ranged. Lobs "portions" (throws corpse-pile chunks): minor damage + **creates a new corpse_pile tile where it lands**. The battlefield gets worse the longer it lives.

### Miniboss — The Warden of the First Table (Mission 2)
A patriarch grown into his pulpit; the pulpit is bone. ~200 HP, slow, immune
to fear/poison.

- **Phase 1 — The Sermon:** *Grace Before Meat* (buffs all undead with Might),
  *First Portion* (single-target bite, heals himself for half).
- **Phase 2 (66% HP) — Second Serving:** summons 2 Flesh Congregants from
  corpse-pile tiles ("the seats fill"). If no piles exist, summons 1 from
  under his own pulpit.
- **Phase 3 (33% HP) — The Table Turns:** *devours the nearest living
  Congregant whole* — heals 40, gains permanent Might, and the party watches
  the congregation's faith not waver. If no Congregant is alive, he takes the
  bite from himself: −20 HP, gains double Might. Either way the sermon gets
  faster (speed +3).

### Boss — The Carrion Pope (Mission 3) ✅ *(unit implemented; boss phases pending)*
*"He Anoints What the Grave Rejects."* ~180 HP as chapter boss (110 in
skirmish), immune to fear/poison/psychosis.

Already in the game: **Black Unction** (raises the strongest corpse as a
Depraved — 60% HP, +30% atk, +2 speed, fear-immune, burns 3 HP/turn racing
back to its grave; one unction per corpse), **Papal Bull** (Might to the
flock), **Censer of Marrow** (damage + curse).

Boss-fight phases (to build):
- **Phase 1 — The Office of the Dead:** kit as implemented. He hangs back;
  his flock dies in front of him and comes back worse.
- **Phase 2 (60% HP) — Conclave of the Risen:** Black Unction's cooldown
  drops to 2 and raises up to TWO corpses per cast. The fight's economy
  inverts: your kills are now his action economy. Log: "The conclave votes.
  The dead have a quorum."
- **Phase 3 (25% HP) — The Last Rite:** he administers the unction to
  HIMSELF. Heals 25%, gains deathHungry (+25% damage, burns 3 HP/turn), and
  his bark changes: he stops officiating and starts sprinting at the party.
  The final phase is a race against his own self-consumption — survive it
  or kill him before he kills himself through you.

Encounter roster: Carrion Pope + Catacomb Digger + 2 Flesh Congregants —
every support piece feeds the unction loop.

### Battlefield — The First Table (10×6)
Long nave. Corpse piles down the center aisle like an offering row. Holy
ground only at the *entrance* — the party's side; sanctity retreated toward
the door years ago. Bone-wall cover tiles (broken pews of femur and jaw).
Rule line: "The piles feed them. The aisle is a supply line — cut it."

### Battlefield — The Black Conclave (9×6)
Round chamber. Corpse piles ring the walls (his pantry). A desecrated altar
at center — the Pope stands on it and casts from it. One holy_ground tile
survives near the entrance, flickering. Rule line: "Everything that dies in
this room is a hiring opportunity."

### Chapter mechanic introduced
**Terrain creation** (Tender adds piles) — the board state degrades. First
chapter where the map itself is an enemy resource to be denied. **Corpse
economy** (the Pope) — killing enemies in the wrong order or wrong place
arms the boss.

---

## CHAPTER IV — The Iron Feast
*The Iron Marches · Danger: Dire*
*Faction: The Iron Covenant · Boss: The Contract-King*

### Story
North of the catacombs the dead are not eaten. They are **collateral**. The
Iron Covenant learned that an oath survives the body that swore it, and built
an economy on the corpse-backed bond. Soldiers who died owing service are
auctioned by the crate. A dead man's sworn word, extracted and hammered into
an oath-ring, is legal tender.

Their king preaches a clean doctrine: *there is no god above your own
appetite, and appetite must be notarized.* Indulgence, itemized. Compassion
spent only where it profits. He signed his own soul over to himself and
considers this the only honest religion ever practiced.

**Mission 1 — The Corpse Auction** *(patron: Chan, who wants Lot 44 and will
not say why)*
Infiltrate the Weighing — a corpse auction in a drowned mead-hall. Mid-fight,
the Auctioneers keep bidding: party members get **priced** (marked), and
enemies hit priced targets harder. Kill the auctioneers to close the book.
*Cocoli's request: let Lot 44 stay sold.* (Chan tension spikes either way —
first mission where two patrons want opposite things.)

**Mission 2 — The Oath-Mill** *(patron: a dead soldier's widow, paying in
nothing)*
A watermill that grinds oaths out of interred bodies. Destroy the millstones
(destructible terrain objectives — first fight won by breaking tiles, not
bodies). Every round the mill turns, a fresh Oath-Dead walks off the line.

**Mission 3 — The Contract-King**
The throne is a scale. He sits on one pan. Everything he owns sits on the other.

### Enemies (new)
- **Oath-Dead Halberdier** — draugr line troop. **Mechanic: Unfinished Oath —
  the first time it dies, it stands back up next round at 40% HP** ("the oath
  is not discharged"). Killing it on an oath_stone tile, or while it is
  feared, discharges the oath: it stays down. Teaches kill-confirmation and
  positioning.
- **Seiðr Auctioneer** — support caster. *Open Bidding*: marks a party member
  (priced); all enemies deal +15% to priced targets. *Gavel*: converts one
  enemy's debuff into a party debuff ("reassigned liability").
- **Vault-Wight** — heavy. Carries a strongbox grafted to its spine. Takes
  25% reduced damage while any Auctioneer lives ("insured"). Drops bonus gold
  on death — always. Greed bait: overextending toward it is how parties die.
- **Tithe Hound** — fast flanker, low HP. Pack tactics: +damage per other
  Hound adjacent to the target.

### Boss — The Contract-King
Draugr king, oath-ring reforged around his neck because his wrists rotted
off. ~230 HP. Immune to fear. **Sits on the scale-throne and does not move —
ever.** His reach is the whole field (chains, clauses).

- **Phase 1 — Terms & Conditions:** *Clause Strike* (ranged, applies
  **lien**), *Collateral Call* (pulls a party member 2 tiles toward the
  throne — forced movement used *against* the player before they get it).
- **Phase 2 (50% HP) — Renegotiation:** he tears up the field. **The
  battlefield's terrain re-rolls mid-fight** (reuses the skirmish
  omen/terrain tech): cover moves, oath_stones flip to auction_blocks. Log
  line: "The King rewrites the venue. Read the new terms."
- **Phase 3 (20% HP) — Final Clauses:** every priced/liened/marked status in
  play detonates at once. Clean parties feel nothing; sloppy parties get the
  full invoice.

### Battlefields
- *The Weighing* (9×6): auction_block tiles (priced units on them take +20%),
  oath_stone tiles (units standing here cannot flee or be feared — oaths
  bind *both* sides; the player can use them to no-sell fear).
- *The Oath-Mill* (12×6, Knight-pit sized): two millstone objective tiles
  (HP 60 each), a conveyor row that spawns Oath-Dead while either stone turns.
- *The Scale-Throne* (10×7): the throne at the far end; chain_trench moat
  reused from the Knight fight — the Covenant taught the Knight everything.

### Chapter mechanics introduced
**Revive-once enemies** (kill confirmation) · **destructible objectives** ·
**forced movement** (boss-side first; the party earns push/pull tools in V) ·
**mid-fight terrain re-roll** (boss phase).

---

## CHAPTER V — The Hollow Choir
*The Bone Wells / The Sunken Monastery · Danger: Forbidden*
*Faction: The Hollow Choir · Boss: The Choir Beneath the Skin*

### Story
Beneath the wells there is a monastery, and beneath the monastery there is a
**Root**, and the Root keeps a book. The book is not read. The book reads
*you* — and what it reads, it keeps. The Hollow Choir are what remains of
people whose names were read out of them: bodies in perfect working order
with nothing left to want. They wear the identities of the failed dead the
way monks wear habits. Their liturgy: *do what thou wilt* — sung by things
with no will left, in voices borrowed from people who had too much.

This is Sjen's chapter. He opened something down here years ago. The bargains
were made in Lucian's name. He is not sorry.

**Mission 1 — The Dead Alphabet** *(patron: Sjen — the first time he asks for
anything)*
Twenty-six bodies, each one a letter. Assembled, they spell any true name in
Veyrath. Sjen says destroy them. Sjen is lying about the order of operations.
Escort/destroy mission: burn letter-bodies (objective tiles) while the Choir
sings them back. **Every letter burned raises Lucian–Sjen tension** — the
player is spending relationship as ammunition and can feel it.
*Cocoli's request: burn the letter that spells her.* (It's here. She wants
out of the book. First direct hint of VII.)

**Mission 2 — The Nameless Font** *(patron: no one — the mission takes YOU)*
Descend the Bone Wells. At the bottom, the font shows the party what it
already archived: **the fight is against doubles of your own party** — same
abilities, same stats, wearing their faces slightly wrong. False Lucian
opens with Blood Command; False Veato backstabs; False Sjen casts what Sjen
has actually unlocked this run (mirrors the live loadout — reuse of
progression data, terrifying and cheap to build).
Doubles have one tell: they never banter. The silence is the horror.

**Mission 3 — The Choir Beneath the Skin**
The Root's mouth. End the song, or learn the verse with your name in it.

### Enemies (new)
- **Letter-Husk** — objective body. Doesn't attack. HP 30. While alive, feeds
  the Choir's casters (+1 hex power each). The fight is about which letters
  you can afford to leave standing.
- **Name-Eater** — caster. *Unwrite*: applies **Silence** (new status: target
  may only use its basic ability, 2 turns). The first hard counter to
  ability-reliant parties. Silence is loud in the log: "The word for 'arrow'
  is taken from Veato's mouth."
- **Skin Choralist** — melee. Each kill it lands, it *becomes* the victim
  cosmetically (sprite-swap mechanic) and gains one of their abilities.
  Feeds on wretches and summons first if the player offers them.
- **False Party** (doubles) — mission 2 only. Live-mirrored loadouts.

### Boss — The Choir Beneath the Skin
Not one body. A congregation-shaped hole in the air where 333 voices stand
too close together. ~260 HP across the fight. Immune to fear, psychosis.

- **Phase 1 — The Verse of Hands:** fights with stolen abilities — it opens
  with *Cleave*, *Venom Arrow*, *Rot Hex*. The party fights a collage of
  itself.
- **Phase 2 (66% HP) — The Verse of Names:** each round, **Silences the
  party member who dealt the most damage last round** ("the Choir learns the
  verse of your best weapon"). Rotating threat: the player must spread
  damage or lose their carry.
- **Phase 3 (33% HP) — The Verse of Sjen:** it sings Sjen's true name.
  **If Lucian–Sjen tension ≥ 65: Sjen turns and fights for the Choir for 2
  rounds** (the betrayal system detonates inside a boss fight — the whole
  campaign's tension management becomes one payoff moment). If tension < 65,
  Sjen spits the name back: he takes 20 damage, the Choir loses its turn,
  and the log gets the best line in the game: *"Sjen: 'I know what I am.
  You're late.'"*

### Battlefields
- *The Scriptorium* (9×6): letter-body objective tiles; echo_well tiles
  (hexes cast from them hit twice at half power); unwritten_ground patches
  (standing there: your abilities cost +1 cooldown — the Root unlearns you).
- *The Font* (7×7, symmetric): mirrored layout, party enters both sides.
- *The Root's Mouth* (10×7): concentric rings of unwritten_ground closing
  inward each phase — the arena literally shrinks the fight toward melee.

### Chapter mechanics introduced
**Silence status** · **mirror fights (live loadout copies)** ·
**tension-triggered boss phase** · **the party gains its first forced-move
tool here** (story-earned: Lucian tears a name loose — *Tyrant's Grip* gains
"pull 2 tiles", Cleave gains knockback 1; the audit's push/pull lands as a
chapter reward, not a patch note).

---

## CHAPTER VI — Carrion Ascendant
*The Crownward Plane · Danger: Absolute*
*Faction: all of them, collapsing · Boss: The Unwritten*

### Story
Seven slivers. The White Silence worn thin as a fontanelle. The Crown was
never a crown — it is the **axle-pin of the wheel of return**, pulled out
nineteen years ago and driven into the world like a nail. Every plane that
souls should pass through has silted into this one: the hungry-ghost realm
in Marrowfen's plague pits, the oath-hells under the Iron Marches, the realm
of gods reduced to a Choir with no one inside it. Nothing moves between
planes because there is no *between* anymore. Veyrath is not a world. It is
a blockage.

The tree at the center of the Crownward Plane is dead but load-bearing.
Its rings are the old planes, stacked. Lucian climbs — not to heaven;
to the *mechanism*.

**Mission 1 — The Wheel, Jammed** *(patron: the Black Tithe itself)*
The approach. Everything the company killed is still here — where would it
have gone? **Wave fight** (skirmish wave tech graduates to campaign):
Congregants, Oath-Dead, Choralists, then *echo-bosses* — the Knight, the
Warden, the Saint at 40% strength, one per wave, wearing the labels of debts
already paid. Rule line: "You paid these debts. The wheel kept the receipts
and nothing else."

**Mission 2 — Ring by Ring** *(patron: Cocoli, openly, for the first time)*
Climb the dead tree. Three consecutive fights on three ring-battlefields,
no full heal between (poultices and Cocoli only) — the campaign's endurance
exam. Each ring rolls an **omen against the party** (enemy-side skirmish
omens reused as ascending pressure). Cocoli walks beside the party the whole
climb, visible, silent, counting.

**Mission 3 — The Unwritten**
The top of the tree. The throne of the wheel. It is empty. It was always
empty. The Crown does not need a wearer — it needs a *debtor*, and the thing
that answers is shaped like whatever is owed the most. It reads the run:
your corruption, your scars, your betrayals, and builds the final boss out
of the ledger.

### Boss — The Unwritten
~300 HP, three forms. **The forms are assembled from the player's own save:**
- **Form 1 — What You Fed:** attacks with the party's three highest-ranked
  sins as abilities (Wrath rank 3 = its crit engine; Deceit = it dodges;
  Gluttony = it heals on hit). The build the player made is the first wall.
- **Form 2 (60%) — What You Broke:** summons echoes of party members who
  died or fled this run (scar/betrayal records become units). A clean run
  faces nothing here — the phase *skips* — the single biggest reward for
  careful play in the game.
- **Form 3 (25%) — What You Owe:** the Crown itself, a ring of teeth around
  an absence. Every round, it offers the **Final Bargain** on-screen: *"Take
  the throne. End the fight."* Accepting = instant victory = worst ending.
  Refusing it five rounds while it burns the field down = the wheel ending.

### Endings (chosen in play, not in a menu)
1. **The Carrion Crown** — accept the bargain. Lucian becomes the axle. The
   wheel turns again — through him, with interest. (Tagline fulfilled: *you
   became the worst thing in it.*)
2. **The Broken Wheel** — refuse five rounds and destroy the throne. Every
   soul passes at once, including everything that kept the party alive:
   sins reset, corruption zeroed, ascended forms dissolve mid-cutscene.
   Freedom, at cost of everything the player built. New Game+ hook.
3. **The Seventh Wage** — only if all 7 slivers were returned to Cocoli:
   see Chapter VII.

### Chapter mechanics introduced
**Wave campaign fights** · **echo-bosses** · **multi-fight gauntlet without
reset** · **save-reactive final boss** · **in-combat ending choice**.

---

## CHAPTER VII — The White Silence *(hidden epilogue)*
*Between · Danger: —*
*Faction: none. Boss: What You Left Standing*

Unlocked by the Seventh Wage ending, or after the player has died 7 times
across the campaign (either way: seven crossings).

### Story
The White Silence was never an afterlife. It is a **ferry dock**, and Cocoli
is the last ferryman — psychopomp, valkyrie, yamadūta, the job has had many
uniforms — unpaid for nineteen years, forbidden to leave until the fares are
settled. The slivers were never power. They are **wages**. She could not ask
for them; a ferryman may not beg. So she watched a mercenary company murder
its way toward the mechanism and quietly invoiced the ruin.

She cannot pass either. That is the true shape of the broken wheel: even
the thing whose job is *passage* is stuck. Moksha refused at the door.

**Mission — Seven Wages** *(patron: Cocoli, and this time she says please)*
One fight. The dock, 8×5, white on white, no terrain but seven mooring-post
tiles. **The enemies are the player's scars** — every scar earned across the
campaign stands up as a unit (fewer deaths = a smaller, sadder fight; a
seven-death run faces an army of its own mistakes).

### Boss — What You Left Standing
Whoever the ledger says. The fight is generated from final tension values:
- Lucian–Sjen ≥ 65 at campaign's end: Sjen is here, ascended, wearing the
  Choir's verse like a stole.
- Lucian–Veato ≥ 65: Veato, with an arrow he has been saving since Chapter I.
- Both below 65: **no boss.** The dock is empty. Cocoli takes her wages,
  nods once, and the last log line of the game is: *"The ferry leaves.
  For the first time in nineteen years, somebody paid full fare."*

The best ending in the game is the absence of a fight, and it can only be
earned by four chapters of managing two relationships the game constantly
tempts you to spend.

---

## New engine work required (rolled up, in build order)
1. **Silence status** (V) — small: gate non-basic abilities in resolveAbility.
2. **Push/pull on hit** (IV enemies, V party reward) — moveUnit already exists; add displacement to 3 abilities.
3. **Revive-once mod** (IV) — flag in kill(), like corpsePileOnDeath.
4. **Boss phase triggers** (III–VI) — HP-threshold hooks in hit()/kill(), per-boss script table.
5. **Objective tiles with HP** (IV, V) — units with `inert: true` that don't act.
6. **Terrain creation/re-roll mid-fight** (III Tender, IV boss) — field.tiles is already plain data; mutate + event.
7. **Wave spawning** (VI, and skirmish wave mode ships early as the testbed).
8. **Mirror units from live loadout** (V) — mkUnit from party templates + progressionAbilities.
9. **Save-reactive boss assembly** (VI) — reads sins/scars/tension; all plain data.
10. **Scar-units + tension-boss** (VII) — same tech as 8/9.

Skirmish gets each system one chapter early as the live testbed — waves
before VI, silence-omens before V, draugr before IV. Skirmish is the lab.
