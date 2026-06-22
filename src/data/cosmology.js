// Only discoveries earned by the current story appear here. The larger
// cosmology stays hidden until a chapter, death, or character reveals it.
export function revealedCosmology(g) {
  const fragments = [];

  if (g.shards > 0 || g.crownWhispers > 0) {
    fragments.push({
      id: 'cycle',
      name: 'The Broken Passage',
      text: 'The dead do not rise. They fail to leave. A soul should pass; here, it circulates.',
    });
    fragments.push({
      id: 'crownward',
      name: 'The Crownward Plane',
      text: 'The Crown is not a throne. It is a hand around the wheel, forcing trapped lives toward one absolute will.',
    });
  }

  if (g.deaths > 0) {
    fragments.push({
      id: 'silence',
      name: 'The White Silence',
      text: 'Death was once a road. The White Silence is the pause where Cocoli turns Lucian back before he reaches its end.',
    });
  }

  if (g.flags?.sjen_pact || g.flags?.chibi_hidden_recruit || (g.reputation?.hollow_choir || 0) > 0) {
    fragments.push({
      id: 'root',
      name: 'The Root-Beneath',
      text: 'The voices beneath the earth are not demons climbing upward. They are failed departures searching for mouths.',
    });
  }

  if ((g.cocoliOriginFragments || 0) > 0 || g.deaths >= 3) {
    fragments.push({
      id: 'height',
      name: 'The Unburned Height',
      text: 'Cocoli did not descend. She may have escaped. Whether the Unburned Height still exists is a question she refuses to answer.',
    });
  }

  return fragments;
}
