extends Control

const CombatData = preload("res://scripts/combat_data.gd")
const FIELD_BG_PATH := "res://assets/ash-road-vertical-slice.png"
const ACTIONS := {
	"Needlework": {"range": 1, "damage": 18, "kind": "melee"},
	"Spite Hex": {"range": 4, "damage": 15, "kind": "ranged"},
	"Duo Rite": {"range": 3, "damage": 22, "kind": "ranged"},
}
const MOVE_POINTS := {
	"lucian": 3,
	"sjen": 3,
	"veato": 4,
	"chan": 3,
	"chibi": 4,
}

var field := CombatData.ASH_ROAD_FIELD
var units := []
var selected_unit_id := "chibi"
var selected_target_id := "taxman"
var unit_nodes := {}
var log_lines := []
var battlefield: Control
var log_box: RichTextLabel
var action_label: Label
var cutin: Control
var field_bg: Texture2D
var move_mode := false

func _ready() -> void:
	field_bg = load(FIELD_BG_PATH)
	for unit in CombatData.ASH_ROAD_UNITS:
		units.append(unit.duplicate(true))
	_build_ui()
	_log("[color=#cfc3a9]The Ash Road Toll Shrine[/color] waits under dead light.")
	_log("Visual slice: map first, UI second. Chibi is ready.")
	_render_battlefield()
	_render_actions()

func _build_ui() -> void:
	var root := Control.new()
	root.name = "Root"
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(root)

	battlefield = Control.new()
	battlefield.name = "Battlefield"
	battlefield.set_anchors_preset(Control.PRESET_FULL_RECT)
	root.add_child(battlefield)

	var top_bar := PanelContainer.new()
	top_bar.position = Vector2(28, 20)
	top_bar.size = Vector2(1224, 58)
	root.add_child(top_bar)

	var top_row := HBoxContainer.new()
	top_row.add_theme_constant_override("separation", 18)
	top_bar.add_child(top_row)

	var title := Label.new()
	title.text = "CROWN OF CARRION  /  ASH ROAD AMBUSH"
	title.add_theme_font_size_override("font_size", 22)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_row.add_child(title)

	var round := Label.new()
	round.text = "ROUND I"
	round.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	round.add_theme_font_size_override("font_size", 18)
	top_row.add_child(round)

	var command_panel := PanelContainer.new()
	command_panel.position = Vector2(44, 536)
	command_panel.size = Vector2(744, 156)
	root.add_child(command_panel)

	var actions := VBoxContainer.new()
	actions.name = "Actions"
	actions.add_theme_constant_override("separation", 10)
	command_panel.add_child(actions)

	action_label = Label.new()
	action_label.text = "CHIBI ACTS"
	action_label.add_theme_font_size_override("font_size", 20)
	actions.add_child(action_label)

	var buttons := GridContainer.new()
	buttons.columns = 3
	buttons.add_theme_constant_override("h_separation", 8)
	buttons.add_theme_constant_override("v_separation", 8)
	actions.add_child(buttons)
	for action in ["Move", "Needlework", "Spite Hex", "Duo Rite", "Wait for Power", "End Turn"]:
		var b := Button.new()
		b.text = action
		b.custom_minimum_size = Vector2(224, 42)
		b.pressed.connect(func() -> void: _use_action(action))
		buttons.add_child(b)

	var log_panel := PanelContainer.new()
	log_panel.position = Vector2(814, 536)
	log_panel.size = Vector2(420, 156)
	root.add_child(log_panel)

	log_box = RichTextLabel.new()
	log_box.bbcode_enabled = true
	log_box.fit_content = true
	log_panel.add_child(log_box)

	cutin = Control.new()
	cutin.name = "CutIn"
	cutin.set_anchors_preset(Control.PRESET_FULL_RECT)
	cutin.visible = false
	root.add_child(cutin)

func _render_battlefield() -> void:
	for child in battlefield.get_children():
		child.queue_free()
	unit_nodes.clear()

	var bg := TextureRect.new()
	bg.texture = field_bg
	bg.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	bg.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	battlefield.add_child(bg)

	var shade := ColorRect.new()
	shade.color = Color(0.02, 0.012, 0.01, 0.22)
	shade.set_anchors_preset(Control.PRESET_FULL_RECT)
	battlefield.add_child(shade)

	var vignette := Panel.new()
	vignette.set_anchors_preset(Control.PRESET_FULL_RECT)
	vignette.modulate = Color(0, 0, 0, 0.28)
	battlefield.add_child(vignette)

	_add_field_label()
	if move_mode:
		_render_move_tiles()
	for unit in units:
		_render_unit(unit)

func _add_field_label() -> void:
	var label := Label.new()
	label.text = "%s\n%s" % [field.name.to_upper(), "  ".join(field.rules)]
	label.position = Vector2(52, 96)
	label.size = Vector2(760, 60)
	label.add_theme_font_size_override("font_size", 17)
	label.modulate = Color(0.92, 0.88, 0.78, 0.86)
	battlefield.add_child(label)

func _render_unit(unit: Dictionary) -> void:
	var pos := _tile_to_screen(unit.tile)
	var wrapper := Control.new()
	wrapper.name = unit.id
	wrapper.position = pos - Vector2(34, 58)
	wrapper.size = Vector2(68, 86)
	wrapper.mouse_filter = Control.MOUSE_FILTER_PASS
	wrapper.gui_input.connect(func(event: InputEvent) -> void:
		if event is InputEventMouseButton and event.pressed:
			_select_target(unit.id)
	)
	battlefield.add_child(wrapper)
	unit_nodes[unit.id] = wrapper

	var shadow := ColorRect.new()
	shadow.color = Color(0, 0, 0, 0.42)
	shadow.position = Vector2(10, 48)
	shadow.size = Vector2(48, 10)
	wrapper.add_child(shadow)

	var body := Polygon2D.new()
	body.color = unit.color
	body.polygon = PackedVector2Array([
		Vector2(34, 4), Vector2(52, 22), Vector2(48, 58), Vector2(34, 70), Vector2(20, 58), Vector2(16, 22)
	])
	wrapper.add_child(body)

	var hood := Polygon2D.new()
	hood.color = Color(0.035, 0.028, 0.036)
	hood.polygon = PackedVector2Array([Vector2(34, 0), Vector2(50, 16), Vector2(42, 30), Vector2(26, 30), Vector2(18, 16)])
	wrapper.add_child(hood)

	var eye_l := ColorRect.new()
	eye_l.color = Color(0.88, 0.84, 0.62, 1)
	eye_l.position = Vector2(29, 16)
	eye_l.size = Vector2(4, 4)
	wrapper.add_child(eye_l)
	var eye_r := ColorRect.new()
	eye_r.color = Color(0.88, 0.84, 0.62, 1)
	eye_r.position = Vector2(37, 16)
	eye_r.size = Vector2(4, 4)
	wrapper.add_child(eye_r)

	var hp := ProgressBar.new()
	hp.position = Vector2(4, 72)
	hp.size = Vector2(60, 7)
	hp.max_value = unit.max_hp
	hp.value = unit.hp
	hp.show_percentage = false
	wrapper.add_child(hp)

	if unit.side == "enemy":
		wrapper.scale.x = -1.0
		hp.scale.x = -1.0
	if unit.id == selected_target_id:
		_add_target_ring(wrapper)

func _add_target_ring(parent: Control) -> void:
	var ring := ColorRect.new()
	ring.color = Color(0.75, 0.08, 0.06, 0.26)
	ring.position = Vector2(6, 42)
	ring.size = Vector2(56, 20)
	parent.add_child(ring)

func _render_actions() -> void:
	var actor := _unit_by_id(selected_unit_id)
	action_label.text = "%s ACTS  /  target: %s  /  %s" % [
		actor.name.to_upper() if not actor.is_empty() else "PARTY",
		_unit_by_id(selected_target_id).name if not _unit_by_id(selected_target_id).is_empty() else "none",
		"choose destination" if move_mode else "melee and ranged attacks use distance"
	]

func _use_action(action: String) -> void:
	if action == "Move":
		move_mode = !move_mode
		_render_actions()
		_render_battlefield()
		_log("Move mode: %s." % ("choose a reachable position" if move_mode else "cancelled"))
		return
	if action == "End Turn":
		move_mode = false
		_log("[color=#8d8270]Chibi waits. The dead count the pause.[/color]")
		return
	if action == "Wait for Power":
		move_mode = false
		_log("[color=#a98c45]Chibi waits for power.[/color] The next strike should matter.")
		return
	if not ACTIONS.has(action):
		return
	var actor := _unit_by_id(selected_unit_id)
	var target := _unit_by_id(selected_target_id)
	if actor.is_empty() or target.is_empty():
		return
	var dist := _grid_distance(actor.tile, target.tile)
	var range: int = ACTIONS[action].range
	if dist > range:
		_log("%s is out of range for %s. Need %d, distance is %d." % [target.name, action, range, dist])
		return
	move_mode = false
	_log("[color=#cfc3a9]%s[/color] uses [color=#a98c45]%s[/color] on %s." % [actor.name, action, target.name])
	await _play_cutin(actor, target, action)
	var damage: int = ACTIONS[action].damage
	target.hp = max(0, target.hp - damage)
	_log("[color=#c0392b]%s suffers %d.[/color]" % [target.name, damage])
	_render_battlefield()

func _play_cutin(actor: Dictionary, target: Dictionary, action: String) -> void:
	cutin.visible = true
	for child in cutin.get_children():
		child.queue_free()

	var black := ColorRect.new()
	black.color = Color(0, 0, 0, 0.62)
	black.set_anchors_preset(Control.PRESET_FULL_RECT)
	cutin.add_child(black)

	var slash := Polygon2D.new()
	slash.color = Color(0.74, 0.06, 0.05, 0.82)
	slash.polygon = PackedVector2Array([Vector2(160, 560), Vector2(1060, 88), Vector2(1120, 156), Vector2(222, 622)])
	cutin.add_child(slash)

	var left := _cutin_figure(actor.name, actor.color, Vector2(112, 170), false)
	cutin.add_child(left)
	var right := _cutin_figure(target.name, target.color, Vector2(930, 150), true)
	cutin.add_child(right)

	var title := Label.new()
	title.text = action.to_upper()
	title.position = Vector2(420, 92)
	title.size = Vector2(460, 60)
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 42)
	title.modulate = Color(0.94, 0.88, 0.76, 1)
	cutin.add_child(title)

	var tween := create_tween()
	left.scale = Vector2(0.82, 0.82)
	right.scale = Vector2(0.82, 0.82)
	tween.tween_property(left, "scale", Vector2(1.08, 1.08), 0.14).set_trans(Tween.TRANS_BACK)
	tween.parallel().tween_property(right, "position", Vector2(900, 150), 0.14)
	tween.tween_interval(0.42)
	tween.tween_property(cutin, "modulate", Color(1, 1, 1, 0), 0.18)
	await tween.finished
	cutin.modulate = Color(1, 1, 1, 1)
	cutin.visible = false

func _cutin_figure(unit_name: String, color: Color, pos: Vector2, mirror: bool) -> Control:
	var c := Control.new()
	c.position = pos
	c.size = Vector2(250, 360)
	if mirror:
		c.scale.x = -1.0
	var body := Polygon2D.new()
	body.color = color
	body.polygon = PackedVector2Array([
		Vector2(124, 8), Vector2(206, 96), Vector2(184, 272), Vector2(124, 344), Vector2(64, 272), Vector2(42, 96)
	])
	c.add_child(body)
	var hood := Polygon2D.new()
	hood.color = Color(0.025, 0.02, 0.026)
	hood.polygon = PackedVector2Array([Vector2(124, 0), Vector2(190, 70), Vector2(158, 128), Vector2(92, 128), Vector2(58, 70)])
	c.add_child(hood)
	var label := Label.new()
	label.text = unit_name.to_upper()
	label.position = Vector2(-10, 298)
	label.size = Vector2(270, 46)
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	label.add_theme_font_size_override("font_size", 24)
	c.add_child(label)
	return c

func _select_target(id: String) -> void:
	var unit := _unit_by_id(id)
	if unit.is_empty():
		return
	if unit.side == "enemy":
		selected_target_id = id
		move_mode = false
		_render_actions()
		_render_battlefield()
		var actor := _unit_by_id(selected_unit_id)
		var dist := _grid_distance(actor.tile, unit.tile) if not actor.is_empty() else 0
		_log("Target selected: [color=#cfc3a9]%s[/color]. Distance %d." % [unit.name, dist])

func _render_move_tiles() -> void:
	var actor := _unit_by_id(selected_unit_id)
	if actor.is_empty():
		return
	for tile in _reachable_tiles(actor):
		var pos := _tile_to_screen(tile)
		var marker := ColorRect.new()
		marker.color = Color(0.57, 0.48, 0.18, 0.34)
		marker.position = pos - Vector2(34, 20)
		marker.size = Vector2(68, 40)
		marker.mouse_filter = Control.MOUSE_FILTER_STOP
		marker.gui_input.connect(func(event: InputEvent) -> void:
			if event is InputEventMouseButton and event.pressed:
				_move_actor_to(tile)
		)
		battlefield.add_child(marker)

func _reachable_tiles(actor: Dictionary) -> Array[Vector2i]:
	var result: Array[Vector2i] = []
	var max_move: int = MOVE_POINTS.get(actor.id, 3)
	for y in field.rows:
		for x in field.columns:
			var tile := Vector2i(x, y)
			if tile == actor.tile:
				continue
			if _grid_distance(actor.tile, tile) <= max_move and not _is_occupied(tile):
				result.append(tile)
	return result

func _move_actor_to(tile: Vector2i) -> void:
	var actor := _unit_by_id(selected_unit_id)
	if actor.is_empty():
		return
	if not _reachable_tiles(actor).has(tile):
		return
	move_mode = false
	var node: Control = unit_nodes.get(actor.id)
	if node:
		var tween := create_tween()
		tween.tween_property(node, "position", _tile_to_screen(tile) - Vector2(34, 58), 0.32).set_trans(Tween.TRANS_SINE)
		await tween.finished
	_set_unit_tile(actor.id, tile)
	_log("%s moves to (%d, %d)." % [actor.name, tile.x + 1, tile.y + 1])
	_render_actions()
	_render_battlefield()

func _is_occupied(tile: Vector2i) -> bool:
	for unit in units:
		if unit.hp > 0 and unit.tile == tile:
			return true
	return false

func _set_unit_tile(id: String, tile: Vector2i) -> void:
	for i in units.size():
		if units[i].id == id:
			units[i].tile = tile
			return

func _grid_distance(a: Vector2i, b: Vector2i) -> int:
	return abs(a.x - b.x) + abs(a.y - b.y)

func _tile_to_screen(tile: Vector2i) -> Vector2:
	var cols: int = field.columns
	var rows: int = field.rows
	var origin := Vector2(128, 166)
	var area := Vector2(1024, 300)
	return origin + Vector2((tile.x + 0.5) * area.x / cols, (tile.y + 0.5) * area.y / rows)

func _unit_by_id(id: String) -> Dictionary:
	for unit in units:
		if unit.id == id:
			return unit
	return {}

func _log(text: String) -> void:
	log_lines.append(text)
	if log_lines.size() > 6:
		log_lines.pop_front()
	if log_box:
		log_box.text = "\n".join(log_lines)
