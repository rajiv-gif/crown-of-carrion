import React from 'react';
import Silhouette from './Silhouettes.jsx';
import StatusIcon from './StatusIcon.jsx';
import FloatingText from './FloatingText.jsx';

// Maps ability ids → actor animation class. (Audio hook: if sound is added
// later, trigger impact/cast SFX from these same event diffs.)
const ANIM = {
  cleave: 'act-heavy',
  execute: 'act-heavy',
  heavy_blow: 'act-heavy',
  chain_lash: 'act-heavy',
  collect_the_debt: 'act-heavy',
  blood_command: 'act-shout',
  compounding_interest: 'act-shout',
  tyrants_grip: 'act-shout',
  rot_hex: 'act-cast',
  bone_ward: 'act-cast',
  debt_of_flesh: 'act-cast',
  summon_wretch: 'act-cast',
  whispering_pact: 'act-cast',
  backstab: 'act-dash',
  hidden_knife: 'act-dash',
  smoke_step: 'act-vanish',
  poison_blade: 'act-slash',
  crippling_cut: 'act-slash',
  claw: 'act-slash',
  rusted_blade: 'act-slash',
  plague_bite: 'act-slash',
  gnaw: 'act-slash',
};

// Maps the ability that landed a hit → impact VFX class on the target.
const VFX = {
  cleave: 'vfx-slash vfx-red',
  execute: 'vfx-burst vfx-red',
  chain_lash: 'vfx-slash vfx-red',
  collect_the_debt: 'vfx-burst vfx-red',
  poison_blade: 'vfx-slash vfx-green',
  backstab: 'vfx-slash vfx-green',
  hidden_knife: 'vfx-slash vfx-green',
  plague_bite: 'vfx-slash vfx-green',
  crippling_cut: 'vfx-slash vfx-low',
  rot_hex: 'vfx-burst vfx-purple',
  whispering_pact: 'vfx-burst vfx-purple',
  debt_of_flesh: 'vfx-burst vfx-purple',
};

export default function BattleUnit({ u, fx, isCurrent, targetable, onClick }) {
  const cast = fx.find((e) => e.k === 'cast' && e.actor === u.uid);
  const incoming = fx.filter((e) => e.k === 'hit' && e.unit === u.uid);
  const floats = fx.filter((e) => e.unit === u.uid && ['hit', 'float', 'dot', 'status'].includes(e.k));
  const bubble = fx.find((e) => e.k === 'bubble' && e.unit === u.uid);
  const gripped = fx.some((e) => e.k === 'cast' && e.target === u.uid && e.ability === 'tyrants_grip');
  const hexed = fx.some((e) => e.k === 'cast' && e.target === u.uid && e.ability === 'rot_hex');
  const warded = fx.some((e) => e.k === 'cast' && e.target === u.uid && e.ability === 'bone_ward');
  const smoked = fx.some((e) => e.k === 'cast' && e.actor === u.uid && e.ability === 'smoke_step');
  const summoned = fx.some((e) => e.k === 'summon' && e.unit === u.uid);
  const dominated =
    u.side === 'party' && u.key !== 'lucian' && fx.some((e) => e.k === 'cast' && e.ability === 'blood_command');
  const vfxHit = incoming.find((e) => VFX[e.ability]) || incoming[0];

  const has = (t) => u.statuses.some((x) => x.type === t);

  const cls = [
    'bunit',
    u.side,
    u.boss ? 'boss' : '',
    u.key === 'wretch' ? 'wretch' : '',
    !u.alive ? (u.fled ? 'is-fled' : 'is-down') : '',
    isCurrent ? 'is-current' : '',
    targetable ? 'is-targetable' : '',
    cast ? ANIM[cast.ability] || 'act-slash' : '',
    incoming.length ? 'is-hit' : '',
    dominated && !cast ? 'is-dominated' : '',
    summoned ? 'is-summoned' : '',
    has('shield') ? 'st-warded' : '',
    has('dodge') ? 'st-smoked' : '',
    has('fear') ? 'st-trembling' : '',
    has('stun') ? 'st-stunned' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} onClick={targetable ? onClick : undefined}>
      {bubble && <div className="speech-bubble">{bubble.text}</div>}
      <div className="float-stack">
        {floats.map((e, i) => (
          <FloatingText key={e.id} e={e} idx={i} />
        ))}
      </div>
      <div className="sprite-wrap">
        <div className="turn-ring" />
        <div className="target-ring" />
        <Silhouette name={u.sprite} />
        {vfxHit && u.alive !== undefined && <div className={`vfx ${VFX[vfxHit.ability] || 'vfx-impact'}`} />}
        {gripped && <div className="vfx vfx-grip" />}
        {(hexed || summoned) && <div className="vfx vfx-sigil" />}
        {warded && <div className="vfx vfx-ward" />}
        {smoked && <div className="vfx vfx-smoke" />}
      </div>
      <div className="bunit-plate">
        <div className="bunit-name" style={{ color: u.color }}>
          {u.name}
        </div>
        <div className="hpbar">
          <div className="hpbar-fill" style={{ width: `${Math.max(0, (u.hp / u.maxHp) * 100)}%` }} />
          <span className="hpbar-text">{u.fled ? 'gone' : `${Math.max(0, u.hp)}/${u.maxHp}`}</span>
        </div>
        <div className="bstatus-row">
          {u.statuses.map((st, i) => (
            <StatusIcon key={`${st.type}${i}`} st={st} />
          ))}
        </div>
      </div>
    </div>
  );
}
