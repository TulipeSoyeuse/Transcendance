FILEPATH	=	./docker-compose.yml
COMPOSE		=	docker compose -f

# ------------  RULES  ------------------------------------------------------ #
all:			up

up:
			@$(COMPOSE) $(FILEPATH) up -d

down:
			@$(COMPOSE) $(FILEPATH) down

start:
			@$(COMPOSE) $(FILEPATH) start

stop:
			@$(COMPOSE) $(FILEPATH) stop

cleanimg:
			@docker image prune -a

fclean:			down cleanimg

re:			fclean all

.PHONY:			all up down start stop cleanimg cleanvol fclean re
