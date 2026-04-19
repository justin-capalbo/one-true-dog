extends VBoxContainer

@onready var dig_button: Button = $DigButton
@onready var helpers_label: Label = $MarginContainer/Upgrades/HelpersLabel
@onready var helpers_button: Button = $MarginContainer/Upgrades/HelpersButton
@onready var nose_label: Label = $MarginContainer/Upgrades/NoseLabel
@onready var nose_button: Button = $MarginContainer/Upgrades/NoseButton
@onready var bone_digger_label: Label = $MarginContainer/Upgrades/BoneDiggerLabel
@onready var bone_digger_button: Button = $MarginContainer/Upgrades/BoneDiggerButton

func _ready() -> void:
	dig_button.pressed.connect(func(): GameState.dig(1.0))
	helpers_button.pressed.connect(func(): GameState.buy(GameState.helpers_upgrade))
	nose_button.pressed.connect(func(): GameState.buy(GameState.nose_upgrade))
	bone_digger_button.pressed.connect(func(): GameState.buy(GameState.bone_digger_upgrade))
	GameState.state_changed.connect(refresh)
	refresh()

func refresh() -> void:
	var holes_per_sec: float = GameState.helpers_upgrade.level * GameState.holes_per_helper_per_tick / GameState.TICK_RATE

	_refresh_upgrade(GameState.helpers_upgrade, helpers_label, helpers_button,
		"Helper Dogs: %d hired (%.2f holes/sec)" % [GameState.helpers_upgrade.level, holes_per_sec])
	_refresh_upgrade(GameState.nose_upgrade, nose_label, nose_button,
		"Nose for Treats: %d (avg %.1f treats/hole)" % [GameState.nose_upgrade.level, GameState.treats_per_hole()])
	_refresh_upgrade(GameState.bone_digger_upgrade, bone_digger_label, bone_digger_button,
		"Bone Digger: %d (%.1f bones/hole)" % [GameState.bone_digger_upgrade.level, GameState.bones_per_hole()])

func _refresh_upgrade(upgrade, label: Label, button: Button, label_text: String) -> void:
	var visible_state: bool = upgrade.unlocked
	label.visible = visible_state
	button.visible = visible_state
	if visible_state:
		label.text = label_text
		button.text = "Upgrade for %d %s" % [upgrade.cost(), GameState.CURRENCY_NAMES[upgrade.currency]]
		button.disabled = GameState.currencies[upgrade.currency] < upgrade.cost()

