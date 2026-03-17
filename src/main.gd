extends Control

enum Currency { TREATS, BONES, STICKS }

const CURRENCY_NAMES := { Currency.TREATS: "treats", Currency.BONES: "bones", Currency.STICKS: "sticks" }

class Upgrade:
	var level: int = 0
	var unlocked: bool = false
	var base_cost: int
	var cost_exponent: float
	var currency: int
	var label_node: Label
	var button_node: Button

	func _init(p_base_cost: int, p_exponent: float, p_currency: int, p_label: Label, p_button: Button) -> void:
		base_cost = p_base_cost
		cost_exponent = p_exponent
		currency = p_currency
		label_node = p_label
		button_node = p_button

	func cost() -> int:
		return int(base_cost * pow(cost_exponent, level))

	func try_buy(currencies: Dictionary) -> int:
		var c = cost()
		if currencies[currency] >= c:
			level += 1
			return c
		return 0

	func refresh_ui(currencies: Dictionary, label_text: String) -> void:
		var amount: float = currencies[currency]
		if not unlocked and amount >= base_cost:
			unlocked = true
		label_node.visible = unlocked
		button_node.visible = unlocked
		if unlocked:
			label_node.text = label_text
			button_node.text = "Upgrade for %d %s" % [cost(), CURRENCY_NAMES[currency]]
			button_node.disabled = amount < cost()

# Resources
var currencies := { Currency.TREATS: 0.0, Currency.BONES: 0.0, Currency.STICKS: 0.0 }
var lifetime := { Currency.TREATS: 0.0, Currency.BONES: 0.0, Currency.STICKS: 0.0 }
var holes_dug: float = 0.0
var nose_upgrade: Upgrade
var helpers_upgrade: Upgrade
var bone_digger_upgrade: Upgrade

# Config
const TICK_RATE: float = 0.1
var holes_per_helper_per_tick: float = 0.05

# Node references
@onready var treats_label: Label = $UI/TreatsLabel
@onready var bones_label: Label = $UI/BonesLabel
@onready var holes_label: Label = $UI/HolesLabel
@onready var dig_button: Button = $UI/DigButton
@onready var dig_timer: Timer = $DigTimer
@onready var nose_label: Label = $UI/NoseLabel
@onready var nose_button: Button = $UI/NoseButton
@onready var helpers_label: Label = $UI/HelpersLabel
@onready var helpers_button: Button = $UI/HelpersButton
@onready var bone_digger_label: Label = $UI/BoneDiggerLabel
@onready var bone_digger_button: Button = $UI/BoneDiggerButton

func _ready() -> void:
	helpers_upgrade = Upgrade.new(10, 1.8, Currency.TREATS, helpers_label, helpers_button)
	helpers_button.pressed.connect(func(): _buy(helpers_upgrade))

	nose_upgrade = Upgrade.new(40, 2.2, Currency.TREATS, nose_label, nose_button)
	nose_button.pressed.connect(func(): _buy(nose_upgrade))

	bone_digger_upgrade = Upgrade.new(100, 2.2, Currency.TREATS, bone_digger_label, bone_digger_button)
	bone_digger_button.pressed.connect(func(): _buy(bone_digger_upgrade))

	dig_button.pressed.connect(_on_dig_pressed)
	dig_timer.wait_time = TICK_RATE
	dig_timer.timeout.connect(_on_dig_timer_timeout)
	update_labels()

func _buy(upgrade: Upgrade) -> void:
	currencies[upgrade.currency] -= upgrade.try_buy(currencies)
	update_labels()

func treats_per_hole() -> float:
	return 1.0 + 0.5 * nose_upgrade.level

func bones_per_hole() -> float:
	return 0.1 * bone_digger_upgrade.level

func _earn(currency: Currency, amount: float) -> void:
	currencies[currency] += amount
	lifetime[currency] += amount

func dig(amount: float) -> void:
	holes_dug += amount
	_earn(Currency.TREATS, amount * treats_per_hole())
	_earn(Currency.BONES, amount * bones_per_hole())

func _on_dig_pressed() -> void:
	dig(1.0)
	update_labels()

func _on_dig_timer_timeout() -> void:
	var passive: float = helpers_upgrade.level * holes_per_helper_per_tick
	if passive > 0.0:
		dig(passive)
		update_labels()

func update_labels() -> void:
	treats_label.text = "Treats: %.2f" % currencies[Currency.TREATS]
	treats_label.visible = lifetime[Currency.TREATS] >= 1.0
	bones_label.text = "Bones: %.2f" % currencies[Currency.BONES]
	bones_label.visible = lifetime[Currency.BONES] >= 1.0
	holes_label.text = "Holes: %.4f" % holes_dug
	holes_label.visible = holes_dug >= 1.0

	var holes_per_sec: float = helpers_upgrade.level * holes_per_helper_per_tick / TICK_RATE

	helpers_upgrade.refresh_ui(currencies,
		"Helper Dogs - %d hired (%.2f holes/sec)" % [helpers_upgrade.level, holes_per_sec])
	nose_upgrade.refresh_ui(currencies,
		"Nose for Treats - Rank %d (avg %.1f treats/hole)" % [nose_upgrade.level, treats_per_hole()])
	bone_digger_upgrade.refresh_ui(currencies,
		"Bone Digger - Rank %d (%.1f bones/hole)" % [bone_digger_upgrade.level, bones_per_hole()])
