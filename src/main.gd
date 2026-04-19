extends Control

@onready var treats_label: Label = $UI/StatsBar/TreatsLabel
@onready var bones_label: Label = $UI/StatsBar/BonesLabel
@onready var holes_label: Label = $UI/StatsBar/HolesLabel
@onready var dig_timer: Timer = $DigTimer

func _ready() -> void:
	dig_timer.wait_time = GameState.TICK_RATE
	dig_timer.timeout.connect(_on_tick)
	GameState.state_changed.connect(refresh_stats)
	refresh_stats()

func _on_tick() -> void:
	var passive: float = GameState.helpers_upgrade.level * GameState.holes_per_helper_per_tick
	if passive > 0.0:
		GameState.dig(passive)

func refresh_stats() -> void:
	treats_label.text = "Treats: %.2f" % GameState.currencies[GameState.Currency.TREATS]
	treats_label.modulate.a = 1.0 if GameState.lifetime[GameState.Currency.TREATS] >= 1.0 else 0.0
	bones_label.text = "Bones: %.2f" % GameState.currencies[GameState.Currency.BONES]
	bones_label.modulate.a = 1.0 if GameState.lifetime[GameState.Currency.BONES] >= 1.0 else 0.0
	holes_label.text = "Holes: %.4f" % GameState.holes_dug
	holes_label.modulate.a = 1.0 if GameState.holes_dug >= 1.0 else 0.0
