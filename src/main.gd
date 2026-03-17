extends Control

class Upgrade:
	var level: int = 0
	var unlocked: bool = false
	var base_cost: int
	var cost_exponent: float
	var label_node: Label
	var button_node: Button

	func _init(p_base_cost: int, p_exponent: float, p_label: Label, p_button: Button) -> void:
		base_cost = p_base_cost
		cost_exponent = p_exponent
		label_node = p_label
		button_node = p_button

	func cost() -> int:
		return int(base_cost * pow(cost_exponent, level))

	func try_buy(treats: float) -> int:
		var c = cost()
		if treats >= c:
			level += 1
			return c
		return 0

	func refresh_ui(treats: float, label_text: String) -> void:
		if not unlocked and treats >= base_cost:
			unlocked = true
		label_node.visible = unlocked
		button_node.visible = unlocked
		if unlocked:
			label_node.text = label_text
			button_node.text = "Upgrade (%d treats)" % cost()
			button_node.disabled = treats < cost()

# Resources
var treats: float = 0.0
var holes_dug: float = 0.0
var nose_upgrade: Upgrade
var helpers_upgrade: Upgrade

# Config
const TICK_RATE: float = 0.1
var holes_per_helper_per_tick: float = 0.05

# Node references
@onready var treats_label: Label = $UI/TreatsLabel
@onready var holes_label: Label = $UI/HolesLabel
@onready var dig_button: Button = $UI/DigButton
@onready var dig_timer: Timer = $DigTimer
@onready var nose_label: Label = $UI/NoseLabel
@onready var nose_button: Button = $UI/NoseButton
@onready var helpers_label: Label = $UI/HelpersLabel
@onready var helpers_button: Button = $UI/HelpersButton

func _ready() -> void:
	helpers_upgrade = Upgrade.new(10, 1.8, helpers_label, helpers_button)
	helpers_button.pressed.connect(func(): _buy(helpers_upgrade))

	nose_upgrade = Upgrade.new(40, 2.2, nose_label, nose_button)
	nose_button.pressed.connect(func(): _buy(nose_upgrade))

	dig_button.pressed.connect(_on_dig_pressed)
	dig_timer.wait_time = TICK_RATE
	dig_timer.timeout.connect(_on_dig_timer_timeout)
	update_labels()

func _buy(upgrade: Upgrade) -> void:
	treats -= upgrade.try_buy(treats)
	update_labels()

func treats_per_hole() -> float:
	return 1.0 + 0.5 * nose_upgrade.level

func dig(amount: float) -> void:
	holes_dug += amount
	treats += amount * treats_per_hole()

func _on_dig_pressed() -> void:
	dig(1.0)
	update_labels()

func _on_dig_timer_timeout() -> void:
	var passive: float = helpers_upgrade.level * holes_per_helper_per_tick
	if passive > 0.0:
		dig(passive)
		update_labels()

func update_labels() -> void:
	treats_label.text = "Treats: %.2f" % treats
	holes_label.text = "Holes: %.4f" % holes_dug
	nose_upgrade.refresh_ui(treats,
		"Nose for Treats - Rank %d (avg %.1f treats/hole)" % [nose_upgrade.level, 1.0 + 0.5 * nose_upgrade.level])
	var holes_per_sec: float = helpers_upgrade.level * holes_per_helper_per_tick / TICK_RATE
	helpers_upgrade.refresh_ui(treats,
		"Helper Dogs - %d hired (%.2f holes/sec)" % [helpers_upgrade.level, holes_per_sec])
