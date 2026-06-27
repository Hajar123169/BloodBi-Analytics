
# BloodBI Analytics

**BloodBI Analytics** est une plateforme open source de gestion et d'aide à la décision pour le don de sang. Le projet centralise les donneurs, les patients, les demandes de sang, les stocks, les rendez-vous, les alertes et les rapports dans une architecture complète composée d'une application web, d'une application mobile, d'un backend REST, d'une base de données MySQL, de vues BI/OLAP et de modules d'intelligence artificielle.

Le système est conçu comme un prototype académique et reproductible pour la gestion des banques de sang, l'analyse décisionnelle et la planification assistée par l'IA. Les résultats prédictifs sont fournis à des fins de démonstration et de recherche ; ils ne constituent pas un avis médical et ne doivent pas être utilisés comme outil clinique certifié.

---

## Table des matières

- [Objectif du projet](#objectif-du-projet)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Architecture générale](#architecture-générale)
- [Structure du projet](#structure-du-projet)
- [Technologies utilisées](#technologies-utilisées)
- [Démarrage rapide avec Docker](#démarrage-rapide-avec-docker)
- [Installation manuelle](#installation-manuelle)
- [Application mobile](#application-mobile)
- [API principales](#api-principales)
- [Modules BI et IA](#modules-bi-et-ia)
- [Base de données](#base-de-données)
- [Comptes de test](#comptes-de-test)
- [Limites actuelles](#limites-actuelles)
- [Perspectives d'amélioration](#perspectives-damélioration)
- [Auteurs](#auteurs)
- [Licence](#licence)

---

## Objectif du projet

Dans de nombreux contextes opérationnels, les informations liées au don de sang sont dispersées entre des registres manuels, des fichiers locaux, des listes de demandes et des échanges informels. Cette fragmentation peut ralentir la détection des pénuries, compliquer la priorisation des urgences et augmenter le temps nécessaire pour trouver des donneurs compatibles.

BloodBI Analytics répond à ce problème en proposant une plateforme unifiée permettant de :

- suivre les donneurs, patients, centres, stocks et demandes de sang ;
- gérer les rendez-vous et les donations ;
- visualiser les indicateurs clés à travers des tableaux de bord BI ;
- analyser les données avec des vues SQL et OLAP ;
- recommander des donneurs compatibles ;
- afficher des résultats de prédiction pour la demande en sang et le retour des donneurs ;
- fournir une couche d'aide à la décision basée sur des scores de risque, des explications et des rapports.

---

## Fonctionnalités principales

### Interface web React

- Authentification web pour les administrateurs et les gestionnaires.
- Tableau de bord KPI : donneurs, demandes actives, demandes critiques, stocks critiques et taux de satisfaction.
- Gestion des donneurs et statistiques par ville, groupe sanguin et disponibilité.
- Gestion des demandes de sang par urgence, statut, hôpital et ville.
- Suivi des stocks par centre, groupe sanguin et composant.
- Module de smart matching pour recommander les donneurs compatibles.
- Gestion des rendez-vous et des donations.
- Alertes critiques, rapports et vues OLAP.
- Pages d'aide à la décision et de prédictions IA.

### Application mobile React Native Expo

- Inscription et connexion des donneurs.
- Consultation du profil donneur.
- Vérification d'éligibilité.
- Liste des demandes urgentes.
- Création d'une demande de sang côté patient.
- Réservation d'un don.
- Génération d'un ticket PDF de donation.
- Recherche de donneurs compatibles.
- Historique des donations.

### Backend Spring Boot

- API REST centralisée.
- Gestion des utilisateurs, donneurs, patients, centres, demandes, stocks, rendez-vous, donations, alertes et rapports.
- Accès aux données avec Spring Data JPA.
- Configuration CORS pour le web et le mobile.
- WebSocket/STOMP pour les alertes et la communication temps réel.
- Endpoints BI, OLAP, prédictions et aide à la décision.

### BI, OLAP et IA

- Vues SQL pour l'analyse décisionnelle.
- Analyse par ville, centre, groupe sanguin et période.
- Modèle KNN pour l'analyse du retour des donneurs.
- Modèle de régression linéaire pour la prévision de la demande en sang.
- Scores de risque, explications, rapports hebdomadaires et assistant IA simplifié.

---

## Architecture générale

```text
React Web Dashboard       React Native Expo Mobile App
        |                              |
        | HTTP / JSON                  | HTTP / JSON
        |                              |
        +-------------+----------------+
                      |
              Spring Boot REST API
                      |
        +-------------+----------------+
        |                              |
MySQL operational DB        Models / JSON / Graphs
        |
SQL views and OLAP reporting
```

Le projet suit une architecture client-serveur en couches :

1. **Frontend web** : interface d'administration et de BI.
2. **Application mobile** : interface donneur/patient.
3. **Backend REST** : logique métier, APIs, BI, IA et persistance.
4. **Base MySQL** : stockage opérationnel et données analytiques.
5. **Scripts Python** : entraînement et génération des artefacts IA.
6. **Docker Compose** : exécution reproductible du web, du backend et de MySQL.

---

## Structure du projet

```text
BloodBi-Analytics/
├── backend/                         # Backend Spring Boot
│   ├── src/main/java/com/bloodbi/
│   │   ├── ai/                      # Services IA et aide à la décision
│   │   ├── config/                  # Configuration Spring, CORS, WebSocket
│   │   ├── controller/              # REST controllers
│   │   ├── dto/                     # Objets de transfert
│   │   ├── model/                   # Entités JPA
│   │   ├── repository/              # Repositories Spring Data JPA
│   │   └── realtime/                # WebSocket / alertes temps réel
│   ├── src/main/resources/          # Configuration Spring Boot
│   ├── src/python/                  # Scripts ML Python
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                        # Dashboard React
│   ├── src/
│   │   ├── api/                     # Client Axios
│   │   ├── components/              # Composants réutilisables
│   │   └── pages/                   # Pages web principales
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── mobile-app/                      # Application mobile React Native Expo
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── navigation/
│   │   ├── screens/
│   │   ├── services/
│   │   └── utils/
│   ├── app.json
│   └── package.json
│
├── database/                        # Scripts SQL
│   ├── schema.sql                   # Schéma opérationnel
│   ├── data_warehouse_schema.sql    # Data warehouse
│   └── etl_views.sql                # Vues BI / OLAP
│
├── models/                          # Artefacts IA pré-calculés
│   ├── knn_donor_model.pkl
│   ├── lr_demand_model.pkl
│   ├── knn_results.json
│   ├── lr_results.json
│   └── graphs/
│
├── docs/                            # Documentation technique
├── docker-compose.yml
├── DOCKER_SETUP.md
├── DOCKER_IMPLEMENTATION.md
├── README.md
└── LICENSE
```

---

## Technologies utilisées

| Couche | Technologies |
|---|---|
| Web | React 18, React Router, Material UI, Recharts, Axios |
| Mobile | React Native, Expo, React Navigation, AsyncStorage, Expo Print/Sharing |
| Backend | Java 17, Spring Boot 3, Spring Web, Spring Data JPA, Spring Security, WebSocket/STOMP |
| Base de données | MySQL 8, SQL, vues analytiques, data warehouse |
| IA / ML | Python 3, pandas, NumPy, scikit-learn, joblib, matplotlib, seaborn |
| Déploiement | Docker, Docker Compose, Nginx |
| Build tools | Maven, npm |

---

## Démarrage rapide avec Docker

Docker est la méthode recommandée pour exécuter rapidement le projet.

### Prérequis

- Docker
- Docker Compose
- Git

### Étapes

```bash
# 1. Cloner le dépôt
git clone -b ai-upgrade-docker https://github.com/Hajar123169/BloodBi-Analytics.git
cd BloodBi-Analytics

# 2. Lancer les services
docker compose up -d --build

# 3. Vérifier les conteneurs
docker compose ps
```

### Accès aux services

```text
Web dashboard : http://localhost:3000
Backend API   : http://localhost:8082/api
MySQL host    : localhost:3307
MySQL service : mysql:3306 dans le réseau Docker
```

### Arrêter les services

```bash
docker compose down
```

### Supprimer les données Docker

```bash
docker compose down -v
```

---

## Installation manuelle

Cette méthode est utile pour le développement local sans Docker.

### Prérequis

- Java 17+
- Maven 3.8+
- Node.js 18+
- npm
- MySQL 8+
- Python 3.10+ pour les scripts ML
- Expo Go ou Android Emulator pour le mobile

### 1. Créer les bases MySQL

```sql
CREATE DATABASE bloodbi_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE bloodbi_dw_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Importer ensuite les scripts du dossier `database/` si nécessaire :

```bash
mysql -u root -p bloodbi_v2 < database/schema.sql
mysql -u root -p bloodbi_dw_v2 < database/data_warehouse_schema.sql
mysql -u root -p bloodbi_dw_v2 < database/etl_views.sql
```

### 2. Lancer le backend

```bash
cd backend
mvn spring-boot:run
```

Par défaut, le backend écoute sur :

```text
http://localhost:8082/api
```

La configuration se trouve dans :

```text
backend/src/main/resources/application.properties
```

### 3. Lancer le frontend web

```bash
cd frontend
npm install
npm start
```

Ouvrir :

```text
http://localhost:3000
```

### 4. Lancer l'application mobile

```bash
cd mobile-app
npm install
npx expo start
```

Pour Android Emulator, utiliser :

```text
EXPO_PUBLIC_API_URL=http://10.0.2.2:8082/api
```

Pour un téléphone physique, remplacer `10.0.2.2` par l'adresse IP locale de votre ordinateur :

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.10:8082/api npx expo start
```

---

## Application mobile

L'application mobile est destinée aux donneurs et aux patients. Elle utilise le même backend que le dashboard web, ce qui permet de partager les données entre les interfaces.

Principaux écrans :

- LoginScreen
- RegisterScreen
- HomeScreen
- RequestsScreen
- DonationsScreen
- SearchDonorScreen
- EligibilityScreen
- NotificationsScreen
- ProfileScreen

Fonctionnalités mobiles :

- inscription donneur ;
- connexion ;
- consultation des demandes urgentes ;
- création d'une demande ;
- réservation d'un don ;
- génération d'un ticket PDF ;
- recherche de donneurs ;
- suivi du profil et de l'historique.

---

## API principales

### Authentification

```text
GET  /api/auth/test
POST /api/auth/login
POST /api/auth/register
POST /api/auth/register-donor
```

### Dashboard et BI

```text
GET /api/dashboard/kpis
GET /api/dashboard/analytics
GET /api/olap/by-city
GET /api/olap/by-blood-type
GET /api/olap/by-center
GET /api/olap/by-period
```

### Gestion opérationnelle

```text
GET    /api/donors
POST   /api/donors
GET    /api/requests
POST   /api/requests
GET    /api/stocks
POST   /api/stocks
GET    /api/appointments
POST   /api/appointments
GET    /api/alerts
GET    /api/reports
GET    /api/centers
```

### Smart matching

```text
GET  /api/matching/requests/{requestId}
GET  /api/matching/search
POST /api/matching/requests/{requestId}/schedule
```

### Prédictions et aide à la décision

```text
GET  /api/predictions/status
GET  /api/predictions/demand
GET  /api/predictions/donor-behavior
GET  /api/predictions/high-risk
GET  /api/predictions/zone-risk
GET  /api/predictions/graph/{graphName}
GET  /api/ai/risk
GET  /api/ai/insight
GET  /api/ai/report
POST /api/ai/chat
```

---

## Modules BI et IA

### KNN donor-return analysis

Le modèle KNN analyse le comportement des donneurs à partir de variables inspirées de RFMT :

- recency ;
- frequency ;
- volume donné ;
- ancienneté du donneur ;
- nombre de donations récentes ;
- groupe sanguin encodé.

Artefacts associés :

```text
models/knn_donor_model.pkl
models/knn_scaler.pkl
models/knn_results.json
models/graphs/knn_confusion_matrix.png
models/graphs/knn_roc_curve.png
models/graphs/knn_feature_importance.png
models/graphs/knn_cv_scores.png
```

Métriques de démonstration :

```text
Accuracy : 85.62%
AUC-ROC  : 0.9319
CV mean  : 82.50%
```

### Linear Regression demand forecasting

Le modèle de régression linéaire prévoit la demande en sang à court terme à partir de variables calendaires et historiques :

- jour de la semaine ;
- jour du mois ;
- mois ;
- indicateur week-end ;
- groupe sanguin encodé ;
- demandes à J-1 ;
- demandes à J-7 ;
- moyenne mobile sur 7 jours.

Artefacts associés :

```text
models/lr_demand_model.pkl
models/lr_scaler.pkl
models/lr_results.json
models/graphs/lr_actual_vs_predicted.png
models/graphs/lr_forecast_30d.png
models/graphs/lr_residuals.png
models/graphs/lr_coefficients.png
```

Métriques de démonstration :

```text
RMSE : 1.7205
MAE  : 1.3778
R²   : 0.5998
```

### Important

Les modèles IA sont intégrés comme modules d'aide à la décision. Ils ne sont pas validés cliniquement et ne doivent pas être utilisés comme diagnostic ou avis médical.

---

## Base de données

Le projet utilise deux niveaux de stockage :

1. **Base opérationnelle `bloodbi_v2`** : utilisateurs, donneurs, patients, demandes, stocks, centres, rendez-vous, donations, alertes et rapports.
2. **Data warehouse `bloodbi_dw_v2`** : vues analytiques et agrégations pour la BI et l'OLAP.

Entités principales :

- `AppUser`
- `DonorProfile`
- `PatientProfile`
- `BloodBankCenter`
- `BloodRequest`
- `BloodStock`
- `Donation`
- `Appointment`
- `BloodAlert`
- `ReportItem`

---

## Comptes de test

Les identifiants de démonstration dépendent des données insérées dans `data.sql`. Le backend contient aussi un endpoint de test :

```text
GET /api/auth/test
```

Réponse attendue :

```json
{
  "message": "BloodBI backend is working"
}
```

Le mécanisme actuel retourne un token de démonstration sous la forme :

```text
demo-token-{userId}
```

---

## Limites actuelles

- Le projet est un prototype académique et une démonstration logicielle.
- L'authentification est simplifiée pour le développement et doit être renforcée avant un usage réel.
- Les mots de passe et les rôles doivent être sécurisés avec une gestion production complète.
- Les sorties IA sont basées sur des artefacts pré-calculés et des données de démonstration.
- Les modèles doivent être validés sur des jeux de données réels anonymisés avant toute utilisation opérationnelle.
- La configuration Docker utilise des identifiants par défaut ; ils doivent être changés dans un environnement réel.

---

## Perspectives d'amélioration

- Ajouter JWT, password hashing fort et contrôle d'accès par rôle.
- Ajouter Swagger/OpenAPI pour documenter l'API.
- Ajouter des tests unitaires, d'intégration et end-to-end.
- Améliorer les notifications temps réel pour les donneurs et gestionnaires.
- Améliorer la géolocalisation et le calcul des distances.
- Ajouter une pipeline de réentraînement automatique des modèles IA.
- Valider les modèles sur des données réelles anonymisées.
- Ajouter une stratégie de sauvegarde et de monitoring plus complète.
- Préparer une version production avec HTTPS, secrets Docker et configuration sécurisée.

---

## Auteurs

- **Hajar Khomssi**
- **Imane Sahnoun**

Université Chouaib Doukkali, Faculté des Sciences El Jadida, Département d'Informatique, El Jadida, Maroc.

---

## Licence

Ce projet est distribué sous licence **MIT**.

Voir le fichier :

```text
LICENSE
```

---

## Note SoftwareX

BloodBI Analytics est présenté comme un artefact logiciel reproductible : le code, les configurations Docker, les modèles pré-calculés, les scripts SQL, les interfaces web/mobile et la documentation permettent à un autre utilisateur de comprendre, exécuter et étendre le projet.
