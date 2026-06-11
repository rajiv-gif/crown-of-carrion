import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { reducer, initialState, SAVE_KEY } from './state.js';
import Hud from './components/Hud.jsx';
import Title from './screens/Title.jsx';
import Dialogue from './screens/Dialogue.jsx';
import MapScreen from './screens/MapScreen.jsx';
import CombatScreen from './screens/CombatScreen.jsx';
import WhiteSilence from './screens/WhiteSilence.jsx';
import Aftermath from './screens/Aftermath.jsx';
import Ascension from './screens/Ascension.jsx';
import Ledger from './screens/Ledger.jsx';

const Ctx = createContext(null);
export const useGame = () => useContext(Ctx);

const SCREENS = {
  title: Title,
  dialogue: Dialogue,
  map: MapScreen,
  combat: CombatScreen,
  silence: WhiteSilence,
  aftermath: Aftermath,
  ascension: Ascension,
  ledger: Ledger,
};

export default function App() {
  const [g, dispatch] = useReducer(reducer, null, initialState);

  // Autosave on every change (except the title screen). Ledger Marks are
  // the player-facing checkpoints; the save itself is continuous.
  useEffect(() => {
    if (g.screen !== 'title') {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({ ...g, lastSavedAt: Date.now(), mark: null }));
      } catch {
        /* the ledger forgets */
      }
    }
  }, [g]);

  const Screen = SCREENS[g.screen] || Title;
  const showHud = g.screen !== 'title' && g.screen !== 'silence';

  return (
    <Ctx.Provider value={{ g, dispatch }}>
      <div className={`app ${g.screen === 'silence' ? 'pale' : ''}`}>
        {showHud && <Hud />}
        <Screen key={g.screen + (g.encounterId || '')} />
        {g.mark && g.screen !== 'title' && (
          <div className="ledger-toast" key={g.mark.id}>
            <span className="toast-glyph">✠</span> {g.mark.text}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
