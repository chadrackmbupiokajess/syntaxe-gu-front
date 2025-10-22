# Backend (Django)

## Installation

1. Créer un environnement virtuel et installer les dépendances:
```
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
```

2. Variables d'environnement
- Copiez `backend/.env.example` vers `backend/.env` (déjà fourni) et ajustez si nécessaire.

## Démarrage
```
python backend/manage.py migrate
python backend/manage.py runserver 0.0.0.0:8000
```

## Endpoints de test
- GET `http://localhost:8000/api/health` -> `{ "status": "ok" }`

## Notes
- Base de données: SQLite par défaut (`backend/db.sqlite3`).
- CORS activé pour permettre les requêtes du frontend `web`.
