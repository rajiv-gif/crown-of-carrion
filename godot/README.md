# Crown of Carrion Godot Prototype

Open this folder in Godot 4.x.

This is the first migration step away from the browser combat view:

- `scenes/main.tscn` loads the prototype.
- `scripts/main.gd` builds a tactical Ash Road combat map.
- `scripts/combat_data.gd` holds the first battlefield and unit data.
- `assets/` contains copied art from the web version.

The prototype is intentionally small: it proves the Godot direction with tiny tactical units, map terrain, target selection, and enlarged attack animation. The next step is to port the real combat engine rules and add proper movement/range/pathing.
