# Processus de Développement avec Gemini

## Description Globale du Projet

Ce projet, nommé "TTM", est une application web conçue pour tester les connaissances des utilisateurs à travers une série de quiz. L'analyse des fichiers montre des modules sur des sujets variés comme Java, Python, l'IA, et Kubernetes. L'application inclut des fonctionnalités telles qu'un classement (`leaderboard`).

Le backend est construit avec Quarkus, un framework Java, et le frontend utilise des fichiers HTML/JavaScript standards.

Ce document décrit les processus, les agents et les workflows que nous avons mis en place pour collaborer efficacement sur ce projet.

## 1. Démarrage de l'Environnement

Avant toute chose, le serveur de développement Quarkus doit être lancé.

- **Commande :** `mvn quarkus:dev`
- **Accès :** L'application est ensuite accessible sur `http://localhost:8081`.

Cette commande doit être active dans un terminal pour que les agents qui interagissent avec l'application (accessibilité, tests) puissent fonctionner.

## 2. Agents et Commandes Disponibles

Les agents suivants ont été créés pour automatiser certaines tâches. Ils sont accessibles via des commandes personnalisées.

### `start-dev`

- **Description :** Démarre l'application Quarkus en mode développement.
- **Usage :** `start-dev`

### `a11y-check`

- **Description :** Lance une analyse d'accessibilité complète sur les pages principales du site. Utilise `axe-core` piloté par Playwright en arrière-plan.
- **Usage :** `a11y-check`
- **Prérequis :** Le serveur de développement (`quarkus dev`) doit être en cours d'exécution sur le port 8081.

### `health-check`

- **Description :** Effectue une vérification de santé rapide pour s'assurer que l'application répond bien sur le port 8081.
- **Usage :** `health-check`

### `run-tests`

- **Description :** Exécute la suite de tests end-to-end (E2E) avec Playwright. Les fichiers de test sont situés dans le répertoire `/tests/e2e/`.
- **Usage :** `run-tests`
- **Prérequis :** Le serveur de développement (`quarkus dev`) doit être en cours d'exécution sur le port 8081.

### `validate-changes`

- **Description :** Lance le workflow de validation complet. Il exécute `health-check`, puis `run-tests`, et enfin `a11y-check`. C'est la commande à utiliser après toute modification.
- **Usage :** `validate-changes`

## 3. Workflow pour les Modifications de Code

Pour garantir la stabilité et la qualité du code, nous suivons un processus strict, en particulier pour les modifications de fichiers JavaScript.

### Modification d'un fichier JavaScript

Toute modification ou ajout de fonctionnalité dans un fichier JavaScript doit obligatoirement être couvert par un test.

1.  **Écriture du Test d'abord :** Avant de modifier le code source, un nouveau test doit être écrit dans le répertoire `/tests/e2e/`. Ce test doit décrire le comportement attendu ou reproduire le bug à corriger. Il est normal que ce test échoue lors de sa première exécution.
2.  **Modification du Code :** Implémenter la modification demandée dans le JavaScript concerné.
3.  **Validation :** Lancer la commande `validate-changes`. L'orchestrateur se chargera de vérifier la santé de l'application, d'exécuter les tests fonctionnels et de contrôler l'accessibilité.
4.  **Finalisation :** La tâche n'est considérée comme terminée que lorsque la commande `validate-changes` s'exécute avec succès.