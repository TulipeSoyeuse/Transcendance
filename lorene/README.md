## Structure actuelle

### 🔹 Frontend
- En cours
- Totalement indépendant du backend pour l'instant

### 🔹 Backend
- Arborescence des dossiers générée avec fastify-cli
- Rien d'implémenté pour l'instant

### Lancer le projet
- Chaque service tourne dans un conteneur distinct, lancer le tout avec `docker-compose` via le `Makefile`
- Frontend : http://localhost:3000
- Backend : http://localhost:8080

> #### Commandes
> - `make up`
> - `make down`
> - `make start`
> - `make stop`
