extends Node3D

const GRID_W := 8
const GRID_H := 5
const TILE := 1.35
const PARTY_TEXTURES := {
	"sjen": "res://assets/characters/sjen.png",
	"chibi": "res://assets/portrait-chibi.jpg",
	"veato": "res://assets/portrait-veato.jpg",
}
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

var units := [
	{"id": "sjen", "name": "Sjen", "side": "party", "hp": 60, "max_hp": 60, "tile": Vector2i(0, 1), "color": Color("#8e7bb5")},
	{"id": "chibi", "name": "Chibi", "side": "party", "hp": 49, "max_hp": 49, "tile": Vector2i(0, 2), "color": Color("#cfc3a9")},
	{"id": "lucian", "name": "Lucian", "side": "party", "hp": 87, "max_hp": 87, "tile": Vector2i(1, 2), "color": Color("#c0392b")},
	{"id": "veato", "name": "Veato", "side": "party", "hp": 59, "max_hp": 59, "tile": Vector2i(1, 3), "color": Color("#7aa36f")},
	{"id": "chan", "name": "Chan", "side": "party", "hp": 55, "max_hp": 55, "tile": Vector2i(0, 3), "color": Color("#a98c45")},
	{"id": "flagellant_a", "name": "Ashen Flagellant", "side": "enemy", "hp": 48, "max_hp": 48, "tile": Vector2i(6, 1), "color": Color("#7b5c56")},
	{"id": "censer", "name": "Censer Knight", "side": "enemy", "hp": 79, "max_hp": 79, "tile": Vector2i(6, 3), "color": Color("#8d8270")},
	{"id": "taxman", "name": "Choir Taxman", "side": "enemy", "hp": 57, "max_hp": 57, "tile": Vector2i(7, 2), "color": Color("#8e7bb5")},
	{"id": "flagellant_b", "name": "Ashen Flagellant", "side": "enemy", "hp": 48, "max_hp": 48, "tile": Vector2i(7, 4), "color": Color("#7b5c56")},
]
var terrain := {
	Vector2i(2, 0): "cover",
	Vector2i(2, 4): "cover",
	Vector2i(3, 2): "altar",
	Vector2i(4, 1): "corpse",
	Vector2i(4, 3): "blood",
	Vector2i(6, 2): "high",
}

var selected_unit_id := "chibi"
var selected_target_id := "taxman"
var move_mode := false
var unit_nodes := {}
var tile_nodes := {}
var log_lines := []
var ui_label: Label
var log_box: RichTextLabel
var camera: Camera3D

func _ready() -> void:
	_build_world()
	_build_ui()
	_log("[color=#cfc3a9]2.5D tactical diorama online.[/color]")
	_log("Move uses highlighted tiles. Needlework is melee; hexes are ranged.")
	_refresh_units()
	_refresh_ui()

func _build_world() -> void:
	var env := WorldEnvironment.new()
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color(0.015, 0.012, 0.01)
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color(0.42, 0.36, 0.3)
	environment.ambient_light_energy = 0.62
	env.environment = environment
	add_child(env)

	var light := DirectionalLight3D.new()
	light.rotation_degrees = Vector3(-58, -34, 0)
	light.light_energy = 2.4
	light.light_color = Color(0.95, 0.86, 0.68)
	add_child(light)

	camera = Camera3D.new()
	camera.position = Vector3(0.5, 7.8, 8.7)
	camera.rotation_degrees = Vector3(-55, 0, 0)
	camera.fov = 38
	camera.current = true
	add_child(camera)

	_add_backdrop()
	for y in GRID_H:
		for x in GRID_W:
			_create_tile(Vector2i(x, y))
	_add_terrain_props()

func _add_backdrop() -> void:
	var ground := MeshInstance3D.new()
	var mesh := PlaneMesh.new()
	mesh.size = Vector2(15, 10)
	ground.mesh = mesh
	ground.position = Vector3(0, -0.08, 0)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(0.09, 0.075, 0.055)
	mat.roughness = 1.0
	ground.material_override = mat
	add_child(ground)

	var fog := MeshInstance3D.new()
	var fog_mesh := PlaneMesh.new()
	fog_mesh.size = Vector2(16, 9)
	fog.mesh = fog_mesh
	fog.position = Vector3(0, 0.03, -0.45)
	var fog_mat := StandardMaterial3D.new()
	fog_mat.albedo_color = Color(0.55, 0.52, 0.44, 0.12)
	fog_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	fog_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	fog.material_override = fog_mat
	add_child(fog)

func _create_tile(tile: Vector2i) -> void:
	var node := StaticBody3D.new()
	node.name = "Tile_%d_%d" % [tile.x, tile.y]
	node.position = _tile_to_world(tile)
	node.input_ray_pickable = true
	node.set_meta("tile", tile)
	node.input_event.connect(_on_tile_input.bind(tile))
	add_child(node)
	tile_nodes[tile] = node

	var mesh_instance := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = Vector3(TILE * 0.96, _tile_height(tile), TILE * 0.96)
	mesh_instance.mesh = mesh
	mesh_instance.position.y = -mesh.size.y * 0.5
	mesh_instance.material_override = _terrain_material(_terrain_at(tile))
	node.add_child(mesh_instance)

	var collision := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = Vector3(TILE * 0.96, 0.18, TILE * 0.96)
	collision.shape = shape
	node.add_child(collision)

func _add_terrain_props() -> void:
	for tile in terrain.keys():
		var type: String = terrain[tile]
		var prop := MeshInstance3D.new()
		prop.position = _tile_to_world(tile) + Vector3(0, 0.15 + _tile_height(tile) * 0.5, 0)
		var mat := StandardMaterial3D.new()
		match type:
			"cover":
				var m := BoxMesh.new()
				m.size = Vector3(0.72, 0.45, 0.22)
				prop.mesh = m
				mat.albedo_color = Color(0.32, 0.27, 0.2)
			"altar":
				var m := CylinderMesh.new()
				m.top_radius = 0.32
				m.bottom_radius = 0.42
				m.height = 0.42
				prop.mesh = m
				mat.albedo_color = Color(0.22, 0.12, 0.34)
			"corpse":
				var m := SphereMesh.new()
				m.radius = 0.28
				m.height = 0.22
				prop.mesh = m
				mat.albedo_color = Color(0.18, 0.28, 0.16)
			"blood":
				var m := CylinderMesh.new()
				m.top_radius = 0.48
				m.bottom_radius = 0.48
				m.height = 0.035
				prop.mesh = m
				mat.albedo_color = Color(0.48, 0.03, 0.025)
			"high":
				var m := BoxMesh.new()
				m.size = Vector3(0.88, 0.16, 0.88)
				prop.mesh = m
				mat.albedo_color = Color(0.42, 0.34, 0.16)
		mat.roughness = 0.9
		prop.material_override = mat
		add_child(prop)

func _build_ui() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	var root := Control.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	layer.add_child(root)

	var top := PanelContainer.new()
	top.position = Vector2(24, 18)
	top.size = Vector2(1230, 58)
	root.add_child(top)
	var top_row := HBoxContainer.new()
	top.add_child(top_row)
	var title := Label.new()
	title.text = "CROWN OF CARRION / 2.5D DIORAMA"
	title.add_theme_font_size_override("font_size", 22)
	title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_row.add_child(title)
	var round := Label.new()
	round.text = "ROUND I"
	round.add_theme_font_size_override("font_size", 18)
	top_row.add_child(round)

	var actions := PanelContainer.new()
	actions.position = Vector2(32, 536)
	actions.size = Vector2(760, 160)
	root.add_child(actions)
	var action_box := VBoxContainer.new()
	action_box.add_theme_constant_override("separation", 8)
	actions.add_child(action_box)
	ui_label = Label.new()
	ui_label.add_theme_font_size_override("font_size", 18)
	action_box.add_child(ui_label)
	var grid := GridContainer.new()
	grid.columns = 3
	grid.add_theme_constant_override("h_separation", 8)
	grid.add_theme_constant_override("v_separation", 8)
	action_box.add_child(grid)
	for action in ["Move", "Needlework", "Spite Hex", "Duo Rite", "Wait", "End Turn"]:
		var b := Button.new()
		b.text = action
		b.custom_minimum_size = Vector2(230, 42)
		b.pressed.connect(func() -> void: _use_action(action))
		grid.add_child(b)

	var log_panel := PanelContainer.new()
	log_panel.position = Vector2(820, 536)
	log_panel.size = Vector2(420, 160)
	root.add_child(log_panel)
	log_box = RichTextLabel.new()
	log_box.bbcode_enabled = true
	log_panel.add_child(log_box)

func _refresh_units() -> void:
	for node in unit_nodes.values():
		node.queue_free()
	unit_nodes.clear()
	for unit in units:
		if unit.hp > 0:
			_create_unit(unit)
	_highlight_move_tiles()

func _create_unit(unit: Dictionary) -> void:
	var node := Node3D.new()
	node.name = unit.id
	node.position = _tile_to_world(unit.tile) + Vector3(0, 0.58 + _tile_height(unit.tile), 0)
	add_child(node)
	unit_nodes[unit.id] = node

	var sprite := Sprite3D.new()
	sprite.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	sprite.pixel_size = 0.006
	var texture_path: String = PARTY_TEXTURES.get(unit.id, "")
	if texture_path != "":
		sprite.texture = load(texture_path)
	if sprite.texture == null:
		sprite.texture = _make_unit_texture(unit.color, unit.side == "enemy")
	sprite.modulate = Color(1, 1, 1, 0.98)
	sprite.position.y = 0.52
	sprite.scale = Vector3(0.82, 0.82, 0.82)
	node.add_child(sprite)

	var label := Label3D.new()
	label.text = unit.name
	label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	label.font_size = 24
	label.modulate = unit.color
	label.position = Vector3(0, -0.08, 0)
	node.add_child(label)

	if unit.id == selected_unit_id or unit.id == selected_target_id:
		var ring := MeshInstance3D.new()
		var ring_mesh := TorusMesh.new()
		ring_mesh.inner_radius = 0.32
		ring_mesh.outer_radius = 0.38
		ring.mesh = ring_mesh
		ring.rotation_degrees.x = 90
		var mat := StandardMaterial3D.new()
		mat.albedo_color = Color(0.75, 0.08, 0.04) if unit.id == selected_target_id else Color(0.85, 0.72, 0.25)
		mat.emission_enabled = true
		mat.emission = mat.albedo_color
		mat.emission_energy_multiplier = 0.7
		ring.material_override = mat
		node.add_child(ring)

	var pick := Area3D.new()
	pick.input_ray_pickable = true
	pick.set_meta("unit_id", unit.id)
	var shape := CollisionShape3D.new()
	var sphere := SphereShape3D.new()
	sphere.radius = 0.42
	shape.shape = sphere
	pick.add_child(shape)
	pick.input_event.connect(_on_unit_input.bind(unit.id))
	node.add_child(pick)

func _make_unit_texture(color: Color, enemy: bool) -> Texture2D:
	var img := Image.create(96, 128, false, Image.FORMAT_RGBA8)
	img.fill(Color(0, 0, 0, 0))
	var body_color := color
	for y in range(22, 112):
		for x in range(24, 72):
			var dx: float = abs(x - 48) / 24.0
			var dy: float = abs(y - 64) / 48.0
			if dx + dy * 0.55 < 1.0:
				img.set_pixel(x, y, body_color)
	for y in range(10, 48):
		for x in range(28, 68):
			if Vector2(x - 48, y - 30).length() < 22:
				img.set_pixel(x, y, Color(0.025, 0.02, 0.025))
	for eye_x in [40, 56]:
		for y in range(27, 32):
			for x in range(eye_x, eye_x + 5):
				img.set_pixel(x, y, Color(0.95, 0.82, 0.52) if enemy else Color(0.85, 0.9, 1.0))
	var tex := ImageTexture.create_from_image(img)
	return tex

func _on_tile_input(_camera: Node, event: InputEvent, _pos: Vector3, _normal: Vector3, _shape: int, tile: Vector2i) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		if move_mode:
			await _move_actor_to(tile)

func _on_unit_input(_camera: Node, event: InputEvent, _pos: Vector3, _normal: Vector3, _shape: int, unit_id: String) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var unit := _unit_by_id(unit_id)
		if unit.is_empty():
			return
		if unit.side == "enemy":
			selected_target_id = unit_id
			move_mode = false
			_log("Target: [color=#cfc3a9]%s[/color]. Distance %d." % [unit.name, _distance(_actor().tile, unit.tile)])
			_refresh_ui()
			_refresh_units()

func _use_action(action: String) -> void:
	if action == "Move":
		move_mode = !move_mode
		_log("Move mode: %s." % ("choose highlighted tile" if move_mode else "off"))
		_refresh_ui()
		_refresh_units()
		return
	if action == "Wait":
		move_mode = false
		_log("Chibi waits for power.")
		_refresh_ui()
		_refresh_units()
		return
	if action == "End Turn":
		move_mode = false
		_log("Turn ends. Enemy movement comes next.")
		_refresh_ui()
		_refresh_units()
		return
	if not ACTIONS.has(action):
		return
	var actor := _actor()
	var target := _unit_by_id(selected_target_id)
	if actor.is_empty() or target.is_empty():
		return
	var dist := _distance(actor.tile, target.tile)
	var range: int = ACTIONS[action].range
	if dist > range:
		_log("%s is out of range for %s. Need %d, distance %d." % [target.name, action, range, dist])
		return
	move_mode = false
	await _attack(actor, target, action)

func _move_actor_to(tile: Vector2i) -> void:
	var actor := _actor()
	if actor.is_empty() or not _reachable_tiles(actor).has(tile):
		return
	move_mode = false
	var node: Node3D = unit_nodes.get(actor.id)
	if node:
		var tween := create_tween()
		tween.tween_property(node, "position", _tile_to_world(tile) + Vector3(0, 0.58 + _tile_height(tile), 0), 0.34).set_trans(Tween.TRANS_SINE)
		await tween.finished
	_set_unit_tile(actor.id, tile)
	_log("%s moves to tile %d,%d." % [actor.name, tile.x + 1, tile.y + 1])
	_refresh_ui()
	_refresh_units()

func _attack(actor: Dictionary, target: Dictionary, action: String) -> void:
	var actor_node: Node3D = unit_nodes.get(actor.id)
	var target_node: Node3D = unit_nodes.get(target.id)
	if actor_node and target_node:
		var original := actor_node.position
		var lunge := original.lerp(target_node.position, 0.34)
		var tween := create_tween()
		tween.tween_property(actor_node, "position", lunge + Vector3(0, 0.32, 0), 0.12)
		tween.tween_property(actor_node, "position", original, 0.18)
		await tween.finished
	var damage: int = ACTIONS[action].damage
	target.hp = max(0, target.hp - damage)
	_log("[color=#cfc3a9]%s[/color] uses [color=#a98c45]%s[/color]. %s suffers [color=#c0392b]%d[/color]." % [actor.name, action, target.name, damage])
	_refresh_ui()
	_refresh_units()

func _highlight_move_tiles() -> void:
	for tile_node in tile_nodes.values():
		var tile: Vector2i = tile_node.get_meta("tile")
		var mesh := tile_node.get_child(0) as MeshInstance3D
		mesh.material_override = _terrain_material(_terrain_at(tile))
	if not move_mode:
		return
	for tile in _reachable_tiles(_actor()):
		var tile_node: StaticBody3D = tile_nodes.get(tile)
		if tile_node:
			var mesh := tile_node.get_child(0) as MeshInstance3D
			var mat := StandardMaterial3D.new()
			mat.albedo_color = Color(0.74, 0.58, 0.14, 0.72)
			mat.emission_enabled = true
			mat.emission = Color(0.72, 0.45, 0.08)
			mat.emission_energy_multiplier = 0.35
			mesh.material_override = mat

func _refresh_ui() -> void:
	var actor := _actor()
	var target := _unit_by_id(selected_target_id)
	var target_text: String = target.name if not target.is_empty() else "none"
	var distance: int = _distance(actor.tile, target.tile) if not actor.is_empty() and not target.is_empty() else 0
	ui_label.text = "%s acts / target: %s / distance: %d" % [actor.name.to_upper(), target_text, distance]

func _reachable_tiles(actor: Dictionary) -> Array[Vector2i]:
	var result: Array[Vector2i] = []
	var max_move: int = MOVE_POINTS.get(actor.id, 3)
	for y in GRID_H:
		for x in GRID_W:
			var tile := Vector2i(x, y)
			if tile != actor.tile and _distance(actor.tile, tile) <= max_move and not _occupied(tile):
				result.append(tile)
	return result

func _terrain_material(type: String) -> StandardMaterial3D:
	var mat := StandardMaterial3D.new()
	match type:
		"cover":
			mat.albedo_color = Color(0.24, 0.2, 0.15)
		"altar":
			mat.albedo_color = Color(0.2, 0.11, 0.34)
			mat.emission_enabled = true
			mat.emission = Color(0.16, 0.06, 0.28)
		"corpse":
			mat.albedo_color = Color(0.16, 0.24, 0.12)
		"blood":
			mat.albedo_color = Color(0.34, 0.03, 0.025)
		"high":
			mat.albedo_color = Color(0.38, 0.31, 0.16)
		_:
			mat.albedo_color = Color(0.16, 0.13, 0.095)
	mat.roughness = 1.0
	return mat

func _tile_height(tile: Vector2i) -> float:
	return 0.42 if _terrain_at(tile) == "high" else 0.16

func _terrain_at(tile: Vector2i) -> String:
	return terrain.get(tile, "ash")

func _tile_to_world(tile: Vector2i) -> Vector3:
	return Vector3((tile.x - (GRID_W - 1) * 0.5) * TILE, 0, (tile.y - (GRID_H - 1) * 0.5) * TILE)

func _distance(a: Vector2i, b: Vector2i) -> int:
	return abs(a.x - b.x) + abs(a.y - b.y)

func _occupied(tile: Vector2i) -> bool:
	for unit in units:
		if unit.hp > 0 and unit.tile == tile:
			return true
	return false

func _actor() -> Dictionary:
	return _unit_by_id(selected_unit_id)

func _unit_by_id(id: String) -> Dictionary:
	for unit in units:
		if unit.id == id:
			return unit
	return {}

func _set_unit_tile(id: String, tile: Vector2i) -> void:
	for i in units.size():
		if units[i].id == id:
			units[i].tile = tile
			return

func _log(text: String) -> void:
	log_lines.append(text)
	if log_lines.size() > 6:
		log_lines.pop_front()
	if log_box:
		log_box.text = "\n".join(log_lines)
