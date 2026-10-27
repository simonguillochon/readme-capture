# Spec Delta

## Purpose

Réduit l'URL d'un contenu au minimum nécessaire pour le retrouver, afin que chaque item de Readme center porte une URL propre et comparable pour la détection de doublon.

## ADDED Requirements

### Requirement: Supprimer les paramètres de requête
Le nettoyage d'une URL SHALL supprimer le `?` et tout ce qui le suit, sauf pour les adresses couvertes par une exception.

#### Scenario: Nominal — Lien de newsletter avec paramètres de suivi
- **ÉTANT DONNÉ QUE** l'URL à nettoyer est « https://exemple.substack.com/p/un-article?utm_source=post-email-title&publication_id=24711&utm_medium=email »
- **LORSQUE** l'extension nettoie l'URL
- **ALORS** l'URL nettoyée est « https://exemple.substack.com/p/un-article »

#### Scenario: Alternatif — URL déjà propre
- **ÉTANT DONNÉ QUE** l'URL à nettoyer est « https://exemple.com/blog/un-article »
- **LORSQUE** l'extension nettoie l'URL
- **ALORS** l'URL nettoyée est « https://exemple.com/blog/un-article »

### Requirement: Conserver une URL sans paramètres de requête
Le nettoyage SHALL laisser inchangée une URL qui ne contient pas de `?`, y compris si elle contient un fragment `#`.

#### Scenario: Alternatif — Lien vers une section de la page sans paramètres
- **ÉTANT DONNÉ QUE** l'URL à nettoyer est « https://exemple.com/blog/un-article#conclusion »
- **LORSQUE** l'extension nettoie l'URL
- **ALORS** l'URL nettoyée est « https://exemple.com/blog/un-article#conclusion »

#### Scenario: Alternatif — Fragment après des paramètres
- **ÉTANT DONNÉ QUE** l'URL à nettoyer est « https://exemple.com/blog/un-article?utm_source=x#conclusion »
- **LORSQUE** l'extension nettoie l'URL
- **ALORS** l'URL nettoyée est « https://exemple.com/blog/un-article »

### Requirement: Conserver l'identifiant des vidéos YouTube
Pour une URL de la forme `youtube.com/watch`, y compris sur `www.youtube.com` et `m.youtube.com`, le nettoyage SHALL conserver uniquement le paramètre `v`.

#### Scenario: Alternatif — Vidéo YouTube avec horodatage et playlist
- **ÉTANT DONNÉ QUE** l'URL à nettoyer est « https://www.youtube.com/watch?v=abc123XYZ&list=PL0001&t=42s »
- **LORSQUE** l'extension nettoie l'URL
- **ALORS** l'URL nettoyée est « https://www.youtube.com/watch?v=abc123XYZ »

#### Scenario: Erreur — Vidéo YouTube sans paramètre v
- **ÉTANT DONNÉ QUE** l'URL à nettoyer est « https://www.youtube.com/watch?list=PL0001 »
- **LORSQUE** l'extension nettoie l'URL
- **ALORS** l'URL nettoyée est « https://www.youtube.com/watch »

### Requirement: Refuser une valeur qui n'est pas une URL web
Le nettoyage SHALL accepter uniquement une URL absolue en `http` ou `https`, et signaler toute autre valeur comme invalide.

#### Scenario: Erreur — Texte libre
- **ÉTANT DONNÉ QUE** la valeur à nettoyer est « un article sur le management »
- **LORSQUE** l'extension nettoie la valeur
- **ALORS** la valeur est signalée comme une URL invalide

#### Scenario: Erreur — Adresse interne du navigateur
- **ÉTANT DONNÉ QUE** la valeur à nettoyer est « about:newtab »
- **LORSQUE** l'extension nettoie la valeur
- **ALORS** la valeur est signalée comme une URL invalide
