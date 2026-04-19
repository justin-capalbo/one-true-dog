extends Node

signal state_changed

enum Currency { TREATS, BONES, STICKS }

const CURRENCY_NAMES := { Currency.TREATS: "treats", Currency.BONES: "bones", Currency.STICKS: "sticks" }

class Upgrade:
	var level: int = 0
	var unlocked: bool = false
	var base_cost: int
	var cost_exponent: float
	var currency: int

	func _init(p_base_cost: int, p_exponent: float, p_currency: int) -> void:
		base_cost = p_base_cost
		cost_exponent = p_exponent
		currency = p_currency

	func cost() -> int:
		return int(base_cost * pow(cost_exponent, level))

	func try_buy(currencies: Dictionary) -> int:
		var c = cost()
		if currencies[currency] >= c:
			level += 1
			return c
		return 0

	func should_show(currencies: Dictionary) -> bool:
		if not unlocked and currencies[currency] >= base_cost:
			unlocked = true
		return unlocked

# Resources
var currencies := { Currency.TREATS: 0.0, Currency.BONES: 0.0, Currency.STICKS: 0.0 }
var lifetime := { Currency.TREATS: 0.0, Currency.BONES: 0.0, Currency.STICKS: 0.0 }
var holes_dug: float = 0.0

# Upgrades
var helpers_upgrade: Upgrade
var nose_upgrade: Upgrade
var bone_digger_upgrade: Upgrade

# Config
const TICK_RATE: float = 0.1
var holes_per_helper_per_tick: float = 0.05

func _ready() -> void:
	helpers_upgrade = Upgrade.new(10, 1.8, Currency.TREATS)
	nose_upgrade = Upgrade.new(40, 2.2, Currency.TREATS)
	bone_digger_upgrade = Upgrade.new(100, 2.2, Currency.TREATS)

func buy(upgrade: Upgrade) -> void:
	currencies[upgrade.currency] -= upgrade.try_buy(currencies)
	state_changed.emit()

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
	state_changed.emit()