<div align="center">

# 🔐 Phantom — Messagerie Chiffrée de Bout en Bout

**Application de messagerie sécurisée avec chiffrement E2E (RSA + AES-GCM), construite avec React, FastAPI et MySQL.**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

---

Phantom est une application de messagerie instantanée conçue pour garantir la **confidentialité totale** de vos échanges.  
Chaque message est chiffré côté client avant d'être transmis — **personne**, pas même le serveur, ne peut lire vos conversations.

</div>

---

## 📑 Table des matières

- [✨ Fonctionnalités](#-fonctionnalités)
- [🏗️ Architecture & Technologies](#️-architecture--technologies)
- [🔒 Chiffrement](#-chiffrement)
- [🚀 Démarrage rapide (Docker)](#-démarrage-rapide-docker)
- [🛠️ Installation manuelle](#️-installation-manuelle)
- [📖 Documentation de l'API](#-documentation-de-lapi)
- [⚠️ Limitations connues](#️-limitations-connues)
- [📄 Licence](#-licence)

---

## ✨ Fonctionnalités

- 💬 **Messagerie instantanée** — Communication en temps réel via Long Polling
- 🔐 **Chiffrement de bout en bout** — RSA + AES-GCM, les messages sont chiffrés *avant* de quitter votre navigateur
- 🖼️ **Envoi de médias** — Images et audio chiffrés avec AES-GCM pour les données volumineuses
- 🗄️ **Stockage local sécurisé** — Utilisation d'IndexedDB pour un stockage persistant côté client
- 🐳 **Déploiement Docker** — Un seul `docker-compose up` pour tout lancer

---

## 🏗️ Architecture & Technologies

```
┌──────────────┐       HTTP/REST       ┌──────────────┐       SQL        ┌──────────────┐
│              │  ◄──────────────────►  │              │  ◄────────────►  │              │
│   Frontend   │     Long Polling      │   Backend    │    SQLAlchemy    │    MySQL      │
│  React + Vite│                       │   FastAPI    │                  │              │
│              │                       │   Python     │                  │              │
└──────────────┘                       └──────────────┘                  └──────────────┘
       │
       ▼
  IndexedDB
 (stockage local)
```

| Couche | Technologies | Rôle |
|--------|-------------|------|
| **Frontend** | React 19, Vite 6 | Interface utilisateur réactive et moderne |
| **Backend** | FastAPI, SQLAlchemy, Uvicorn | API REST, logique métier, ORM |
| **Base de données** | MySQL | Stockage persistant des données serveur |
| **Stockage local** | IndexedDB | Stockage NoSQL côté navigateur, résistant au cache |
| **Chiffrement** | RSA, AES-GCM, SHA-256 | Confidentialité et intégrité des échanges |
| **DevOps** | Docker, Docker Compose | Conteneurisation et déploiement simplifié |

### Librairies notables

**Backend (Python):**
| Librairie | Usage |
|-----------|-------|
| `FastAPI` | Framework API asynchrone haute performance |
| `SQLAlchemy` | ORM pour la gestion de la base de données |
| `cryptography` | Hachage des mots de passe (SHA-256) |
| `colorlog` | Logs colorés et structurés |
| `sqlacodegen` | Rétro-ingénierie de la BDD vers des modèles Python |

**Frontend (JavaScript):**
| Librairie | Usage |
|-----------|-------|
| `React 19` | Composants UI réactifs |
| `Vite 6` | Bundler ultra-rapide avec HMR |

---

## 🔒 Chiffrement

Phantom implémente un chiffrement **hybride** combinant cryptographie asymétrique et symétrique :

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ENVOI D'UN MESSAGE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Génération d'une clé AES aléatoire + nonce (os.urandom)        │
│  2. Chiffrement du message avec AES-GCM (clé symétrique)           │
│  3. Chiffrement de la clé AES avec la clé publique RSA du          │
│     destinataire                                                    │
│  4. Envoi : message chiffré + clé AES chiffrée + nonce             │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                      RÉCEPTION DU MESSAGE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Déchiffrement de la clé AES avec la clé privée RSA             │
│  2. Déchiffrement du message avec AES-GCM + nonce                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

| Algorithme | Type | Utilisation |
|-----------|------|-------------|
| **RSA** | Asymétrique (paire de clés) | Échange sécurisé de la clé AES |
| **AES-GCM** | Symétrique | Chiffrement du contenu (messages, images, audio) |
| **SHA-256** | Hachage | Hachage des mots de passe (irréversible) |
| **os.urandom** | Génération aléatoire | Création des sels et nonces cryptographiques |

### Communication en temps réel — Long Polling

Phantom utilise le **Long Polling** pour fournir une communication quasi instantanée sans surcharger le serveur :

```js
async function LongPollingRequest() {
    const response = await fetch("http://api/toutLesMessages");
    if (response.status === 200) {
        const data = await response.json();
        setMessage(data);

        setTimeout(async () => {
            await LongPollingRequest();
        }, 500);
    } else {
        setTimeout(async () => {
            await LongPollingRequest();
        }, 1000);
    }
}
```

> La connexion reste ouverte pendant un intervalle défini (30s à 1min). Dès qu'elle se ferme, une nouvelle requête est immédiatement relancée — offrant ainsi une réactivité proche du temps réel.

---

## 🚀 Démarrage rapide (Docker)

> **Méthode recommandée** — Un seul outil à installer : [Docker](https://www.docker.com/get-started/)

### Prérequis

- [Docker](https://www.docker.com/get-started/) installé et lancé

### Étapes

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/votre-utilisateur/Phantom.git
   cd Phantom
   ```

2. **Corriger les fins de ligne** (Windows uniquement)  
   Dans VS Code, ouvrir `wait-for-it.sh` → en bas à droite, changer `CRLF` en `LF`.

3. **Lancer les conteneurs**
   ```bash
   docker-compose up --build
   ```

4. **Ouvrir l'application**  
   Rendez-vous sur [http://localhost:5173](http://localhost:5173)

---

## 🛠️ Installation manuelle

<details>
<summary><strong>📦 Backend (Python)</strong></summary>

### 1. Installer Python

Téléchargez et installez [Python 3.10+](https://www.python.org/downloads/).

### 2. Installer les dépendances

```bash
cd BackEnd
pip install -r requirements.txt
```

### 3. Créer la base de données

Importez le schéma SQL situé dans `BackEnd/BDD/bdd.sql` dans votre instance MySQL.

### 4. Configurer les variables

Copiez le fichier modèle et renseignez vos variables :

```bash
cp variables-example.json variables.json
```

Éditez `variables.json` avec vos paramètres (hôte BDD, identifiants, etc.).

### 5. Lancer le serveur

```bash
uvicorn main:app --reload
```

</details>

<details>
<summary><strong>🎨 Frontend (React)</strong></summary>

### 1. Installer Node.js

Téléchargez et installez [Node.js](https://nodejs.org/fr/download).

### 2. Installer les dépendances

```bash
cd FrontEnd
npm install
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:5173](http://localhost:5173).

</details>

---

## 📖 Documentation de l'API

Une fois le backend lancé, la documentation interactive de l'API est disponible :

| Interface | URL |
|-----------|-----|
| **Swagger UI** | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **ReDoc** | [http://localhost:8000/redoc](http://localhost:8000/redoc) |

---

## ⚠️ Limitations connues

| Problème | Détail |
|----------|--------|
| 🎙️ Audio Chrome → Safari | L'envoi de messages audio de Chrome vers Safari peut échouer en raison d'une mauvaise conversion WAV → MPEG côté Chrome. |

---

## 📄 Licence

Ce projet est distribué sous la licence **GNU General Public License v3.0**.  
Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">

**Fait avec ❤️ et beaucoup de chiffrement**

</div>
