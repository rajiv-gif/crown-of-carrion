// All narrative content: speakers, factions, items, scars, Cocoli, and dialogue scripts.
//
// Node shape:
//   { speaker, text, effects?, choices?: [{ text, effects?, next }], next?, action? }
// action: { combat: encounterId, then: nodeId } | { map: true } | { aftermath: true }
// effects: { gold, corruption, rep: {factionId: n}, tension: {pairId: n},
//            item: itemId, flag: {key: value}, whisper: true, shard: true }

export const SPEAKERS = {
  narrator: { color: 'var(--bone-dim)', sigil: '', cls: 'narrator' },
  Lucian: { color: 'var(--blood-bright)', sigil: '✠' },
  Sjen: { color: 'var(--hex)', sigil: '☽' },
  Veato: { color: 'var(--poison)', sigil: '‡' },
  Chan: { color: 'var(--gold)', sigil: '§' },
  Chibi: { color: 'var(--pale)', sigil: '◈' },
  Cocoli: { color: 'var(--pale)', sigil: '◌', cls: 'cocoli' },
  'The Envoy': { color: 'var(--gold)', sigil: '✉' },
  'Elder of Marrowfen': { color: 'var(--bone)', sigil: '✕' },
  'The Debt-Bound Knight': { color: 'var(--rust)', sigil: '✥' },
};

export const FACTIONS = {
  ashen_church: {
    name: 'The Ashen Church',
    desc: 'Sells absolution, fixes souls inside relics, and calls punishment a form of passage.',
  },
  plague_barons: {
    name: 'The Plague Barons',
    desc: 'Diseased nobility whose blood contracts make obligation survive the debtor’s body.',
  },
  iron_covenant: {
    name: 'The Iron Covenant',
    desc: 'A war market whose oaths remain enforceable after death. Lucian still owes them dues.',
  },
  hollow_choir: {
    name: 'The Hollow Choir',
    desc: 'Occultists who pull failed souls from the Root-Beneath and lend them living mouths.',
  },
};

export const TENSION_PAIRS = {
  lucian_sjen: { label: 'Lucian ⟷ Sjen' },
  lucian_veato: { label: 'Lucian ⟷ Veato' },
  sjen_veato: { label: 'Sjen ⟷ Veato' },
};

export const ITEMS = {
  relic_shard: {
    id: 'relic_shard',
    name: 'Sliver of the Carrion Crown',
    desc: 'Warm. Listening. Not a jewel but a pressure from elsewhere, gathering trapped voices toward one will. +2 ATK.',
    atk: 2,
  },
  tithe_ledger: {
    id: 'tithe_ledger',
    name: 'The Sealed Tithe Ledger',
    desc: 'Seven years of debt written against bodies, descendants, and whatever survives them. Leverage. +10 max HP.',
    hp: 10,
  },
  chan_contract: {
    id: 'chan_contract',
    name: "Chan's Profitable Contract",
    desc: 'A partnership agreement with seventeen punishments for breach and no definition of partnership. +1 ATK.',
    atk: 1,
  },
  faceless_reliquary: {
    id: 'faceless_reliquary',
    name: 'Reliquary of the Faceless Saint',
    desc: 'A locked glass mouth holding a soul that the Church prevented from passing. Its absolutions sound like threats. +8 max HP.',
    hp: 8,
  },
  demon_tooth: {
    id: 'demon_tooth',
    name: 'Dogma Demon Tooth',
    desc: 'Still hot from the jaw. Proof that doctrine can be made to bleed. +2 ATK.',
    atk: 2,
  },
  black_indulgence: {
    id: 'black_indulgence',
    name: 'Black Indulgence Seal',
    desc: 'Chan insists it is worthless, then locks it in the strongest box. +12 max HP.',
    hp: 12,
  },
  ash_crown_splinter: {
    id: 'ash_crown_splinter',
    name: 'Ash-Crown Splinter',
    desc: 'A holy trinket that gave up pretending. It bites the hand that keeps it. +1 ATK, +6 max HP.',
    atk: 1,
    hp: 6,
  },
};

// Revival consequences, applied in order of death count. Stats apply to Lucian.
export const SCARS = [
  {
    id: 'pale_brand',
    name: 'The Pale Brand',
    desc: 'A white handprint over the heart. Where she touched him, the flesh stays cold. The cold is becoming useful. (+2 ATK, +5 Corruption)',
    atk: 2,
    corruption: 5,
  },
  {
    id: 'borrowed_breath',
    name: 'Borrowed Breath',
    desc: 'Some of what came back is lighter than what died. (−10 max HP, +3 Speed)',
    hp: -10,
    speed: 3,
  },
  {
    id: 'grave_light',
    name: 'Grave-Light Eyes',
    desc: 'Things that have died once recognize each other. Enemies begin every battle afraid.',
  },
];

// Indexed by (deaths - 1), clamped to the last entry.
export const COCOLI_LINES = [
  'You reached the broken road with rage in your mouth. I turned you back. Do not mistake interruption for mercy.',
  'Again. Your soul remembers less of the road each time. The Crown remembers more.',
  'I do not save you, Lucian. I return you. Salvation would require somewhere left to go.',
  'You mistake survival for permission.',
  'Even rot dreams of becoming eternal. There was a height this world could once reach. I remember it. I will not tell you how.',
];

export const WHISPERS = [
  'ONE OF SEVEN. BRING ME THE REST. BE WORSE.',
  'TWO OF SEVEN. MERCY HAS A FACE. REMOVE IT.',
];

// Choice flags → aftermath reactions.
export const AFTERMATH_REACTIONS = {
  slaughter: {
    title: 'The Lesson',
    summary:
      'Marrowfen is a noise the wind makes now. Word will travel — it always travels — and the next village will pay before the Black Tithe dismounts.',
    sjen: '“Wasteful,” Sjen says, pocketing vertebrae anyway. “The dead are only useful fresh.”',
    veato: '“Magnificent. We massacred a creditor’s assets for free.” Veato counts the purse twice, as if grief might have made it heavier.',
  },
  sell: {
    title: 'Payment in Flesh',
    summary:
      'Forty-one souls walk chained toward Vessik’s pits. The Baron pays well for fresh stock, and the Black Tithe’s name now opens doors in the lowlands — the kind of doors with locks on the outside.',
    sjen: '“Vessik will work them into the pits within a month.” Sjen does not say it like an objection. He says it like an inventory.',
    veato: 'Veato weighs the Baron’s gold and smiles at nothing. “Honest work. My favorite kind of lie.”',
  },
  betray: {
    title: 'The Debt Changes Hands',
    summary:
      'Vessik’s paper burns in the chapel brazier. The Plague Barons do not forgive defaults — but then, Lucian was never planning to be forgiven. He was planning to be feared.',
    sjen: 'Sjen watches Lucian carry the sliver and does not blink for a long time. “Keep it close,” he says. He means: where I can see it.',
    veato: '“We just defaulted on a Plague Baron.” Veato laughs, high and unwell. “I should triple my rates. I should leave. I won’t. But I should.”',
  },
  ritual: {
    title: 'What the Saint Said',
    summary:
      'The saint spoke. Sjen listened. He has shared one name and kept the other like a coin sewn into a coat lining. The candles in camp burn a color that has no name, now, when he sleeps.',
    sjen: 'Sjen is almost civil for an entire evening. It is the most frightening thing he has ever done.',
    veato: '“He talked to a corpse and the corpse answered, and we’re all just — fine with that. Good. Wonderful. I’ll take first watch. Forever.”',
  },
  deal: {
    title: 'The Buyer',
    summary:
      'Gold, and a name, and a warning that arrived exactly when it was most profitable to Veato that it arrive. The Iron Covenant now knows the Crown is real. So does whoever the Covenant sells to next.',
    sjen: '“You sold knowledge of the Crown to a guild of invoice-writers.” Sjen’s voice could etch glass. “When this kills us, I will not be surprised. I will be cited.”',
    veato: 'Veato is briefly, suspiciously generous at the toll bridge. He even pays for Sjen. Nobody asks what else he sold.',
  },
};

export const SCRIPTS = {
  // ───────────────────────── INTRO ─────────────────────────
  intro: {
    start: 'i1',
    nodes: {
      i1: {
        speaker: 'narrator',
        text:
          'Veyrath. Nineteen years since the sun went pale. The crops come up black, the bells ring for no one, and the churches pray to saints who answer in the wrong voices. The old emperor is dead. Death has gone wrong in ways nobody can tax cleanly. The thing he sat beneath — the Carrion Crown — has gone into the world like marrow into soil. Every tyrant left alive is digging.',
        next: 'i2',
      },
      i2: {
        speaker: 'narrator',
        text:
          'South of the Cinder Road, three riders shelter in the ribs of a burned chapel. The Black Tithe. Mercenaries. Feared in small places. Unpaid in all of them.',
        next: 'i3',
      },
      i3: {
        speaker: 'Veato',
        text:
          'Four days without a contract. I’ve started pricing your horse, Lucian. The meat, I mean. The animal itself is worthless. Like most of what you own.',
        next: 'i4',
      },
      i4: {
        speaker: 'Lucian',
        text:
          'Touch the horse and I’ll have Sjen stitch your hands to your face. He needs the practice. His last seam tore open at the funeral.',
        next: 'i5',
      },
      i5: {
        speaker: 'Sjen',
        text:
          'I am not your surgeon. I am the only reason the last three things we killed stayed dead. A little reverence would not bankrupt you—',
        next: 'i6',
      },
      i6: {
        speaker: 'Lucian',
        text:
          'Reverence is for gods, Sjen, and the gods are dead or hiding. You are a man who reads to corpses. Sit down.',
        effects: { tension: { lucian_sjen: 5 } },
        next: 'i7',
      },
      i7: {
        speaker: 'narrator',
        text:
          'A rider comes through the ash before dawn. Velvet mask. Perfumed gloves over fingers that move wrong, like wet rope. An envoy of Baron Vessik — one of the Plague Barons, the diseased nobility who rule the lowlands through debt, infection, and patience.',
        next: 'i8',
      },
      i8: {
        speaker: 'The Envoy',
        text:
          'The Baron holds paper on the village of Marrowfen. Seven years of tithe, unpaid. You will collect what is owed. Coin, grain, or flesh — His Pestilence is flexible on currency. He is less flexible on punctuality.',
        choices: [
          {
            text: '“Double the fee. The Black Tithe doesn’t haggle, and it doesn’t ask twice.”',
            effects: { gold: 30, rep: { plague_barons: -5 }, tension: { lucian_veato: -5 }, flag: { bargain: 'hard' } },
            next: 'i9',
          },
          {
            text: '“We’ll collect. Every coin, every grain, every pound of it.”',
            effects: { rep: { plague_barons: 5 }, flag: { bargain: 'clean' } },
            next: 'i9',
          },
          {
            text: 'Seize the envoy’s gloved hand and squeeze until the rot weeps through the velvet. “Payment first.”',
            effects: { gold: 25, corruption: 3, rep: { plague_barons: -10 }, flag: { bargain: 'fear' } },
            next: 'i9',
          },
        ],
      },
      i9: {
        speaker: 'narrator',
        text:
          'The envoy leaves a purse and a name. Marrowfen. A debt of seven years, to be collected by three monsters, from a village that has nothing left to give but the lesson of what happens when you stop giving.',
        next: 'i10',
      },
      i10: {
        speaker: 'Lucian',
        text:
          'Saddle up. Sjen, bring the knives that whisper. Veato — bring the ones that don’t.',
        action: { map: true },
      },
    },
  },

  // ───────────────────── THE ASHEN TITHE ─────────────────────
  ashen_tithe: {
    start: 'a1',
    nodes: {
      a1: {
        speaker: 'narrator',
        text:
          'The Ash Roads are not roads so much as wounds that learned direction. Every shrine divides the hungry into clean and unclean. Every bell tells one village that the next village deserves less bread. The miracle of the Ashen Church is not faith. It is permission.',
        next: 'a2',
      },
      a2: {
        speaker: 'narrator',
        text:
          'At the first toll shrine waits a wagon built like a locked account: black iron over patched wood, scales hanging beneath a mounted crossbow, every drawer chained twice. Its merchant counts smoke-stained coins while two families spit at each other across a painted line neither side remembers drawing.',
        next: 'a3',
      },
      a3: {
        speaker: 'Chan',
        text: 'Late. Under-equipped. Loud. Good. I can profit from all three.',
        effects: { flag: { chan_joined: true }, item: 'chan_contract', gold: -35, tension: { lucian_veato: 4, lucian_sjen: 3 } },
        next: 'a4',
      },
      a4: {
        speaker: 'Veato',
        text:
          'He charged us before introducing himself. Lucian, I hate him. Professionally, I am learning.',
        next: 'a5',
      },
      a5: {
        speaker: 'Chan',
        text: 'Chan. I sell exits and expensive truths. The Church sells hatred. Business is excellent.',
        next: 'a6',
      },
      a6: {
        speaker: 'Sjen',
        text:
          'There is something under the shrine. No — someone. A voice pressed upward from the Root-Beneath. And something else behind him.',
        next: 'a7',
      },
      a7: {
        speaker: 'Chibi',
        text:
          'You kept the door phrase, Sjen. Good. I was starting to think you had become sentimental, which would have been disgusting.',
        next: 'a8',
      },
      a8: {
        speaker: 'narrator',
        text:
          'Chibi does not climb out like a rescued man. He returns like a knife returned to its owner. Two blades, three stolen rosaries, and a red-and-gold reliquary wrapped under his coat. Inside it sit three bone-white stones shaped almost like butchered wings, sweating holy oil and old heat: K.F.G., the Kul Fra Gem. Sjen sees it and goes very still.',
        next: 'a9',
      },
      a9: {
        speaker: 'Chibi',
        text:
          'Ai Sjen... mi fen eng... I found it, Sjen. K.F.G. Kul Fra Gem. Do not ask what followed me back. It is important. It is not for them.',
        next: 'a10',
      },
      a10: {
        speaker: 'Sjen',
        text:
          'Hm.. Sang? You should not have been able to carry that. You should not have survived touching it.',
        next: 'a11',
      },
      a11: {
        speaker: 'Chibi',
        text:
          'I am small. Dangerous entities forget to lock doors for people like me. Besides, it smelled like dinner in a church basement. I trusted it immediately, which means I did not trust it at all.',
        next: 'a12',
      },
      a12: {
        speaker: 'narrator',
        text:
          'The Kul Fra Gem opens without opening. The three stones turn in their oil, wing, thigh, heart, each one a missing lock in Sjen’s blood. He inhales once. Every candle bends toward him. For one breath, a wound opens between Veyrath and the place below it, and something under his skin recognizes the route.',
        choices: [
          {
            text: 'Make Sjen a Hex Master — deeper curses, spreading rot, control through ruin.',
            effects: {
              flag: { chibi_joined: true, sjen_specialization: 'hex_master', chibi_hidden_recruit: true },
              tension: { lucian_sjen: 6, sjen_veato: 4 },
              corruption: 4,
              whisper: true,
            },
            next: 'a13',
          },
          {
            text: 'Make Sjen an Invoker — partial demon change, brutal strength, elemental violence.',
            effects: {
              flag: { chibi_joined: true, sjen_specialization: 'invoker', chibi_hidden_recruit: true },
              tension: { lucian_sjen: 8, sjen_veato: 5 },
              corruption: 7,
              whisper: true,
            },
            next: 'a14',
          },
        ],
      },
      a13: {
        speaker: 'Sjen',
        text:
          'Hex, then. Names rot first. Bodies follow because they lack imagination.',
        next: 'a15',
      },
      a14: {
        speaker: 'Sjen',
        text:
          'Invocation, then. Only partial. If it finishes becoming me, kill everyone else first.',
        next: 'a15',
      },
      a15: {
        speaker: 'Lucian',
        text:
          'If you slow us down, I leave you in the ash.',
        next: 'a16',
      },
      a16: {
        speaker: 'Chan',
        text: 'Two competent recruits. Almost enough to offset you.',
        next: 'a17',
      },
      a17: {
        speaker: 'narrator',
        text:
          'The ditch erupts in white robes. Flagellants, censer-knights, and Church taxmen come screaming from the ash. Behind them shamble reliquary husks: the dead, packed with doctrine until even rot has learned obedience. Half of the living attackers were neighbors yesterday. Today a priest renamed them pure and impure, and that was enough.',
        action: { combat: 'ash_road_ambush', then: 'a18' },
      },
      a18: {
        speaker: 'Chan',
        text: 'Hatred with paperwork. Predictable. You are welcome.',
        next: 'a19',
      },
      a19: {
        speaker: 'Chibi',
        text:
          'Sjen, the taxmen carried ash-script. The Church knows about the sliver. Someone sold them the shape of Lucian’s shadow. Also, the thing I brought you is hungry.',
        next: 'a20',
      },
      a20: {
        speaker: 'Sjen',
        text:
          'Then we go to Cindershrive and ask the saint which mouth taught them to despise each other.',
        action: { missionDone: 'ashen_tithe' },
      },
    },
  },

  saint_without_face: {
    start: 's1',
    nodes: {
      s1: {
        speaker: 'narrator',
        text:
          'Cindershrive burns without flame. Its streets are gray with kneeling crowds, its windows black with soot, its church doors plated in old confession. No one looks directly at Lucian’s hand. No one looks directly at anyone. The city has learned that suspicion is holiness.',
        next: 's2',
      },
      s2: {
        speaker: 'Chan',
        text: 'Call them filthy. Sell them clean names. Point at someone filthier. Old scam.',
        next: 's3',
      },
      s3: {
        speaker: 'Chibi',
        text:
          'Sjen, the walls are listening badly. Amateur work. Loud mouths, no discipline. They made a whole city into one stupid argument.',
        next: 's4',
      },
      s4: {
        speaker: 'Sjen',
        text:
          'Agreed. We cut through the gate. Quietly, if possible. Horribly, if not.',
        action: { combat: 'cindershrive_gate', then: 's5' },
      },
      s5: {
        speaker: 'narrator',
        text:
          'Beyond the gate is the Reliquary of the Faceless Saint: glass, iron, ash, and a choir of priests whose eyes have been sewn shut so mercy cannot distract them from doctrine.',
        next: 's6',
      },
      s6: {
        speaker: 'Lucian',
        text:
          'Open it.',
        next: 's7',
      },
      s7: {
        speaker: 'Chan',
        text: 'Fine. Become educational debris.',
        next: 's8',
      },
      s8: {
        speaker: 'narrator',
        text:
          'The reliquary opens. The saint inside has no face. Only a mouth, soft and red and impossibly awake, reciting every sin in the room in alphabetical order. Around it, the faithful begin accusing each other before the first command is even finished. Something horned and dead crawls from under the altar, made from all the hatred the Church told people was holy.',
        action: { combat: 'saint_without_face', then: 's9' },
      },
      s9: {
        speaker: 'narrator',
        text:
          'When the saint breaks, it does not bleed. A trapped life tears loose, circles the chamber, and falls back into the ash. It failed to leave. Then the corpse forgives. The word passes through the room like poison through a well. Beneath the glass, Lucian finds another sliver of crownmetal.',
        effects: { item: 'faceless_reliquary', shard: true, whisper: true, rep: { ashen_church: -35, hollow_choir: 10 }, corruption: 10 },
        next: 's10',
      },
      s10: {
        speaker: 'Sjen',
        text:
          'There was no revelation here. Only permission. They hated because someone blessed the hatred and gave it a schedule.',
        next: 's11',
      },
      s11: {
        speaker: 'Chibi',
        text:
          'Good. The saint was smug. I dislike smug things that are not Sjen.',
        next: 's12',
      },
      s12: {
        speaker: 'Chan',
        text: 'Two slivers. Five left. Our corpses are now premium goods.',
        next: 's13',
      },
      s13: {
        speaker: 'Lucian',
        text:
          'Let them price the pieces. I am getting more expensive.',
        action: { missionDone: 'saint_without_face' },
      },
    },
  },

  // ───────────────────── THE BUTCHER'S DEBT ─────────────────────
  butchers_debt: {
    start: 'm1',
    nodes: {
      m1: {
        speaker: 'narrator',
        text:
          'Marrowfen squats in its valley like something drowned and brought back wrong. The fields are black to the horizon. The bell tower leans. Behind the chapel, the plague pits are full — and recently turned.',
        next: 'm2',
      },
      m2: {
        speaker: 'Sjen',
        text:
          'There is no money here, Lucian. There is barely meat. The Baron knew this when he bought us.',
        next: 'm3',
      },
      m3: {
        speaker: 'Veato',
        text:
          'Then the contract was never about coin. It’s about the lesson. Barons pay better for lessons. They frame them.',
        next: 'm4',
      },
      m4: {
        speaker: 'Lucian',
        text: 'Then we teach.',
        next: 'm5',
      },
      m5: {
        speaker: 'Elder of Marrowfen',
        text:
          'We paid. We paid in our children. Tell the Baron the debt is settled — or come and count what’s left of us yourself.',
        next: 'm6',
      },
      m6: {
        speaker: 'Lucian',
        text:
          'The Baron counts in coin. I count in whatever is left when I’m done. Last chance to surprise me with a buried strongbox.',
        next: 'm7',
      },
      m7: {
        speaker: 'narrator',
        text:
          'They come instead with scythes and fence-stakes, and behind them, guards in Vessik’s colors — garrisoned here years ago, grey-skinned now, weeping at the eyes. The debt collects its collectors.',
        action: { combat: 'marrowfen_mob', then: 'm8' },
      },
      m8: {
        speaker: 'narrator',
        text:
          'When it is over, the square is quiet in the way only emptied places are quiet. Beneath the altar lies a dead saint, seven hundred years dry, her chest split from inside. The Church called her preserved. Sjen sees the truth: her soul never passed. Between the ribs, something dark has fed on that failure for centuries.',
        next: 'm9',
      },
      m9: {
        speaker: 'Sjen',
        text:
          'That is crownmetal. It grows where passage fails. Saints. Kings. Beasts. The Crown is feeding on souls that cannot leave, Lucian. This piece formed in her like a pearl around a scream.',
        next: 'm10',
      },
      m10: {
        speaker: 'Veato',
        text:
          'And Vessik sent us to collect “a debt” from the one village sitting on it. We’re not collectors, Lucian. We’re shovels. Shovels don’t get a share.',
        next: 'm11',
      },
      m11: {
        speaker: 'Lucian',
        text: 'Then let’s decide what the Baron actually paid for.',
        next: 'm12',
      },
      m12: {
        speaker: 'narrator',
        text:
          'The survivors of Marrowfen kneel in the square. The saint waits under the altar. The Black Tithe stands at the hinge of the day, and Lucian chooses which way the world breaks.',
        choices: [
          {
            text: 'Slaughter what’s left. Let Veyrath learn what the Black Tithe collects.',
            effects: {
              corruption: 15,
              rep: { ashen_church: -10, hollow_choir: 5 },
              tension: { lucian_veato: 8 },
              flag: { choice: 'slaughter' },
            },
            next: 'ma1',
          },
          {
            text: 'Chain the living. Vessik can take his payment in flesh.',
            effects: {
              gold: 120,
              corruption: 8,
              rep: { plague_barons: 20 },
              tension: { sjen_veato: 5 },
              flag: { choice: 'sell' },
            },
            next: 'mb1',
          },
          {
            text: 'Betray the Baron. The debt — and the sliver — just became Lucian’s.',
            effects: {
              rep: { plague_barons: -25, iron_covenant: 5 },
              item: 'tithe_ledger',
              flag: { choice: 'betray' },
            },
            next: 'mc1',
          },
          {
            text: 'Give Sjen his hour with the saint. The dead remember where the Crown sleeps.',
            lock: { pair: 'lucian_sjen', max: 80, note: 'Sjen no longer offers Lucian his discoveries.' },
            effects: {
              corruption: 12,
              rep: { hollow_choir: 15 },
              tension: { lucian_sjen: -10 },
              flag: { choice: 'ritual', sjen_pact: true },
            },
            next: 'md1',
          },
          {
            text: 'Let Veato make his call. The Iron Covenant pays triple for proof the Crown is real.',
            lock: { pair: 'lucian_veato', max: 80, note: 'Veato keeps his buyers to himself now.' },
            effects: {
              gold: 80,
              rep: { iron_covenant: 15 },
              tension: { lucian_veato: -10 },
              flag: { choice: 'deal', veato_deal: true },
            },
            next: 'me1',
          },
        ],
      },

      // Branch A — slaughter
      ma1: {
        speaker: 'narrator',
        text:
          'It does not take long. It never takes long; that is the obscenity of it. When the bell tower’s shadow reaches the well, Marrowfen is a rumor, and the Black Tithe is a story mothers will use to make children eat.',
        next: 'ma2',
      },
      ma2: {
        speaker: 'Veato',
        text:
          'Corpses don’t carry purses, Lucian. This is the second job in a row I leave poorer and stickier.',
        next: 'mk1',
      },

      // Branch B — sell
      mb1: {
        speaker: 'narrator',
        text:
          'Chains from the guardhouse. Forty-one survivors, roped throat to throat. The elder does not curse Lucian as the column forms. He only memorizes his face, the way drowning men memorize the shore.',
        next: 'mb2',
      },
      mb2: {
        speaker: 'Sjen',
        text:
          'Vessik will work them into the pits within a month. — That was arithmetic, Lucian, not conscience. Do not look so pleased.',
        next: 'mk1',
      },

      // Branch C — betray the Baron
      mc1: {
        speaker: 'narrator',
        text:
          'Lucian pries the sliver from the saint’s ribs with his thumb. It is warm. It taps against his palm like a heartbeat learning his name. In the brazier, seven years of Vessik’s paper curls into ash — all but the ledger Lucian keeps, because a burned debt is mercy, and a pocketed one is leverage.',
        next: 'mc2',
      },
      mc2: {
        speaker: 'Veato',
        text:
          'We just robbed a Plague Baron of his god-metal and his paperwork. Wonderful. When something is sent to kill us — and it is already saddled, Lucian, I promise you — I want it noted I said “wonderful” like this.',
        next: 'mk1',
      },

      // Branch D — Sjen's ritual
      md1: {
        speaker: 'narrator',
        text:
          'Sjen opens the saint’s jaw and reads from a dead alphabet carved behind her teeth. The rite does not summon her. It tears a narrow listening wound toward the Root-Beneath. The jaw moves. Several buried voices answer through it.',
        next: 'md2',
      },
      md2: {
        speaker: 'Sjen',
        text:
          'She says the Crown has six more seats, in six more bodies. I know two of the names now. One of them will interest you. The other one… I will keep, as my fee.',
        next: 'mk1',
      },

      // Branch E — Veato's deal
      me1: {
        speaker: 'narrator',
        text:
          'Veato is gone for an hour and returns smelling of someone else’s wine, with a heavier purse and a lighter conscience — though with Veato the conscience had no fixed weight to begin with.',
        next: 'me2',
      },
      me2: {
        speaker: 'Veato',
        text:
          'My buyer confirms it: crownmetal is real and the Covenant wants more. Also — a courtesy, free of charge — Vessik’s true collector is already on the road. He sends it when he intends to pay nobody at all. Including, dear colleagues, us.',
        next: 'mk1',
      },

      // Convergence — the Knight
      mk1: {
        speaker: 'narrator',
        text:
          'The bell in the leaning tower rings once. Nobody is pulling the rope. Down the causeway comes the Baron’s true collector — a knight grown into his armor like root into stone, chains threaded through the bone of him, dragging a ledger nailed to a dead man’s back.',
        next: 'mk2',
      },
      mk2: {
        speaker: 'The Debt-Bound Knight',
        text:
          'Debts are not settled. Debts are only moved. The Baron has written all three of you into the book. The sliver too. Everything is in the book, eventually.',
        next: 'mk3',
      },
      mk3: {
        speaker: 'Lucian',
        text: 'Then I’ll make my entry in blood. It’s the only ink I carry.',
        action: { combat: 'debt_bound_knight', then: 'mv1' },
      },

      // Victory
      mv1: {
        speaker: 'narrator',
        text:
          'The Knight comes apart like a ledger in the rain. Something leaves the armor, reaches for a road that is no longer there, and is pulled into the sliver instead. Lucian closes his hand around it before Sjen can warn him.',
        effects: { item: 'relic_shard', shard: true },
        next: 'mv2',
      },
      mv2: {
        speaker: 'narrator',
        text:
          'It is warm. It taps against his palm like a heartbeat learning his name. And then — a voice, no louder than a thought, patient as gangrene: ONE OF SEVEN. BRING ME THE REST. BE WORSE.',
        effects: { whisper: true },
        next: 'mv3',
      },
      mv3: {
        speaker: 'Sjen',
        text:
          '…It spoke through one sliver. The Crown is not a throne. It is a hand around the wheel. Whoever completes it will not rule the dying kingdoms. He will decide where every dead thing goes.',
        next: 'mv4',
      },
      mv4: {
        speaker: 'Lucian',
        text:
          'Then death has been badly managed. I do not want release, Sjen. I want the key.',
        action: { aftermath: true },
      },
    },
  },
};
