import React from 'react';
import { useGame } from '../App.jsx';
import { FACTIONS, TENSION_PAIRS } from '../data/story.js';
import { PARTY } from '../data/units.js';
import { tensionTier } from '../data/sins.js';
import { CHAPTERS, CAMPAIGN_TAGLINE, chapterStatus, chapterStatusText } from '../data/chapters.js';

const WARNING_SIGNS = {
  lucian_veato: 'Veato’s hand keeps drifting toward his hidden knife.',
  lucian_sjen: 'Sjen has stopped answering Lucian directly.',
  sjen_veato: 'Sjen and Veato have stopped insulting each other. That is the worst sign there is.',
};

function Meter({ value, min = 0, max = 100, tier }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={`meter ${tier ? `tier-${tier}` : ''}`}>
      <div className="meter-fill" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

function ChapterCard({ ch, g, dispatch }) {
  const status = chapterStatus(ch, g);
  const bossDown = ch.bossEncounter && g.defeatedBosses.includes(ch.bossEncounter);
  return (
    <div className={`mission chapter-card ${status}`}>
      <div className="mission-head">
        <span className="mission-region">Chapter {ch.numeral}</span>
        {status === 'complete' && <span className="mission-done-tag">✠ debt paid</span>}
        {status === 'playable' && <span className="chapter-now-tag">playable now</span>}
        {status === 'unlocked' && <span className="chapter-open-tag">road open</span>}
        {status === 'locked' && <span className="mission-locked-tag">locked</span>}
      </div>
      <h3 className="mission-name">{ch.name}</h3>
      <p className="chapter-theme">{ch.theme}</p>

      <div className="chapter-rows">
        <div className="chapter-row">
          <span className="ch-label">Region</span>
          <span>{ch.region}</span>
        </div>
        <div className="chapter-row">
          <span className="ch-label">Faction</span>
          <span>
            {ch.factionName} · Danger: <span className="danger-word">{ch.danger}</span>
          </span>
        </div>
        <div className="chapter-row">
          <span className="ch-label">Status</span>
          <span className={status === 'playable' ? 'blood-text' : status === 'complete' ? 'gold-text' : ''}>
            {chapterStatusText(status)}
          </span>
        </div>
        {status === 'locked' && (
          <div className="chapter-row">
            <span className="ch-label">Requires</span>
            <span>{ch.requires}</span>
          </div>
        )}
        <div className="chapter-row">
          <span className="ch-label">Boss</span>
          <span className={bossDown ? 'gold-text' : ''}>{bossDown ? `${ch.boss} — defeated` : ch.boss}</span>
        </div>
        {status === 'complete' && (
          <div className="chapter-row">
            <span className="ch-label">Crownmetal</span>
            <span className="hex-text">Claimed</span>
          </div>
        )}
        <div className="chapter-row">
          <span className="ch-label">Omen</span>
          <span className="omen-text">{ch.omens}</span>
        </div>
      </div>

      {(status === 'playable' || status === 'complete') &&
        ch.missions.map((m) => {
          const done = g.missionsDone.includes(m.id);
          return (
            <div key={m.id} className="chapter-mission">
              <div className="cm-name">
                {m.name} <span className="dim-text">— {m.patron}</span>
              </div>
              <p className="mission-desc">{m.desc}</p>
              <button className="btn btn-blood" onClick={() => dispatch({ type: 'START_SCRIPT', scriptId: m.script })}>
                {done ? 'Collect again' : 'Take the contract'}
              </button>
            </div>
          );
        })}
      {status === 'unlocked' && (
        <p className="chapter-pending">
          {ch.unlockedCopy || 'This region is open on the map. The chapter is not playable yet.'}
        </p>
      )}
    </div>
  );
}

export default function MapScreen() {
  const { g, dispatch } = useGame();
  const current = CHAPTERS.find((c) => c.id === g.currentChapter) || CHAPTERS[0];
  return (
    <div className="screen map-screen">
      <div className="map-cols">
        <section className="map-main panel">
          <h2 className="panel-title">VEYRATH — A CONTINENT IN DEBT</h2>
          <p className="map-chapter-banner">
            Current chapter: <b>{current.numeral} — {current.name}</b>
          </p>
          <p className="map-intro">{CAMPAIGN_TAGLINE}</p>
          <div className="mission-list">
            {CHAPTERS.map((ch) => (
              <ChapterCard key={ch.id} ch={ch} g={g} dispatch={dispatch} />
            ))}
          </div>
        </section>

        <aside className="map-side">
          <button className="btn ledger-open-btn" onClick={() => dispatch({ type: 'GOTO_SCREEN', screen: 'ledger' })}>
            ✠ Open the Campaign Ledger
          </button>

          <section className="panel">
            <h3 className="panel-title">THE BLACK TITHE</h3>
            {Object.entries(PARTY).map(([key, p]) => {
              const fed = Object.entries(g.sins[key] || {}).filter(([, r]) => r > 0);
              return (
                <div key={p.name} className="roster-row">
                  <span className="roster-sigil" style={{ color: p.color }}>
                    {p.sigil}
                  </span>
                  <div>
                    <div className="roster-name" style={{ color: p.color }}>
                      {p.name} <span className="roster-epithet">— {p.epithet}</span>
                    </div>
                    <div className="roster-passive">{p.passive}</div>
                    {fed.length > 0 && (
                      <div className="roster-sins">
                        {fed.map(([sin, r]) => (
                          <span key={sin} className="sin-chip">
                            {sin} {'●'.repeat(r)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>

          <section className="panel">
            <h3 className="panel-title">TENSION</h3>
            {Object.entries(TENSION_PAIRS).map(([k, v]) => {
              const tier = tensionTier(g.tension[k]);
              return (
                <div key={k} className="bar-row">
                  <div className="bar-label">
                    <span>{v.label}</span>
                    <span className={tier === 'high' || tier === 'critical' ? 'blood-text' : tier === 'medium' ? 'gold-text' : ''}>
                      {g.tension[k]} · {tier}
                    </span>
                  </div>
                  <Meter value={g.tension[k]} tier={tier} />
                </div>
              );
            })}
            {Object.entries(WARNING_SIGNS)
              .filter(([k]) => g.tension[k] >= 80)
              .map(([k, sign]) => (
                <p key={k} className="warning-sign">{sign}</p>
              ))}
            <p className="side-note">
              40+: arguments leave marks. 65+: sabotage and skimmed gold. 90+: the knives come out.
            </p>
          </section>

          <section className="panel">
            <h3 className="panel-title">CAMP — KEEP THE KNIVES SHEATHED</h3>
            {[
              { key: 'sjen', pair: 'lucian_sjen' },
              { key: 'veato', pair: 'lucian_veato' },
            ].map(({ key, pair }) => {
              const P = PARTY[key];
              const t = g.tension[pair];
              return (
                <div key={key} className="camp-row">
                  <button
                    className="btn camp-btn"
                    disabled={g.gold < 25 || t <= 0}
                    title={`Spend 25 gold. Eases tension with ${P.name} by 12. Greed is the cheapest loyalty.`}
                    onClick={() => dispatch({ type: 'CAMP_ACTION', kind: 'pay', pair })}
                  >
                    Pay {P.name}’s cut — 25 gold
                  </button>
                  {t >= 90 && (
                    <button
                      className="btn btn-blood camp-btn"
                      title={`Beat the mutiny out of ${P.name}. Tension −30, +3 corruption — and the other one watches.`}
                      onClick={() => dispatch({ type: 'CAMP_ACTION', kind: 'reassert', pair })}
                    >
                      ✠ Reassert control over {P.name} — violently
                    </button>
                  )}
                </div>
              );
            })}
            <p className="side-note">
              Fear works faster than gold. Gold leaves fewer scars. Lucian has never cared about scars.
            </p>
          </section>

          <section className="panel">
            <h3 className="panel-title">FACTIONS</h3>
            {Object.entries(FACTIONS).map(([k, f]) => (
              <div key={k} className="bar-row" title={f.desc}>
                <div className="bar-label">
                  <span>{f.name}</span>
                  <span className={g.reputation[k] < 0 ? 'blood-text' : g.reputation[k] > 0 ? 'gold-text' : ''}>
                    {g.reputation[k] > 0 ? '+' : ''}
                    {g.reputation[k]}
                  </span>
                </div>
                <Meter value={g.reputation[k]} min={-100} max={100} />
              </div>
            ))}
          </section>

          {(g.inventory.length > 0 || g.scars.length > 0) && (
            <section className="panel">
              <h3 className="panel-title">WHAT LUCIAN CARRIES</h3>
              {g.inventory.map((it) => (
                <div key={it.id} className="loot-row">
                  <b className="gold-text">{it.name}</b>
                  <div className="loot-desc">{it.desc}</div>
                </div>
              ))}
              {g.scars.map((sc) => (
                <div key={sc.id} className="loot-row">
                  <b className="pale-text">{sc.name}</b>
                  <div className="loot-desc">{sc.desc}</div>
                </div>
              ))}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
