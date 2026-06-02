# BloodBI Analytics

BloodBI Analytics est une plateforme décisionnelle open-source dédiée au don de sang. Elle combine :

- un **frontend web React** pour les dashboards BI ;
- un **backend Spring Boot + MySQL** pour les API REST et la persistance ;
- une **application mobile React Native Expo** inspirée de LifeDrop ;
- des scripts SQL pour la base opérationnelle, le Data Warehouse et les vues BI.

Le projet adapte l'idée HealthBI Analytics au domaine de la transfusion sanguine : donneurs, demandes de sang, stocks, centres de collecte, alertes critiques et rapports.

## Structure

```text
bloodbi-analytics/
├── backend/                 # Spring Boot + MySQL
├── frontend/                # React dashboard BI
├── mobile-app/              # React Native Expo mobile app
├── database/                # SQL schema, Data Warehouse, BI views
└── docs/                    # Architecture + article SoftwareX draft
```

## Prérequis

- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8+
- Expo Go pour tester l'application mobile sur téléphone

## 1. Lancer MySQL

Créer la base :

```sql
CREATE DATABASE bloodbi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Par défaut, le backend utilise :

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bloodbi
spring.datasource.username=root
spring.datasource.password=
```

Modifier `backend/src/main/resources/application.properties` selon votre mot de passe MySQL.

## 2. Lancer le backend Spring Boot

```bash
cd backend
mvn spring-boot:run
```

Test :

```text
http://localhost:8081/api/auth/test
```

Identifiants de test :

```text
username: admin
password: password
```

## 3. Lancer le frontend React

```bash
cd frontend
npm install
npm start
```

Ouvrir :

```text
http://localhost:3000
```

## 4. Lancer l'application mobile

Dans un autre terminal :

```bash
cd mobile-app
npm install
npx expo start
```

Si vous testez sur un téléphone physique, remplacez `localhost` par l'adresse IP locale de votre PC :

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.10:8082/api npx expo start
```

## Fonctionnalités web

- Dashboard KPI : total donneurs, demandes actives, demandes critiques, stocks critiques, taux de satisfaction.
- Donor Stats : analyse des donneurs par ville et groupe sanguin.
- Blood Requests : suivi des demandes par urgence, statut, hôpital et ville.
- Blood Stock : surveillance des stocks par groupe sanguin, composant et centre.
- Alerts : alertes critiques de pénurie, urgence ou absence de donneur compatible.
- Reports : rapports décisionnels exportables.
- Centers : liste des centres de collecte.

## Fonctionnalités mobile

- Accueil avec statistiques essentielles.
- Liste des demandes urgentes.
- Dons et réservations.
- Recherche de donneurs compatibles.
- Profil donneur.

## API principales

```text
POST /api/auth/login
GET  /api/dashboard/kpis
GET  /api/dashboard/analytics
GET  /api/donors
GET  /api/donors/compatible?bloodType=O_NEG&city=Casablanca
GET  /api/requests
GET  /api/requests/critical
GET  /api/stocks
GET  /api/stocks/critical
GET  /api/alerts?activeOnly=true
GET  /api/reports
GET  /api/centers
```

## Contribution SoftwareX

La contribution attendue est une plateforme BI santé open-source adaptée au don de sang, avec modèle de données standardisé, dashboards réutilisables et architecture multi-plateforme.

## Licence

MIT
