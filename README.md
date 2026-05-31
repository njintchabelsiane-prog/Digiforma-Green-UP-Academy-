# Green UP Academy

Plateforme academique numerique developpee par l'equipe Digiforma.

**Cheffe de projet** : Synthia Norr  
**Equipe** : Prisca - Belsiane - Sandra  
**Periode** : 21 mai - 13 juin 2026

---

## Structure du projet

```
Digiforma-Green-UP-Academy-/
├── backend/        API Django REST Framework
├── frontend/       Interface React
└── README.md
```

---

## Installation du Backend

### Prerequis

- Python 3.11+
- pip

### Etapes

```bash
# 1. Cloner le projet
git clone https://github.com/njintchabelsiane-prog/Digiforma-Green-UP-Academy-.git
cd Digiforma-Green-UP-Academy-

# 2. Aller dans le backend
cd backend

# 3. Creer et activer l environnement virtuel
python3 -m venv venv
source venv/bin/activate

# 4. Installer les dependances
pip install -r requirements.txt

# 5. Appliquer les migrations
python manage.py migrate

# 6. Creer un superutilisateur
python manage.py createsuperuser

# 7. Lancer le serveur
python manage.py runserver
```

L'API est accessible sur : http://127.0.0.1:8000

---
### 2. Créer et configurer le fichier .env

bash
cp .env.example .env

## Installation du Frontend

### Prerequis

- Node.js 18+
- npm

### Etapes

```bash
# 1. Aller dans le frontend
cd frontend

# 2. Installer les dependances
npm install

# 3. Lancer l application
npm start
```

L'application est accessible sur : http://localhost:3000

---

## Endpoints API disponibles

| Methode | Endpoint              | Description                              | Authentification |
|---------|-----------------------|------------------------------------------|------------------|
| POST    | /api/auth/login/      | Connexion - retourne access+refresh token | Non              |
| POST    | /api/auth/logout/     | Deconnexion - invalide le refresh token   | Oui              |
| POST    | /api/auth/refresh/    | Renouveler le token d acces              | Non              |
| GET     | /api/auth/me/         | Profil de l utilisateur connecte         | Oui              |

---

## Branches Git

| Branche                     | Role                                    |
|-----------------------------|-----------------------------------------|
| main                        | Version officielle stable               |
| develop                     | Version de travail partagee             |
| feature/GUA-XX-description  | Branche de developpement par tache      |

---

## Workflow Git

```bash
# Chaque matin avant de coder
git checkout develop
git pull origin develop

# Creer sa branche de travail
git checkout -b feature/GUA-XX-description

# Sauvegarder son travail
git add .
git commit -m "feat(scope): description"
git push origin feature/GUA-XX-description

# Ouvrir une Pull Request sur GitHub vers develop
# Attendre la validation de Synthia avant de merger
```

---

## Modules developpes

- Module 1 - Gestion des Classes
- Module 5 - Presences et Absences

---

## Stack technique

| Partie                        | Technologie                            |
|-------------------------------|----------------------------------------|
| Backend                       | Django 5.2 + Django REST Framework     |
| Authentification              | JWT (djangorestframework-simplejwt)    |
| Frontend                      | React + Axios                          |
| Base de donnees developpement | SQLite                                 |
| Base de donnees production    | PostgreSQL                             |
| Deploiement Backend           | Railway                                |
| Deploiement Frontend          | Vercel                                 |

---

## Conventions de commits

| Type  | Usage                        | Exemple                                         |
|-------|------------------------------|-------------------------------------------------|
| feat  | Nouvelle fonctionnalite      | feat(auth): ajouter endpoint login JWT          |
| fix   | Correction de bug            | fix(classes): corriger filtre classes archivees |
| docs  | Documentation                | docs(readme): ajouter instructions installation |
| style | Mise en forme                | style(dashboard): ajuster couleurs tableau      |
| test  | Ajout de tests               | test(presence): ajouter tests modele Presence   |
| chore | Configuration / dependances  | chore(deps): mettre a jour requirements.txt     |

---

## Regles d equipe

- Daily Standup 15 minutes chaque matin
- Toujours creer une branche feature avant de coder
- Tout blocage de plus de 30 minutes doit etre signale a Synthia
- Toute tache est considered terminee uniquement apres ouverture d une Pull Request
- Les secrets (mots de passe, cles API) ne doivent jamais etre commites sur GitHub
