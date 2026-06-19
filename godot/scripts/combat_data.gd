class_name CombatData

const TERRAIN := {
	"ash": {"name": "Ash", "short": "Open ground."},
	"cover": {"name": "Cover", "short": "Reduces incoming damage."},
	"high_ground": {"name": "High Ground", "short": "Attacks hit harder."},
	"holy_ground": {"name": "Holy Ground", "short": "Burns undead and demons."},
	"desecrated_altar": {"name": "Desecrated Altar", "short": "Empowers Sjen and Chibi hexes."},
	"corpse_pile": {"name": "Corpse Pile", "short": "Feeds undead ascension timers."},
	"blood_slick": {"name": "Blood Slick", "short": "Bleeding hurts more here."},
	"demon_rift": {"name": "Demon Rift", "short": "Strengthens demonic enemies."},
}

const ASH_ROAD_FIELD := {
	"name": "Ash Road Toll Shrine",
	"columns": 8,
	"rows": 5,
	"rules": [
		"The shrine empowers hexes.",
		"Corpse piles hurry undead transformations.",
	],
	"tiles": [
		{"x": 2, "y": 0, "type": "cover"},
		{"x": 2, "y": 4, "type": "cover"},
		{"x": 3, "y": 2, "type": "desecrated_altar"},
		{"x": 4, "y": 1, "type": "corpse_pile"},
		{"x": 4, "y": 3, "type": "blood_slick"},
		{"x": 6, "y": 2, "type": "high_ground"},
	],
}

const ASH_ROAD_UNITS := [
	{"id": "sjen", "name": "Sjen", "side": "party", "hp": 60, "max_hp": 60, "tile": Vector2i(0, 1), "color": Color("#8e7bb5")},
	{"id": "chibi", "name": "Chibi", "side": "party", "hp": 49, "max_hp": 49, "tile": Vector2i(0, 2), "color": Color("#cfc3a9")},
	{"id": "lucian", "name": "Lucian", "side": "party", "hp": 87, "max_hp": 87, "tile": Vector2i(1, 2), "color": Color("#c0392b")},
	{"id": "veato", "name": "Veato", "side": "party", "hp": 59, "max_hp": 59, "tile": Vector2i(1, 3), "color": Color("#7aa36f")},
	{"id": "chan", "name": "Chan", "side": "party", "hp": 55, "max_hp": 55, "tile": Vector2i(0, 3), "color": Color("#a98c45")},
	{"id": "flagellant_a", "name": "Ashen Flagellant", "side": "enemy", "hp": 48, "max_hp": 48, "tile": Vector2i(6, 1), "color": Color("#7b5c56"), "timer": 2},
	{"id": "censer", "name": "Censer Knight", "side": "enemy", "hp": 79, "max_hp": 79, "tile": Vector2i(6, 3), "color": Color("#8d8270"), "timer": 3},
	{"id": "taxman", "name": "Choir Taxman", "side": "enemy", "hp": 57, "max_hp": 57, "tile": Vector2i(7, 2), "color": Color("#8e7bb5"), "timer": 2},
	{"id": "flagellant_b", "name": "Ashen Flagellant", "side": "enemy", "hp": 48, "max_hp": 48, "tile": Vector2i(7, 4), "color": Color("#7b5c56"), "timer": 2},
]
