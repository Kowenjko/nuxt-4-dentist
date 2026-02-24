SHELL := /bin/bash

DEV_COMPOSE = docker compose

# --------------------------
# DEV COMMANDS
# --------------------------

dev:
	$(DEV_COMPOSE) up --build

down:
	$(DEV_COMPOSE) down

up:
	$(DEV_COMPOSE) up -d

res-dev: down dev

restart: down up
	
logs:
	$(DEV_COMPOSE) logs -f

ps:
	$(DEV_COMPOSE) ps

